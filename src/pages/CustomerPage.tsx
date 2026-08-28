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
} from "lucide-react";
import { api } from "../api/client";
import { Hero } from "../components/Hero";
import { AboutUs } from "../components/AboutUs";
import { Header } from "../components/Header";
import { KitchenInfo } from "../components/KitchenInfo";
import { PackageCard } from "../components/PackageCard";
import { IncludedBanner } from "../components/IncludedBanner";

export const CustomerPage: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [drinks, setDrinks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // BOOKING MODE
  // ============================================================
  // This is frontend-only.
  // It does NOT change the backend API or booking payload.
  const [bookingMode, setBookingMode] = useState<"catering" | "wedding">(
    "catering"
  );

  // Booking Form State
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [guestCount, setGuestCount] = useState<number>(80);
  const [tipPercentage, setTipPercentage] = useState<number>(0);

  // Optional fees
  const [includeDelivery, setIncludeDelivery] = useState<boolean>(false);
  const [includeServiceFee, setIncludeServiceFee] =
    useState<boolean>(false);

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

  // ============================================================
  // FETCH CATERING DATA
  // ============================================================

  useEffect(() => {
    const fetchCateringData = async () => {
      try {
        setLoading(true);

        // KEEPING THE SAME API CALLS
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

        // Default to the first NON-LUXURY package.
        // This makes sure normal catering never starts with Luxury.
        const firstCateringPackage = parsedPackages.find(
          (pkg: any) => pkg.name !== "Luxury Collection"
        );

        if (firstCateringPackage) {
          setSelectedPackage(firstCateringPackage);
        } else if (parsedPackages.length > 0) {
          setSelectedPackage(parsedPackages[0]);
        }

        const addonData = addonRes.data;

        setAddons(
          Array.isArray(addonData)
            ? addonData
            : addonData?.data && Array.isArray(addonData.data)
              ? addonData.data
              : []
        );

        const drinkData = drinkRes.data;

        setDrinks(
          Array.isArray(drinkData)
            ? drinkData
            : drinkData?.data && Array.isArray(drinkData.data)
              ? drinkData.data
              : []
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

  // ============================================================
  // PACKAGE DETAILS SCROLL
  // ============================================================

  const packageDetailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPackage) {
      packageDetailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedPackage]);

  // ============================================================
  // BOOKING MODE HANDLER
  // ============================================================

  const handleModeChange = (mode: "catering" | "wedding") => {
    setBookingMode(mode);

    if (mode === "wedding") {
      // Wedding mode only uses Luxury Collection.
      const luxuryPackage = packages.find(
        (pkg) => pkg.name === "Luxury Collection"
      );

      if (luxuryPackage) {
        setSelectedPackage(luxuryPackage);
      } else {
        setSelectedPackage(null);
      }
    } else {
      // Catering mode excludes Luxury Collection.
      const firstCateringPackage = packages.find(
        (pkg) => pkg.name !== "Luxury Collection"
      );

      if (firstCateringPackage) {
        setSelectedPackage(firstCateringPackage);
      } else {
        setSelectedPackage(null);
      }
    }

    // Scroll back toward the beginning of the ordering experience.
    window.setTimeout(() => {
      document.getElementById("ordering-experience")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  // ============================================================
  // ADDON QUANTITY HANDLERS
  // ============================================================

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

  // ============================================================
  // DRINK QUANTITY HANDLERS
  // ============================================================

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

  // ============================================================
  // FINANCIAL CALCULATIONS
  // ============================================================

  const packageUnitPrice = selectedPackage
    ? parseFloat(selectedPackage.pricePerPerson)
    : 0;

  const packageTotal = packageUnitPrice * guestCount;

  const addonsTotal = Object.entries(selectedAddons).reduce(
    (sum, [addonId, qty]) => {
      const addon = addons.find((a) => a.id === addonId);

      return (
        sum + (addon ? parseFloat(addon.pricePerPerson) * qty : 0)
      );
    },
    0
  );

  const drinksTotal = Object.entries(selectedDrinks).reduce(
    (sum, [drinkId, qty]) => {
      const drink = drinks.find((d) => d.id === drinkId);

      return (
        sum + (drink ? parseFloat(drink.pricePerPerson) * qty : 0)
      );
    },
    0
  );

  const foodAndDrinksSubtotal =
    packageTotal + addonsTotal + drinksTotal;

  // Optional fees
  const serviceFee = includeServiceFee
    ? foodAndDrinksSubtotal * 0.1
    : 0;

  const deliveryFee = includeDelivery ? 100.0 : 0;

  const subtotalWithExtras =
    foodAndDrinksSubtotal + serviceFee + deliveryFee;

  const tax = subtotalWithExtras * 0.08;

  const tipAmount = subtotalWithExtras * tipPercentage;

  const grandTotal = subtotalWithExtras + tax + tipAmount;

  const downPayment = grandTotal * 0.30;

  const effectivePerPerson =
    guestCount > 0 ? grandTotal / guestCount : 0;

  // ============================================================
  // SUBMIT BOOKING
  // ============================================================

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPackage) {
      return alert("Please select a catering package first.");
    }

    if (guestCount < 20) {
      return alert("Minimum guest count is 20.");
    }

    try {
      const formattedAddons = Object.entries(selectedAddons).map(
        ([id, qty]) => ({
          addonId: id,
          quantity: qty,
        })
      );

      const formattedDrinks = Object.entries(selectedDrinks).map(
        ([id, qty]) => ({
          drinkId: id,
          quantity: qty,
        })
      );

      // ========================================================
      // IMPORTANT:
      // THE BACKEND PAYLOAD IS UNCHANGED.
      // No bookingMode / bookingType is being added.
      // ========================================================

      const response = await api.post("/bookings", {
        packageId: selectedPackage.id,
        guestCount,
        eventDate: new Date(
          eventDetails.eventDate
        ).toISOString(),
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
          `Booking Request Submitted! Reference Number: ${response.data.bookingNumber}`
        );
      }
    } catch (err) {
      console.error(err);

      alert(
        "Failed to submit booking request. Please check your details."
      );
    }
  };

  // ============================================================
  // INCLUDED ITEMS FORMATTER
  // ============================================================

  const getFormattedIncludedItems = (pkg: any) => {
    if (!pkg) return [];

    let items =
      pkg.includedItems ||
      pkg.features ||
      pkg.items;

    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        return [items];
      }
    }

    if (!items) return [];

    if (
      typeof items === "object" &&
      !Array.isArray(items)
    ) {
      const results: {
        category: string;
        list: string[];
      }[] = [];

      for (const [key, val] of Object.entries(items)) {
        if (Array.isArray(val) && val.length > 0) {
          const formattedCategory = key.replace(/_/g, " ");

          results.push({
            category: formattedCategory,
            list: val as string[],
          });
        }
      }

      return results;
    }

    if (Array.isArray(items)) {
      return [
        {
          category: "Included Items",
          list: items,
        },
      ];
    }

    return [];
  };

  const categorizedItems =
    getFormattedIncludedItems(selectedPackage);

  // ============================================================
  // PACKAGE IMAGES
  // ============================================================

  const packageImages: Record<string, string> = {
    "Classic Collection":
      "/assets/classic-collection.jpg",

    "Signature Collection":
      "/assets/signature-collection.jpg",

    "Vegetarian Collection":
      "/assets/vegetarian-collection.jpg",

    "Mediterranean Collection":
      "/assets/mediterranean-collection.jpg",

    "Luxury Collection":
      "/assets/luxury-collection.jpg",
  };

  // ============================================================
  // MODE-SPECIFIC PACKAGES
  // ============================================================

  const cateringPackages = packages.filter(
    (pkg) => pkg.name !== "Luxury Collection"
  );

  const weddingPackages = packages.filter(
    (pkg) => pkg.name === "Luxury Collection"
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col font-sans selection:bg-[#0B2240] selection:text-white">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <Header />

      {/* ======================================================
          HERO
      ====================================================== */}

      <Hero />

      {/* ======================================================
          ABOUT
      ====================================================== */}

      <AboutUs />

      <KitchenInfo />

      <IncludedBanner />

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <Loader2
              size={32}
              className="animate-spin text-[#607A41]"
            />

            <p className="text-sm font-medium text-slate-500">
              Curating catering options...
            </p>
          </div>
        )}

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="max-w-md mx-auto bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-start gap-4 text-rose-800 my-12">
            <AlertCircle
              size={24}
              className="shrink-0 text-rose-500"
            />

            <p className="text-xs text-rose-600/90 leading-relaxed">
              {error}
            </p>
          </div>
        )}

        {/* ====================================================
            ORDERING EXPERIENCE
        ==================================================== */}

        {!loading && !error && (
          <>
            {/* ==================================================
                MODE SELECTOR
            ================================================== */}

            <section
              id="ordering-experience"
              className="mb-12 scroll-mt-28"
            >
              <div className="text-center max-w-3xl mx-auto mb-7">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C05621] block mb-2">
                  Catering Experience
                </span>

                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0B2240]">
                  Choose Your Experience
                </h2>

                <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                  Whether you're planning a gathering or one of
                  life's most important celebrations, start by
                  choosing the experience that fits your event.
                </p>
              </div>

              {/* Mode Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">

                {/* ==================================================
                    CATERING MODE
                ================================================== */}

                <button
                  type="button"
                  onClick={() =>
                    handleModeChange("catering")
                  }
                  className={`group relative overflow-hidden rounded-3xl border text-left transition-all duration-300 ${
                    bookingMode === "catering"
                      ? "border-[#0B2240] ring-2 ring-[#0B2240]/10 shadow-lg"
                      : "border-[#EFECE6] hover:border-[#DCD7CC] shadow-sm"
                  }`}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src="/assets/f5fde930-72f2-4490-92dc-f553b87faba0.jpg"
                      alt="Mediterranean catering"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B2240]/85 via-[#0B2240]/20 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                        Classic Catering
                      </span>

                      <h3 className="text-2xl font-serif font-bold mt-1">
                        Catering
                      </h3>

                      <p className="text-xs text-white/80 mt-2 max-w-md leading-relaxed">
                        Mediterranean catering for gatherings,
                        celebrations, and special events.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#0B2240]">
                        Standard Catering
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Classic, Signature, Vegetarian &
                        Mediterranean collections
                      </p>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${
                        bookingMode === "catering"
                          ? "bg-[#0B2240] border-[#0B2240] text-white"
                          : "border-[#DCD7CC] text-transparent"
                      }`}
                    >
                      <Check size={15} />
                    </div>
                  </div>
                </button>

                {/* ==================================================
                    WEDDING MODE
                ================================================== */}

                <button
                  type="button"
                  onClick={() =>
                    handleModeChange("wedding")
                  }
                  className={`group relative overflow-hidden rounded-3xl border text-left transition-all duration-300 ${
                    bookingMode === "wedding"
                      ? "border-[#607A41] ring-2 ring-[#607A41]/10 shadow-lg"
                      : "border-[#EFECE6] hover:border-[#DCD7CC] shadow-sm"
                  }`}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src="/assets/wedding.jpg"
                      alt="Wedding catering"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#12231A]/90 via-[#12231A]/30 to-transparent" />

                    <div className="absolute top-5 right-5">
                      <span className="px-3 py-1.5 rounded-full bg-white/90 text-[#0B2240] text-[9px] font-black uppercase tracking-widest shadow-sm">
                        Special Experience
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                        For Your Special Day
                      </span>

                      <h3 className="text-2xl font-serif font-bold mt-1">
                        Build Your Wedding
                      </h3>

                      <p className="text-xs text-white/80 mt-2 max-w-md leading-relaxed">
                        Begin with our Luxury Collection and
                        build your Mediterranean wedding
                        catering experience.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#0B2240]">
                        Wedding Catering
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Luxury Collection with wedding-focused
                        presentation
                      </p>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${
                        bookingMode === "wedding"
                          ? "bg-[#607A41] border-[#607A41] text-white"
                          : "border-[#DCD7CC] text-transparent"
                      }`}
                    >
                      <Check size={15} />
                    </div>
                  </div>
                </button>
              </div>
            </section>

            {/* ==================================================
                WEDDING INTRODUCTION
            ================================================== */}

            {bookingMode === "wedding" && (
              <section className="mb-12">
                <div className="relative overflow-hidden rounded-[2rem] bg-[#12231A] text-white shadow-md">

                  <div className="grid grid-cols-1 lg:grid-cols-2">

                    {/* Image */}
                    <div className="relative min-h-[320px] lg:min-h-[390px]">
                      <img
                        src="/assets/luxury-collection.jpg"
                        alt="Luxury Mediterranean wedding catering"
                        className="absolute inset-0 w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#12231A]/40 lg:to-[#12231A]/70" />
                    </div>

                    {/* Text */}
                    <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">

                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C05621] mb-3">
                        Your Celebration Starts Here
                      </span>

                      <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-tight">
                        Build Your Wedding
                      </h2>

                      <p className="text-sm text-slate-300 leading-relaxed mt-5 max-w-xl">
                        Your wedding deserves more than a standard
                        catering package. Start with our Luxury
                        Collection and personalize your experience
                        with food upgrades, beverages, and your
                        event details.
                      </p>

                      <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">

                        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                          <span className="text-xs font-bold text-white block">
                            Luxury
                          </span>

                          <span className="text-[10px] text-slate-400 block mt-1">
                            Premium starting point
                          </span>
                        </div>

                        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                          <span className="text-xs font-bold text-white block">
                            Customize
                          </span>

                          <span className="text-[10px] text-slate-400 block mt-1">
                            Add dishes & upgrades
                          </span>
                        </div>

                        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                          <span className="text-xs font-bold text-white block">
                            Celebrate
                          </span>

                          <span className="text-[10px] text-slate-400 block mt-1">
                            Plan your event details
                          </span>
                        </div>

                      </div>

                      <p className="text-[11px] text-slate-400 italic mt-6">
                        We're keeping the wedding builder simple
                        for now, with more dedicated wedding
                        options planned for the future.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ==================================================
                CATERING INTRO
            ================================================== */}

            {bookingMode === "catering" && (
              <section className="mb-10">
                <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 shadow-sm">
                  <div className="max-w-3xl">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C05621] block mb-2">
                      Catering
                    </span>

                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B2240]">
                      Build Your Catering Order
                    </h2>

                    <p className="text-sm text-slate-500 leading-relaxed mt-2">
                      Choose your guest count, select a collection,
                      then customize your order with food upgrades,
                      beverages, and event details.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* ==================================================
                MAIN ORDERING FORM
            ================================================== */}

            <form
              onSubmit={handleSubmitBooking}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
            >
              {/* =================================================
                  LEFT COLUMN
              ================================================= */}

              <div className="lg:col-span-2 space-y-10">

                {/* =================================================
                    STEP 1: GUESTS
                ================================================= */}

                <section
                  id="guests"
                  className="space-y-4 scroll-mt-28"
                >
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
                          setGuestCount(
                            Math.max(20, guestCount - 5)
                          )
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
                            Math.max(
                              20,
                              parseInt(e.target.value) || 20
                            )
                          )
                        }
                        className="w-16 text-center font-black text-[#0B2240] text-lg bg-transparent focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setGuestCount(guestCount + 5)
                        }
                        className="w-10 h-10 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#0B2240] hover:bg-[#EFECE6] transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {[20, 50, 80, 100, 200].map(
                      (preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() =>
                            setGuestCount(preset)
                          }
                          className={`px-4 py-3 rounded-2xl font-bold text-xs transition-all border ${
                            guestCount === preset
                              ? "bg-[#0B2240] text-white border-[#0B2240] shadow-sm"
                              : "bg-white text-[#0B2240] border-[#EFECE6] hover:border-[#DCD7CC]"
                          }`}
                        >
                          {preset} guests
                        </button>
                      )
                    )}
                  </div>
                </section>

                {/* =================================================
                    STEP 2: PACKAGES
                ================================================= */}

                <section
                  id="packages"
                  className="space-y-4 scroll-mt-28"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C05621]">
                    Step Two
                  </span>

                  <h2 className="text-xl font-serif font-bold text-[#0B2240]">
                    2.{" "}
                    {bookingMode === "wedding"
                      ? "Choose your wedding package"
                      : "Pick a package"}
                  </h2>

                  {/* =================================================
                      WEDDING PACKAGES
                  ================================================= */}

                  {bookingMode === "wedding" && (
                    <div className="space-y-5">

                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#607A41] mb-3">
                          Wedding Collection
                        </h3>

                        {weddingPackages.length > 0 ? (
                          <div className="max-w-2xl mx-auto">
                            {weddingPackages.map(
                              (pkg) => (
                                <PackageCard
                                  key={pkg.id}
                                  pkg={pkg}
                                  imageUrl={
                                    packageImages[
                                      pkg.name
                                    ]
                                  }
                                  isSelected={
                                    selectedPackage?.id ===
                                    pkg.id
                                  }
                                  onSelect={
                                    setSelectedPackage
                                  }
                                />
                              )
                            )}
                          </div>
                        ) : (
                          <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 text-center">
                            <p className="text-sm font-semibold text-[#0B2240]">
                              Wedding package unavailable
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              The Luxury Collection could not
                              be loaded.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Wedding note */}
                      <div className="bg-[#FAF8F5] border border-[#EFECE6] rounded-2xl p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#12231A] text-white flex items-center justify-center shrink-0">
                            <Check size={16} />
                          </div>

                          <div>
                            <p className="text-xs font-black uppercase tracking-wider text-[#0B2240]">
                              Wedding planning note
                            </p>

                            <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                              The Luxury Collection is currently
                              the starting point for wedding
                              catering. You can continue below
                              to add food upgrades and beverages
                              to your celebration.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =================================================
                      NORMAL CATERING PACKAGES
                  ================================================= */}

                  {bookingMode === "catering" && (
                    <div className="space-y-8">

                      {/* STANDARD */}
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#607A41] mb-3">
                          Classic & Signature
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">

                          {cateringPackages
                            .filter(
                              (pkg) =>
                                pkg.name ===
                                "Classic Collection"
                            )
                            .map((pkg) => (
                              <PackageCard
                                key={pkg.id}
                                pkg={pkg}
                                imageUrl={
                                  packageImages[
                                    pkg.name
                                  ]
                                }
                                isSelected={
                                  selectedPackage?.id ===
                                  pkg.id
                                }
                                onSelect={
                                  setSelectedPackage
                                }
                              />
                            ))}

                          {/* Middle Image */}
                          <div className="relative overflow-hidden rounded-2xl min-h-[220px] lg:min-h-0">
                            <img
                              src="/assets/f5fde930-72f2-4490-92dc-f553b87faba0.jpg"
                              alt="Mediterranean catering"
                              className="absolute inset-0 w-full h-full object-cover"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B2240]/30 via-transparent to-transparent" />
                          </div>

                          {cateringPackages
                            .filter(
                              (pkg) =>
                                pkg.name ===
                                "Signature Collection"
                            )
                            .map((pkg) => (
                              <PackageCard
                                key={pkg.id}
                                pkg={pkg}
                                imageUrl={
                                  packageImages[
                                    pkg.name
                                  ]
                                }
                                isSelected={
                                  selectedPackage?.id ===
                                  pkg.id
                                }
                                onSelect={
                                  setSelectedPackage
                                }
                              />
                            ))}
                        </div>
                      </div>

                      {/* SPECIALTY */}
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#607A41] mb-3">
                          Specialty
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">

                          {cateringPackages
                            .filter(
                              (pkg) =>
                                pkg.name ===
                                  "Vegetarian Collection" ||
                                pkg.name ===
                                  "Mediterranean Collection"
                            )
                            .map((pkg) => (
                              <PackageCard
                                key={pkg.id}
                                pkg={pkg}
                                imageUrl={
                                  packageImages[
                                    pkg.name
                                  ]
                                }
                                isSelected={
                                  selectedPackage?.id ===
                                  pkg.id
                                }
                                onSelect={
                                  setSelectedPackage
                                }
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =================================================
                      SELECTED PACKAGE DETAILS
                  ================================================= */}

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
                          {categorizedItems.map(
                            (group, idx) => (
                              <div
                                key={idx}
                                className="space-y-1.5"
                              >
                                <span className="text-[11px] font-bold text-[#607A41] uppercase tracking-wider block">
                                  {group.category}
                                </span>

                                <ul className="space-y-1">
                                  {group.list.map(
                                    (
                                      item: string,
                                      itemIdx: number
                                    ) => (
                                      <li
                                        key={itemIdx}
                                        className="flex items-center gap-2 text-xs text-slate-700 font-medium"
                                      >
                                        <Check
                                          size={13}
                                          className="text-[#0B2240] shrink-0"
                                        />

                                        <span>
                                          {item}
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">
                          No specific items listed for this
                          package.
                        </p>
                      )}
                    </div>
                  )}
                </section>

                {/* =================================================
                    WEDDING-SPECIFIC NOTE
                ================================================= */}

                {bookingMode === "wedding" && (
                  <section>
                    <div className="relative overflow-hidden rounded-3xl bg-white border border-[#EFECE6] shadow-sm">

                      <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr]">

                        <div className="relative min-h-[240px]">
                          <img
                            src="/assets/luxury-collection.jpg"
                            alt="Wedding celebration"
                            className="absolute inset-0 w-full h-full object-cover"
                          />

                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                        </div>

                        <div className="p-7 sm:p-8 flex flex-col justify-center">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C05621]">
                            Make It Yours
                          </span>

                          <h3 className="text-2xl font-serif font-bold text-[#0B2240] mt-1">
                            Personalize your celebration
                          </h3>

                          <p className="text-xs text-slate-500 leading-relaxed mt-3">
                            Continue through the next steps to
                            add food upgrades, beverages, and
                            special instructions for your event.
                          </p>

                          <p className="text-[11px] text-slate-400 italic mt-4">
                            More dedicated wedding customization
                            options can be added here in the
                            future without changing the existing
                            ordering system.
                          </p>
                        </div>

                      </div>
                    </div>
                  </section>
                )}

                {/* =================================================
                    STEP 3 & 4
                ================================================= */}

                <div
                  id="food-upgrades"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 scroll-mt-28"
                >

                  {/* =================================================
                      STEP 3: FOOD UPGRADES
                  ================================================= */}

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
                          const qty =
                            selectedAddons[addon.id] ||
                            0;

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
                                  {parseFloat(
                                    addon.pricePerPerson
                                  ).toFixed(2)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateAddonQty(
                                      addon.id,
                                      -1
                                    )
                                  }
                                  className="w-8 h-8 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#0B2240] hover:bg-[#EFECE6]"
                                >
                                  <Minus size={14} />
                                </button>

                                <span className="w-6 text-center text-xs font-bold">
                                  {qty}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateAddonQty(
                                      addon.id,
                                      1
                                    )
                                  }
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

                  {/* =================================================
                      STEP 4: DRINKS
                  ================================================= */}

                  {drinks.length > 0 && (
                    <section
                      id="drinks"
                      className="space-y-3 scroll-mt-28"
                    >
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
                          const qty =
                            selectedDrinks[drink.id] ||
                            0;

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
                                  {parseFloat(
                                    drink.pricePerPerson
                                  ).toFixed(2)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateDrinkQty(
                                      drink.id,
                                      -1
                                    )
                                  }
                                  className="w-8 h-8 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#0B2240] hover:bg-[#EFECE6]"
                                >
                                  <Minus size={14} />
                                </button>

                                <span className="w-6 text-center text-xs font-bold">
                                  {qty}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateDrinkQty(
                                      drink.id,
                                      1
                                    )
                                  }
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

                {/* =================================================
                    STEP 5: EVENT LOGISTICS
                ================================================= */}

                <section
                  id="logistics"
                  className="space-y-4 pt-4 border-t border-[#EFECE6] scroll-mt-28"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C05621] block mb-1">
                      Step Five
                    </span>

                    <h2 className="text-xl font-serif font-bold text-[#0B2240]">
                      5.{" "}
                      {bookingMode === "wedding"
                        ? "Wedding Details"
                        : "Event Logistics & Notes"}
                    </h2>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-[#EFECE6] shadow-sm space-y-4">

                    {/* Wedding-only note */}
                    {bookingMode === "wedding" && (
                      <div className="bg-[#FAF8F5] border border-[#EFECE6] rounded-xl p-4">
                        <p className="text-xs font-bold text-[#0B2240]">
                          Tell us about your celebration
                        </p>

                        <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                          Use the notes field below for any
                          wedding-specific requests, dietary
                          requirements, custom arrangements, or
                          other details you'd like us to know.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {/* Event Date */}
                      <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 mb-1.5">
                          <Calendar size={12} />
                          {bookingMode === "wedding"
                            ? "Wedding Date"
                            : "Event Date"}
                        </label>

                        <input
                          type="date"
                          required
                          value={
                            eventDetails.eventDate
                          }
                          onChange={(e) =>
                            setEventDetails({
                              ...eventDetails,
                              eventDate:
                                e.target.value,
                            })
                          }
                          className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]"
                        />
                      </div>

                      {/* Full Name */}
                      <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 mb-1.5">
                          <User size={12} />
                          Full Name
                        </label>

                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={
                            eventDetails.customerName
                          }
                          onChange={(e) =>
                            setEventDetails({
                              ...eventDetails,
                              customerName:
                                e.target.value,
                            })
                          }
                          className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 mb-1.5">
                          <Phone size={12} />
                          Phone Number
                        </label>

                        <input
                          type="tel"
                          required
                          placeholder="+1 234 567 8900"
                          value={
                            eventDetails.customerPhone
                          }
                          onChange={(e) =>
                            setEventDetails({
                              ...eventDetails,
                              customerPhone:
                                e.target.value,
                            })
                          }
                          className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]"
                        />
                      </div>

                      {/* Location */}
                      <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 mb-1.5">
                          <MapPin size={12} />
                          {bookingMode === "wedding"
                            ? "Wedding Venue"
                            : "Event Location / Venue"}
                        </label>

                        <input
                          type="text"
                          required
                          placeholder="Full venue address"
                          value={
                            eventDetails.eventLocation
                          }
                          onChange={(e) =>
                            setEventDetails({
                              ...eventDetails,
                              eventLocation:
                                e.target.value,
                            })
                          }
                          className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 mb-1.5">
                        <FileText size={12} />

                        {bookingMode === "wedding"
                          ? "Wedding Requests / Dietary Notes"
                          : "Special Instructions / Dietary Notes"}
                      </label>

                      <textarea
                        rows={3}
                        placeholder={
                          bookingMode === "wedding"
                            ? "Tell us about your wedding, dietary requirements, special requests, custom setups, or anything else we should know..."
                            : "Any allergies, custom setups, or specific requests..."
                        }
                        value={
                          eventDetails.notes
                        }
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

              {/* =================================================
                  RIGHT COLUMN
              ================================================= */}

              <div className="lg:col-span-1 sticky top-28">

                <div className="bg-[#12231A] text-white p-6 rounded-3xl shadow-md border border-[#1C3527] space-y-6">

                  {/* =================================================
                      QUOTE HEADER
                  ================================================= */}

                  <div>

                    <span className="text-xs text-slate-300 font-bold uppercase tracking-wider block">
                      {bookingMode === "wedding"
                        ? "Your wedding estimate"
                        : "Your estimate"}
                    </span>

                    <div className="text-3xl font-black text-white mt-1">
                      $
                      {grandTotal.toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </div>

                    <span className="text-xs text-slate-300 font-medium">
                      ${effectivePerPerson.toFixed(2)} per
                      guest
                    </span>
                  </div>

                  {/* =================================================
                      ORDER BREAKDOWN
                  ================================================= */}

                  <div className="border-t border-[#1C3527] pt-4 space-y-3 text-sm">

                    {selectedPackage ? (
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-slate-300">
                          {selectedPackage.name} ×{" "}
                          {guestCount}
                        </span>

                        <span className="font-bold text-white">
                          $
                          {packageTotal.toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                            }
                          )}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-rose-400 italic">
                        Please select a package.
                      </p>
                    )}

                    {/* Addons */}
                    {Object.entries(
                      selectedAddons
                    ).map(([id, qty]) => {
                      const addon = addons.find(
                        (a) => a.id === id
                      );

                      if (!addon) return null;

                      const addonCost =
                        parseFloat(
                          addon.pricePerPerson
                        ) * qty;

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
                            {addonCost.toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </span>
                        </div>
                      );
                    })}

                    {/* Drinks */}
                    {Object.entries(
                      selectedDrinks
                    ).map(([id, qty]) => {
                      const drink = drinks.find(
                        (d) => d.id === id
                      );

                      if (!drink) return null;

                      const drinkCost =
                        parseFloat(
                          drink.pricePerPerson
                        ) * qty;

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
                            {drinkCost.toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* =================================================
                      FEES & TIPS
                  ================================================= */}

                  <div className="border-t border-[#1C3527] pt-4 space-y-3 text-xs">

                    {/* Delivery */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-slate-300 block">
                          Delivery
                        </span>

                        <span className="text-[10px] text-slate-500">
                          Optional • $100.00
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setIncludeDelivery(
                            !includeDelivery
                          )
                        }
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                          includeDelivery
                            ? "bg-[#607A41]"
                            : "bg-[#CBD5C0]"
                        }`}
                        aria-pressed={
                          includeDelivery
                        }
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            includeDelivery
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Service Fee */}
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
                        onClick={() =>
                          setIncludeServiceFee(
                            !includeServiceFee
                          )
                        }
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          includeServiceFee
                            ? "bg-[#607A41]"
                            : "bg-[#CBD5C0]"
                        }`}
                        aria-pressed={
                          includeServiceFee
                        }
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

                    {/* Delivery Fee */}
                    {includeDelivery && (
                      <div className="flex justify-between text-slate-300">
                        <span>Delivery Fee</span>

                        <span>
                          $
                          {deliveryFee.toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                            }
                          )}
                        </span>
                      </div>
                    )}

                    {/* Service Fee */}
                    {includeServiceFee && (
                      <div className="flex justify-between text-slate-300">
                        <span>
                          Service Fee (10%)
                        </span>

                        <span>
                          $
                          {serviceFee.toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                            }
                          )}
                        </span>
                      </div>
                    )}

                    {/* Tax */}
                    <div className="flex justify-between text-slate-300">
                      <span>
                        Estimated Tax (8%)
                      </span>

                      <span>
                        $
                        {tax.toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>

                    {/* =================================================
                        TIP SELECTOR
                    ================================================= */}

                    <div className="pt-2">

                      <span className="text-[10px] font-bold uppercase text-slate-300 block mb-1.5">
                        Add a Tip
                      </span>

                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          {
                            label: "0%",
                            value: 0,
                          },
                          {
                            label: "2.5%",
                            value: 0.025,
                          },
                          {
                            label: "5%",
                            value: 0.05,
                          },
                          {
                            label: "7.5%",
                            value: 0.075,
                          },
                        ].map((tip) => (
                          <button
                            key={tip.label}
                            type="button"
                            onClick={() =>
                              setTipPercentage(
                                tip.value
                              )
                            }
                            className={`py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                              tipPercentage ===
                              tip.value
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
                        <span>
                          Tip Amount
                        </span>

                        <span>
                          $
                          {tipAmount.toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                            }
                          )}
                        </span>
                      </div>
                    )}

                    {/* Down Payment */}
                    <div className="flex justify-between font-bold text-white pt-3 border-t border-dashed border-[#1C3527]">
                      <span>
                        Refundable Down Payment (30%)
                      </span>

                      <span>
                        $
                        {downPayment.toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-300 italic">
                      The down payment is fully refundable if canceled up to 4 days before the event. Cancellations within 4 days of the event are subject to a 5% refundable rate.
                    </p>
                  </div>

                  {/* =================================================
                      CHECKOUT
                  ================================================= */}

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
                      <DollarSign size={16} />

                      Pay 30% Down Payment via Stripe
                    </button>

                    <p className="text-[11px] text-center text-slate-300 mt-3 leading-relaxed">
                      Secure checkout powered by Stripe.
                      Remaining balance due on event day.
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