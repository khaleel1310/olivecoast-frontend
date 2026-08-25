// 📁 frontend/src/pages/CustomerPage.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  Phone,
  User,
  Check,
  Minus,
  Plus,
  FileText,
  DollarSign,
  Leaf,
  Users,
  Clock,
} from "lucide-react";
import { api } from "../api/client";

export const CustomerPage: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [drinks, setDrinks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Form State
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [guestCount, setGuestCount] = useState<number>(80);
  const [tipPercentage, setTipPercentage] = useState<number>(0);

  // Optional fees
  const [includeDelivery, setIncludeDelivery] = useState<boolean>(false);
  const [includeServiceFee, setIncludeServiceFee] = useState<boolean>(false);

  // Track quantities for addons and drinks: { [id]: quantity }
  const [selectedAddons, setSelectedAddons] = useState<{
    [id: string]: number;
  }>({});
  const [selectedDrinks, setSelectedDrinks] = useState<{
    [id: string]: number;
  }>({});

  const [eventDetails, setEventDetails] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    eventDate: "",
    eventLocation: "",
    notes: "",
  });

  useEffect(() => {
    const fetchCateringData = async () => {
      try {
        setLoading(true);
        const [pkgRes, addonRes, drinkRes] = await Promise.all([
          api.get("/packages"),
          api.get("/packages/addons"),
          api.get("/packages/drinks").catch(() => ({ data: [] })),
        ]);

        const pkgData = pkgRes.data;
        const parsedPackages = Array.isArray(pkgData)
          ? pkgData
          : pkgData?.data && Array.isArray(pkgData.data)
            ? pkgData.data
            : [];
        setPackages(parsedPackages);

        if (parsedPackages.length > 0) {
          setSelectedPackage(parsedPackages[0]);
        }

        const addonData = addonRes.data;
        setAddons(
          Array.isArray(addonData)
            ? addonData
            : addonData?.data && Array.isArray(addonData.data)
              ? addonData.data
              : [],
        );

        const drinkData = drinkRes.data;
        setDrinks(
          Array.isArray(drinkData)
            ? drinkData
            : drinkData?.data && Array.isArray(drinkData.data)
              ? drinkData.data
              : [],
        );
      } catch (err: any) {
        console.error(err);
        setError("Unable to load catering packages.");
      } finally {
        setLoading(false);
      }
    };
    fetchCateringData();
  }, []);

  const packageDetailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPackage) {
      packageDetailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedPackage]);

  // Addon quantity handlers
  const updateAddonQty = (id: string, delta: number) => {
    setSelectedAddons((prev) => {
      const current = prev[id] || 0;
      const nextVal = Math.max(0, current + delta);
      if (nextVal === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: nextVal };
    });
  };

  // Drink quantity handlers
  const updateDrinkQty = (id: string, delta: number) => {
    setSelectedDrinks((prev) => {
      const current = prev[id] || 0;
      const nextVal = Math.max(0, current + delta);
      if (nextVal === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: nextVal };
    });
  };

  // Financial Calculations matching backend logic
  const packageUnitPrice = selectedPackage
    ? parseFloat(selectedPackage.pricePerPerson)
    : 0;
  const packageTotal = packageUnitPrice * guestCount;

  const addonsTotal = Object.entries(selectedAddons).reduce(
    (sum, [addonId, qty]) => {
      const addon = addons.find((a) => a.id === addonId);
      return sum + (addon ? parseFloat(addon.pricePerPerson) * qty : 0);
    },
    0,
  );

  const drinksTotal = Object.entries(selectedDrinks).reduce(
    (sum, [drinkId, qty]) => {
      const drink = drinks.find((d) => d.id === drinkId);
      return sum + (drink ? parseFloat(drink.pricePerPerson) * qty : 0);
    },
    0,
  );

  const foodAndDrinksSubtotal = packageTotal + addonsTotal + drinksTotal;

  // Optional fees
  const serviceFee = includeServiceFee ? foodAndDrinksSubtotal * 0.1 : 0;

  const deliveryFee = includeDelivery ? 100.0 : 0;

  const subtotalWithExtras = foodAndDrinksSubtotal + serviceFee + deliveryFee;

  const tax = subtotalWithExtras * 0.08;
  const tipAmount = subtotalWithExtras * tipPercentage;

  const grandTotal = subtotalWithExtras + tax + tipAmount;
  const downPayment = grandTotal * 0.25;
  const effectivePerPerson = guestCount > 0 ? grandTotal / guestCount : 0;

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage)
      return alert("Please select a catering package first.");
    if (guestCount < 20) return alert("Minimum guest count is 20.");

    try {
      const formattedAddons = Object.entries(selectedAddons).map(
        ([id, qty]) => ({ addonId: id, quantity: qty }),
      );
      const formattedDrinks = Object.entries(selectedDrinks).map(
        ([id, qty]) => ({ drinkId: id, quantity: qty }),
      );

      const response = await api.post("/bookings", {
        packageId: selectedPackage.id,
        guestCount,
        eventDate: new Date(eventDetails.eventDate).toISOString(),
        eventLocation: eventDetails.eventLocation,
        customerName: eventDetails.customerName,
        customerEmail: eventDetails.customerEmail || null,
        customerPhone: eventDetails.customerPhone,
        notes: eventDetails.notes,
        addons: formattedAddons,
        drinks: formattedDrinks,
        tipPercentage,
        includeDelivery,
        includeServiceFee,
      });

      // Redirect to Stripe Checkout Session URL if provided
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        alert(
          `Booking Request Submitted! Reference Number: ${response.data.bookingNumber}`,
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit booking request. Please check your details.");
    }
  };

  const getFormattedIncludedItems = (pkg: any) => {
    if (!pkg) return [];
    let items = pkg.includedItems || pkg.features || pkg.items;

    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        return [items];
      }
    }

    if (!items) return [];

    if (typeof items === "object" && !Array.isArray(items)) {
      const results: { category: string; list: string[] }[] = [];
      for (const [key, val] of Object.entries(items)) {
        if (Array.isArray(val) && val.length > 0) {
          const formattedCategory = key.replace(/_/g, " ");
          results.push({ category: formattedCategory, list: val as string[] });
        }
      }
      return results;
    }

    if (Array.isArray(items)) {
      return [{ category: "Included Items", list: items }];
    }

    return [];
  };

  const categorizedItems = getFormattedIncludedItems(selectedPackage);

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col font-sans selection:bg-[#0B2240] selection:text-white">
      {/* Brand Header with Nav Links */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EFECE6] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#EFECE6] p-1 flex items-center justify-center shrink-0">
              <img
                src="/assets/Olive_Coast_Logo.jpg"
                alt="Logo"
                className="h-full w-full object-contain scale-110"
              />
            </div>

            <div>
              <h1 className="text-xl font-serif font-bold text-[#0B2240] tracking-wide leading-tight">
                OLIVE COAST
              </h1>
              <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#607A41] uppercase block mt-0.5">
                Premium Event Catering
              </span>
            </div>
          </div>

          {/* Navigation Links matching UI */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-[#0B2240]">
            <a
              href="#packages"
              className="hover:text-[#607A41] transition-colors"
            >
              Packages
            </a>
            <a
              href="#guests"
              className="hover:text-[#607A41] transition-colors"
            >
              Guests
            </a>
            <a
              href="#food-upgrades"
              className="hover:text-[#607A41] transition-colors"
            >
              Food Upgrades
            </a>
            <a
              href="#drinks"
              className="hover:text-[#607A41] transition-colors"
            >
              Drinks & Beverages
            </a>
            <a
              href="#logistics"
              className="hover:text-[#607A41] transition-colors"
            >
              Event Logistics
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="tel:+18036161856"
              className="flex items-center gap-2 text-xs font-bold text-white bg-[#0B2240] px-4 py-2 rounded-lg shadow-sm hover:bg-[#15345b] transition-colors"
            >
              <Phone size={14} />
              <span>+1 (803) 616-1856</span>
            </a>
          </div>
        </div>
      </header>

      <section className="relative min-h-screen w-full overflow-hidden bg-[#0B2240]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/assets/service-weddings-BG8t11UT.jpg"
            alt="Mediterranean catering table"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Cinematic Overlay */}
        <div className="absolute inset-0 bg-black/25"></div>

        {/* Darker bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-[#0B170F]/90"></div>

        {/* Subtle left-side darkening */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent"></div>

        {/* =========================
      HERO CONTENT
  ========================= */}
        <div className="relative z-10 min-h-[calc(100vh-100px)] max-w-[1180px] mx-auto px-6 lg:px-10 flex items-end pb-20 lg:pb-24">
          <div className="max-w-[760px]">
            {/* Main Heading */}
            <h1 className="font-serif text-white text-5xl sm:text-6xl lg:text-[72px] leading-[0.98] tracking-[-0.025em] font-normal">
              The Mediterranean table,
              <br />
              brought to your celebration
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-[650px] text-sm sm:text-base leading-7 text-white/85 font-light">
              Chef-crafted collections built on olive oil, citrus, charcoal and
              the generosity of a long table shared with people you love.
            </p>
            {/* Working Hours */}
            <div className="mt-5 text-white/80 text-xs sm:text-sm">
              <span className="font-semibold text-white">Open daily</span>
              <span className="mx-2 text-white/40">•</span>
              <span>Sun–Thu: 11 AM–10 PM</span>
              <span className="mx-2 text-white/40">•</span>
              <span>Fri–Sat: 11 AM–12 AM</span>
            </div>

            {/* CTA Buttons */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#guests"
                className="px-9 py-4 bg-[#D56A38] text-white text-[10px] font-bold tracking-[0.25em] uppercase hover:bg-[#C45C2D] transition-colors"
              >
                Build Your Event
              </a>

              <a
                href="#about-us"
                className="px-9 py-4 border border-white/45 bg-black/10 text-white text-[10px] font-bold tracking-[0.25em] uppercase hover:bg-white hover:text-[#0B2240] transition-all"
              >
                Meet Our Story
              </a>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <Loader2 size={32} className="animate-spin text-[#607A41]" />
            <p className="text-sm font-medium text-slate-500">
              Curating catering options...
            </p>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-start gap-4 text-rose-800 my-12">
            <AlertCircle size={24} className="shrink-0 text-rose-500" />
            <p className="text-xs text-rose-600/90 leading-relaxed">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <section id="about-us" className="bg-[#FBF9F6] py-20 sm:py-28">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                  {/* Image */}
                  <div className="relative order-2 lg:order-1">
                    <div className="relative rounded-3xl overflow-hidden border border-[#EFECE6] shadow-lg bg-[#FAF8F5]">
                      <img
                        src="/assets/about-olive-coast.jpg"
                        alt="Olive Coast Mediterranean kitchen spread"
                        className="w-full h-[400px] sm:h-[500px] object-cover"
                      />
                    </div>
                    {/* Floating badge */}
                    <div className="absolute -bottom-6 -right-6 sm:bottom-8 sm:right-8 bg-white rounded-2xl shadow-xl border border-[#EFECE6] p-5 max-w-[220px]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#0B2240] flex items-center justify-center text-white shrink-0">
                          <Users size={22} />
                        </div>
                        <div>
                          <p className="text-2xl font-serif font-bold text-[#0B2240]">
                            20+
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Guests per event
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-6 order-1 lg:order-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D56A38]">
                      Our Story
                    </span>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#0B2240] leading-[1.1]">
                      The Mediterranean table,
                      <span className="text-[#607A41]">
                        {" "}
                        made for gathering
                      </span>
                    </h2>

                    <p className="text-sm sm:text-base text-slate-600 leading-7 font-light">
                      Olive Coast was built on a simple idea: great food brings
                      people together. We craft chef-inspired Mediterranean
                      collections for events of all kinds — weddings, corporate
                      dinners, family celebrations, and everything in between.
                    </p>

                    <p className="text-sm sm:text-base text-slate-600 leading-7 font-light">
                      Every collection is prepared with fresh olive oil, citrus,
                      herbs, and the same care we would serve at our own table.
                      From hummus and falafel to grilled vegetables and artisan
                      bread, we keep the flavors honest, the portions generous,
                      and the experience effortless.
                    </p>

                    {/* Feature grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0B2240]/5 flex items-center justify-center text-[#0B2240] shrink-0">
                          <Leaf size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#0B2240]">
                            Fresh Ingredients
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Olive oil, herbs, and seasonal produce in every
                            dish.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0B2240]/5 flex items-center justify-center text-[#0B2240] shrink-0">
                          <Users size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#0B2240]">
                            Made for Groups
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Designed for events of 20 guests and up.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0B2240]/5 flex items-center justify-center text-[#0B2240] shrink-0">
                          <Clock size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#0B2240]">
                            Event-Day Ready
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Prepared fresh and delivered on your schedule.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0B2240]/5 flex items-center justify-center text-[#0B2240] shrink-0">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#0B2240]">
                            Local Delivery
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            We bring the table to your venue.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="pt-4">
                      <a
                        href="#packages"
                        className="inline-flex items-center justify-center px-8 py-4 bg-[#0B2240] text-white text-[10px] font-bold tracking-[0.25em] uppercase hover:bg-[#15345b] transition-colors rounded-xl"
                      >
                        Explore Our Collections
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {/* Kitchen Info / Hours Section with [photo 2] */}
            <section className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-3xl border border-[#EFECE6] shadow-sm">
              {/* Image */}
              <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#EFECE6]">
                <img
                  src="/assets/Event.png"
                  alt="Chef preparing food"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-8 space-y-6 sm:p-12">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C05621]">
                  Kitchen Hours
                </span>

                <h3 className="text-3xl font-serif font-bold text-[#0B2240]">
                  A kitchen built around your event day
                </h3>

                <div className="border-t border-[#EFECE6] divide-y divide-[#EFECE6] text-sm">
                  <div className="py-3 flex justify-between font-medium text-slate-600">
                    <span>Mon - Sat</span>
                    <span className="font-bold text-[#0B2240]">
                      11:00 AM - 10:00 PM
                    </span>
                  </div>

                  <div className="py-3 flex justify-between font-medium text-slate-600">
                    <span>Sunday</span>
                    <span className="font-bold text-[#0B2240]">
                      12:00 PM - 9:00 PM
                    </span>
                  </div>

                  <div className="py-3 flex justify-between font-medium text-slate-600">
                    <span>Minimum</span>
                    <span className="font-bold text-[#0B2240]">
                      20 guests required
                    </span>
                  </div>

                  <div className="py-3 flex justify-between font-medium text-slate-600">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-[#0B2240]">$100.00</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Included in Every Collection Banner with [photo 3] */}
            <section className="mb-16 rounded-3xl overflow-hidden bg-[#0A2015] text-white grid grid-cols-1 lg:grid-cols-2 shadow-md">
              {/* Image */}
              <div className="relative min-h-[300px] lg:min-h-[400px]">
                <img
                  src="/assets/package-Vigi.jpg"
                  alt="Vigi package"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-8 sm:p-12 flex flex-col justify-center space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A3B899]">
                  Included in Every Collection
                </span>

                <blockquote className="text-2xl sm:text-3xl font-serif italic text-white leading-relaxed">
                  "Freshly prepared meals delivered straight to your table or
                  counter."
                </blockquote>

                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Clean, fast, and secure checkout. Secure checkout powered by
                  Stripe. Remaining balance due on event day.
                </p>

                <div className="pt-2">
                  <a
                    href="#guests"
                    className="inline-block px-6 py-3 bg-white text-[#0B2240] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors"
                  >
                    Build Your Event
                  </a>
                </div>
              </div>
            </section>

            <form
              onSubmit={handleSubmitBooking}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
            >
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-10">
                {/* Step 1: How many guests? */}
                <section id="guests" className="space-y-4 scroll-mt-28">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C05621] block mb-1">
                        Step One
                      </span>
                      <h2 className="text-xl font-serif font-bold text-[#0B2240]">
                        1. How many guests?
                      </h2>
                    </div>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      Minimum 20 guests required
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-white border border-[#EFECE6] rounded-2xl p-1.5 shadow-sm">
                      <button
                        type="button"
                        onClick={() =>
                          setGuestCount(Math.max(20, guestCount - 5))
                        }
                        className="w-10 h-10 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#0B2240] hover:bg-[#EFECE6] transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        min="20"
                        value={guestCount}
                        onChange={(e) =>
                          setGuestCount(
                            Math.max(20, parseInt(e.target.value) || 20),
                          )
                        }
                        className="w-16 text-center font-black text-[#0B2240] text-lg bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setGuestCount(guestCount + 5)}
                        className="w-10 h-10 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#0B2240] hover:bg-[#EFECE6] transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {[20, 50, 80, 100, 200].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setGuestCount(preset)}
                        className={`px-4 py-3 rounded-2xl font-bold text-xs transition-all border ${
                          guestCount === preset
                            ? "bg-[#0B2240] text-white border-[#0B2240] shadow-sm"
                            : "bg-white text-[#0B2240] border-[#EFECE6] hover:border-[#DCD7CC]"
                        }`}
                      >
                        {preset} guests
                      </button>
                    ))}
                  </div>
                </section>

                {/* Step 2: Pick a package */}
                <section id="packages" className="space-y-4 scroll-mt-28">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C05621]">
                    Step Two
                  </span>

                  <h2 className="text-xl font-serif font-bold text-[#0B2240]">
                    2. Pick a package
                  </h2>

                  {/* Package Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {packages.map((pkg) => {
                      const isSelected = selectedPackage?.id === pkg.id;

                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all bg-white shadow-sm flex flex-col justify-between ${
                            isSelected
                              ? "border-[#0B2240] ring-2 ring-[#0B2240]/10 bg-white"
                              : "border-[#EFECE6] hover:border-[#DCD7CC]"
                          }`}
                        >
                          {/* Selected Check */}
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-[#0B2240] text-white rounded-full flex items-center justify-center shadow-sm">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          )}

                          {/* Package Info */}
                          <div>
                            <h3 className="font-bold text-[#0B2240] text-base">
                              {pkg.name}
                            </h3>

                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {pkg.description}
                            </p>
                          </div>

                          {/* Price */}
                          <div className="mt-4 pt-3 border-t border-[#FAF8F5]">
                            <span className="font-black text-[#0B2240] text-base">
                              ${parseFloat(pkg.pricePerPerson).toFixed(2)}
                            </span>

                            <span className="text-xs text-slate-400 font-medium">
                              {" "}
                              /guest
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {selectedPackage && (
                    <div
                      ref={packageDetailsRef}
                      className="scroll-mt-28 p-6 bg-[#FAF8F5] rounded-2xl border border-[#EFECE6] transition-all space-y-4"
                    >
                      <p className="text-xs font-black text-[#0B2240] uppercase tracking-wider">
                        Included in {selectedPackage.name}:
                      </p>

                      {categorizedItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {categorizedItems.map((group, idx) => (
                            <div key={idx} className="space-y-1.5">
                              <span className="text-[11px] font-bold text-[#607A41] uppercase tracking-wider block">
                                {group.category}
                              </span>

                              <ul className="space-y-1">
                                {group.list.map(
                                  (item: string, itemIdx: number) => (
                                    <li
                                      key={itemIdx}
                                      className="flex items-center gap-2 text-xs text-slate-700 font-medium"
                                    >
                                      <Check
                                        size={13}
                                        className="text-[#0B2240] shrink-0"
                                      />

                                      <span>{item}</span>
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">
                          No specific items listed for this package.
                        </p>
                      )}
                    </div>
                  )}
                </section>

                {/* Step 3 & 4: Upgrades & Drinks */}
                <div
                  id="food-upgrades"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 scroll-mt-28"
                >
                  {addons.length > 0 && (
                    <section className="space-y-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C05621] block mb-1">
                          Step Three
                        </span>
                        <h2 className="text-lg font-serif font-bold text-[#0B2240]">
                          3. Food Upgrades
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Priced per unit/guest.
                        </p>
                      </div>
                      <div className="space-y-2">
                        {addons.map((addon) => {
                          const qty = selectedAddons[addon.id] || 0;
                          return (
                            <div
                              key={addon.id}
                              className="bg-white p-3 rounded-2xl border border-[#EFECE6] flex items-center justify-between shadow-sm"
                            >
                              <div>
                                <p className="text-xs font-bold text-[#0B2240]">
                                  {addon.name}
                                </p>
                                <span className="text-[11px] text-[#607A41] font-medium">
                                  +$
                                  {parseFloat(addon.pricePerPerson).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateAddonQty(addon.id, -1)}
                                  className="w-8 h-8 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#0B2240] hover:bg-[#EFECE6]"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-6 text-center text-xs font-bold">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateAddonQty(addon.id, 1)}
                                  className="w-8 h-8 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#0B2240] hover:bg-[#EFECE6]"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {drinks.length > 0 && (
                    <section id="drinks" className="space-y-3 scroll-mt-28">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C05621] block mb-1">
                          Step Four
                        </span>
                        <h2 className="text-lg font-serif font-bold text-[#0B2240]">
                          4. Drinks & Beverages
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Optional beverage catalog.
                        </p>
                      </div>
                      <div className="space-y-2">
                        {drinks.map((drink) => {
                          const qty = selectedDrinks[drink.id] || 0;
                          return (
                            <div
                              key={drink.id}
                              className="bg-white p-3 rounded-2xl border border-[#EFECE6] flex items-center justify-between shadow-sm"
                            >
                              <div>
                                <p className="text-xs font-bold text-[#0B2240]">
                                  {drink.name}
                                </p>
                                <span className="text-[11px] text-[#607A41] font-medium">
                                  +$
                                  {parseFloat(drink.pricePerPerson).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateDrinkQty(drink.id, -1)}
                                  className="w-8 h-8 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#0B2240] hover:bg-[#EFECE6]"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-6 text-center text-xs font-bold">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateDrinkQty(drink.id, 1)}
                                  className="w-8 h-8 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#0B2240] hover:bg-[#EFECE6]"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>

                {/* Step 5: Event Logistics & Notes */}
                <section
                  id="logistics"
                  className="space-y-4 pt-4 border-t border-[#EFECE6] scroll-mt-28"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C05621] block mb-1">
                      Step Five
                    </span>
                    <h2 className="text-xl font-serif font-bold text-[#0B2240]">
                      5. Event Logistics & Notes
                    </h2>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-[#EFECE6] shadow-sm space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 mb-1.5">
                          <Calendar size={12} /> Event Date
                        </label>
                        <input
                          type="date"
                          required
                          value={eventDetails.eventDate}
                          onChange={(e) =>
                            setEventDetails({
                              ...eventDetails,
                              eventDate: e.target.value,
                            })
                          }
                          className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 mb-1.5">
                          <User size={12} /> Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={eventDetails.customerName}
                          onChange={(e) =>
                            setEventDetails({
                              ...eventDetails,
                              customerName: e.target.value,
                            })
                          }
                          className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 mb-1.5">
                          <Phone size={12} /> Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+1 234 567 8900"
                          value={eventDetails.customerPhone}
                          onChange={(e) =>
                            setEventDetails({
                              ...eventDetails,
                              customerPhone: e.target.value,
                            })
                          }
                          className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 mb-1.5">
                          <MapPin size={12} /> Event Location / Venue
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Full venue address"
                          value={eventDetails.eventLocation}
                          onChange={(e) =>
                            setEventDetails({
                              ...eventDetails,
                              eventLocation: e.target.value,
                            })
                          }
                          className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 mb-1.5">
                        <FileText size={12} /> Special Instructions / Dietary
                        Notes
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Any allergies, custom setups, or specific requests..."
                        value={eventDetails.notes}
                        onChange={(e) =>
                          setEventDetails({
                            ...eventDetails,
                            notes: e.target.value,
                          })
                        }
                        className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]"
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Sticky Quote Summary Card */}
              <div className="lg:col-span-1 sticky top-28">
                <div className="bg-[#12231A] text-white p-6 rounded-3xl shadow-md border border-[#1C3527] space-y-6">
                  <div>
                    <span className="text-xs text-slate-300 font-bold uppercase tracking-wider block">
                      Your estimate
                    </span>
                    <div className="text-3xl font-black text-white mt-1">
                      $
                      {grandTotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <span className="text-xs text-slate-300 font-medium">
                      ${effectivePerPerson.toFixed(2)} per guest
                    </span>
                  </div>

                  <div className="border-t border-[#1C3527] pt-4 space-y-3 text-sm">
                    {selectedPackage ? (
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-slate-300">
                          {selectedPackage.name} × {guestCount}
                        </span>
                        <span className="font-bold text-white">
                          $
                          {packageTotal.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-rose-400 italic">
                        Please select a package.
                      </p>
                    )}

                    {Object.entries(selectedAddons).map(([id, qty]) => {
                      const addon = addons.find((a) => a.id === id);
                      if (!addon) return null;
                      const addonCost = parseFloat(addon.pricePerPerson) * qty;
                      return (
                        <div
                          key={id}
                          className="flex justify-between items-center text-xs"
                        >
                          <span className="text-slate-300">
                            {addon.name} × {qty}
                          </span>
                          <span className="font-medium text-white">
                            +$
                            {addonCost.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      );
                    })}

                    {Object.entries(selectedDrinks).map(([id, qty]) => {
                      const drink = drinks.find((d) => d.id === id);
                      if (!drink) return null;
                      const drinkCost = parseFloat(drink.pricePerPerson) * qty;
                      return (
                        <div
                          key={id}
                          className="flex justify-between items-center text-xs"
                        >
                          <span className="text-slate-300">
                            {drink.name} × {qty}
                          </span>
                          <span className="font-medium text-white">
                            +$
                            {drinkCost.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Fees & Tips Breakdown */}
                  <div className="border-t border-[#1C3527] pt-4 space-y-3 text-xs">
                    {/* Delivery Option */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-slate-300 block">Delivery</span>
                        <span className="text-[10px] text-slate-500">
                          Optional • $100.00
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIncludeDelivery(!includeDelivery)}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                          includeDelivery ? "bg-[#607A41]" : "bg-[#CBD5C0]"
                        }`}
                        aria-pressed={includeDelivery}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            includeDelivery ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Service Fee Option */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-slate-300 block">
                          Service Fee
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Optional • 10%
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIncludeServiceFee(!includeServiceFee)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          includeServiceFee ? "bg-[#607A41]" : "bg-[#CBD5C0]"
                        }`}
                        aria-pressed={includeServiceFee}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            includeServiceFee
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Selected Delivery Fee */}
                    {includeDelivery && (
                      <div className="flex justify-between text-slate-300">
                        <span>Delivery Fee</span>
                        <span>
                          $
                          {deliveryFee.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}

                    {/* Selected Service Fee */}
                    {includeServiceFee && (
                      <div className="flex justify-between text-slate-300">
                        <span>Service Fee (10%)</span>
                        <span>
                          $
                          {serviceFee.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}

                    {/* Tax */}
                    <div className="flex justify-between text-slate-300">
                      <span>Estimated Tax (8%)</span>
                      <span>
                        $
                        {tax.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {/* Tip Selector */}
                    <div className="pt-2">
                      <span className="text-[10px] font-bold uppercase text-slate-300 block mb-1.5">
                        Add a Tip
                      </span>

                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { label: "0%", value: 0 },
                          { label: "2.5%", value: 0.025 },
                          { label: "5%", value: 0.05 },
                          { label: "7.5%", value: 0.075 },
                        ].map((tip) => (
                          <button
                            key={tip.label}
                            type="button"
                            onClick={() => setTipPercentage(tip.value)}
                            className={`py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                              tipPercentage === tip.value
                                ? "bg-white text-[#0B2240] border-white"
                                : "bg-[#1C3527] text-slate-300 border-[#2A4D39] hover:border-slate-400"
                            }`}
                          >
                            {tip.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tip Amount */}
                    {tipAmount > 0 && (
                      <div className="flex justify-between text-slate-300 pt-1">
                        <span>Tip Amount</span>
                        <span>
                          $
                          {tipAmount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}

                    {/* Down Payment */}
                    <div className="flex justify-between font-bold text-white pt-3 border-t border-dashed border-[#1C3527]">
                      <span>Refundable Down Payment (25%)</span>
                      <span>
                        $
                        {downPayment.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-300 italic">
                      The down payment is fully refundable if canceled within 72
                      hours of placing the order.
                    </p>
                  </div>

                  <div className="border-t border-[#1C3527] pt-4">
                    <button
                      type="submit"
                      disabled={
                        !selectedPackage ||
                        guestCount < 20 ||
                        !eventDetails.customerName ||
                        !eventDetails.eventDate ||
                        !eventDetails.eventLocation ||
                        !eventDetails.customerPhone
                      }
                      className="w-full py-4 bg-white text-[#0B2240] rounded-2xl text-sm font-bold shadow-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <DollarSign size={16} /> Pay 25% Down Payment via Stripe
                    </button>
                    <p className="text-[11px] text-center text-slate-300 mt-3 leading-relaxed">
                      Secure checkout powered by Stripe. Remaining balance due
                      on event day.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
};
