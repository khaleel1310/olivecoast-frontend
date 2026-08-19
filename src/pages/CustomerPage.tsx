// 📁 frontend/src/pages/CustomerPage.tsx
import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Calendar, Users, MapPin, Phone, User } from 'lucide-react';
import { api } from '../api/client';

export const CustomerPage: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Form State
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [guestCount, setGuestCount] = useState<number>(50);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [eventDetails, setEventDetails] = useState({
    customerName: '',
    customerPhone: '',
    eventDate: '',
    eventLocation: '',
  });

  useEffect(() => {
    const fetchCateringData = async () => {
      try {
        setLoading(true);
        const [pkgRes, addonRes] = await Promise.all([
          api.get('/packages'),
          api.get('/packages/addons') // Adjust if your addon route is different
        ]);
        setPackages(pkgRes.data);
        setAddons(addonRes.data);
      } catch (err: any) {
        console.error(err);
        setError('Unable to load catering packages.');
      } finally {
        setLoading(false);
      }
    };
    fetchCateringData();
  }, []);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Calculations
  const packageTotal = selectedPackage ? parseFloat(selectedPackage.pricePerPerson) * guestCount : 0;
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = addons.find((a) => a.id === addonId);
    return sum + (addon ? parseFloat(addon.pricePerPerson) * guestCount : 0);
  }, 0);
  const grandTotal = packageTotal + addonsTotal;

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return alert('Please select a catering package first.');
    
    try {
      const response = await api.post('/bookings', {
        packageId: selectedPackage.id,
        guestCount,
        eventDate: new Date(eventDetails.eventDate).toISOString(),
        eventLocation: eventDetails.eventLocation,
        customerName: eventDetails.customerName,
        customerPhone: eventDetails.customerPhone,
        addons: selectedAddons.map(id => ({ addonId: id }))
      });
      alert(`Booking Request Submitted! Reference Number: ${response.data.bookingNumber}`);
      // Reset form
      setSelectedPackage(null);
      setSelectedAddons([]);
      setGuestCount(50);
      setEventDetails({ customerName: '', customerPhone: '', eventDate: '', eventLocation: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to submit booking request. Please check your details.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col font-sans selection:bg-[#0B2240] selection:text-white">
      {/* Premium Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EFECE6] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-28 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#EFECE6] p-1 flex items-center justify-center shrink-0">
              <img src="/assets/Olive_Coast_Logo.jpg" alt="Olive Coast Emblem" className="h-full w-full object-contain scale-110" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-serif font-bold text-[#0B2240] tracking-wide leading-tight">
                OLIVE COAST
              </h1>
              <span className="text-[10px] md:text-xs font-sans font-bold tracking-[0.2em] text-[#607A41] uppercase mt-0.5">
                Premium Event Catering
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <Loader2 size={32} className="animate-spin text-[#607A41]" />
            <p className="text-sm font-medium text-slate-500">Curating catering options...</p>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-start gap-4 text-rose-800 my-12">
            <AlertCircle size={24} className="shrink-0 text-rose-500" />
            <p className="text-xs text-rose-600/90 leading-relaxed">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form & Selection */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Step 1: Packages */}
              <section>
                <h2 className="text-xl font-serif font-bold text-[#0B2240] mb-4 flex items-center gap-2">
                  <span className="bg-[#0B2240] text-white h-6 w-6 rounded-full flex items-center justify-center text-xs font-sans">1</span>
                  Select a Package
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packages.map((pkg) => (
                    <div 
                      key={pkg.id} 
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all bg-white shadow-sm ${
                        selectedPackage?.id === pkg.id ? 'border-[#0B2240] ring-4 ring-[#0B2240]/5' : 'border-[#EFECE6] hover:border-[#DCD7CC]'
                      }`}
                    >
                      <h3 className="font-bold text-[#0B2240] text-lg">{pkg.name}</h3>
                      <p className="text-[#607A41] font-black text-sm my-1">{parseFloat(pkg.pricePerPerson).toFixed(2)} USD <span className="font-medium text-slate-400 text-xs">/ guest</span></p>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-3">{pkg.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Step 2: Add-ons */}
              {addons.length > 0 && (
                <section>
                  <h2 className="text-xl font-serif font-bold text-[#0B2240] mb-4 flex items-center gap-2">
                    <span className="bg-[#0B2240] text-white h-6 w-6 rounded-full flex items-center justify-center text-xs font-sans">2</span>
                    Premium Upgrades (Optional)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addons.map((addon) => (
                      <label key={addon.id} className="flex items-center space-x-3 p-4 bg-white border border-[#EFECE6] rounded-xl hover:bg-[#FAF8F5] cursor-pointer transition-colors shadow-sm">
                        <input type="checkbox" checked={selectedAddons.includes(addon.id)} onChange={() => toggleAddon(addon.id)} className="w-4 h-4 text-[#0B2240] rounded border-slate-300 focus:ring-[#0B2240]" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#0B2240]">{addon.name}</p>
                          <p className="text-[11px] text-[#607A41] font-bold">+{parseFloat(addon.pricePerPerson).toFixed(2)} USD / guest</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>
              )}

              {/* Step 3: Event Details */}
              <section>
                <h2 className="text-xl font-serif font-bold text-[#0B2240] mb-4 flex items-center gap-2">
                  <span className="bg-[#0B2240] text-white h-6 w-6 rounded-full flex items-center justify-center text-xs font-sans">3</span>
                  Event Details
                </h2>
                <div className="bg-white p-6 rounded-2xl border border-[#EFECE6] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500 mb-1.5"><Users size={12}/> Guest Count (Min 10)</label>
                    <input type="number" min="10" value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500 mb-1.5"><Calendar size={12}/> Event Date</label>
                    <input type="date" required value={eventDetails.eventDate} onChange={(e) => setEventDetails({...eventDetails, eventDate: e.target.value})} className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500 mb-1.5"><User size={12}/> Full Name</label>
                    <input type="text" required placeholder="John Doe" value={eventDetails.customerName} onChange={(e) => setEventDetails({...eventDetails, customerName: e.target.value})} className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500 mb-1.5"><Phone size={12}/> Phone Number</label>
                    <input type="tel" required placeholder="+1 234 567 8900" value={eventDetails.customerPhone} onChange={(e) => setEventDetails({...eventDetails, customerPhone: e.target.value})} className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500 mb-1.5"><MapPin size={12}/> Event Location</label>
                    <input type="text" required placeholder="Full venue address" value={eventDetails.eventLocation} onChange={(e) => setEventDetails({...eventDetails, eventLocation: e.target.value})} className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]" />
                  </div>
                </div>
              </section>

            </div>

            {/* Right Column: Checkout Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-[#EFECE6] sticky top-36">
                <h3 className="text-lg font-serif font-bold text-[#0B2240] border-b border-[#EFECE6] pb-4 mb-4">Quote Summary</h3>
                
                <div className="space-y-4 text-sm mb-6">
                  <div className="flex justify-between text-slate-500">
                    <span>Total Guests</span><span className="font-bold text-[#0B2240]">{guestCount}</span>
                  </div>
                  
                  {selectedPackage ? (
                    <div className="flex justify-between font-medium">
                      <span className="text-[#0B2240]">{selectedPackage.name}</span>
                      <span className="text-[#0B2240]">{packageTotal.toFixed(2)} USD</span>
                    </div>
                  ) : (
                    <p className="text-xs text-rose-500 italic">No package selected yet.</p>
                  )}

                  {selectedAddons.length > 0 && (
                    <div className="border-t border-dashed border-[#EFECE6] pt-4 space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Included Upgrades</p>
                      {selectedAddons.map(id => {
                        const addon = addons.find(a => a.id === id);
                        if (!addon) return null;
                        return (
                          <div key={id} className="flex justify-between text-xs">
                            <span className="text-slate-500">{addon.name}</span>
                            <span className="font-medium text-[#0B2240]">{(parseFloat(addon.pricePerPerson) * guestCount).toFixed(2)} USD</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-[#EFECE6] pt-4 mb-6">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Total</span>
                    <span className="text-2xl font-black text-[#0B2240]">{grandTotal.toFixed(2)} <span className="text-sm font-bold text-slate-400">USD</span></span>
                  </div>
                </div>

                <button 
                  onClick={handleSubmitBooking} 
                  disabled={!selectedPackage || !eventDetails.customerName || !eventDetails.eventDate || !eventDetails.eventLocation} 
                  className="w-full py-3.5 bg-[#0B2240] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#15345b] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  Confirm Event Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};