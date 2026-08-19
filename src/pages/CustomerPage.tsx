// 📁 frontend/src/pages/CustomerPage.tsx
import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Calendar, MapPin, Phone, User, Check, Minus, Plus } from 'lucide-react';
import { api } from '../api/client';

export const CustomerPage: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Form State
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [guestCount, setGuestCount] = useState<number>(80);
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
          api.get('/packages/addons')
        ]);
        
        const pkgData = pkgRes.data;
        const parsedPackages = Array.isArray(pkgData) ? pkgData : (pkgData?.data && Array.isArray(pkgData.data) ? pkgData.data : []);
        setPackages(parsedPackages);
        
        if (parsedPackages.length > 0) {
          setSelectedPackage(parsedPackages[0]);
        }

        const addonData = addonRes.data;
        setAddons(Array.isArray(addonData) ? addonData : (addonData?.data && Array.isArray(addonData.data) ? addonData.data : []));

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
  const packageUnitPrice = selectedPackage ? parseFloat(selectedPackage.pricePerPerson) : 0;
  const packageTotal = packageUnitPrice * guestCount;
  
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = addons.find((a) => a.id === addonId);
    return sum + (addon ? parseFloat(addon.pricePerPerson) * guestCount : 0);
  }, 0);
  
  const grandTotal = packageTotal + addonsTotal;
  const effectivePerPerson = guestCount > 0 ? grandTotal / guestCount : 0;

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
      setSelectedAddons([]);
      setGuestCount(80);
      setEventDetails({ customerName: '', customerPhone: '', eventDate: '', eventLocation: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to submit booking request. Please check your details.');
    }
  };

  // Safely parse and flatten the categorized JSON from Supabase includedItems
  const getFormattedIncludedItems = (pkg: any) => {
    if (!pkg) return [];
    let items = pkg.includedItems || pkg.features || pkg.items;
    
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch { return [items]; }
    }

    if (!items) return [];

    if (typeof items === 'object' && !Array.isArray(items)) {
      const results: { category: string; list: string[] }[] = [];
      for (const [key, val] of Object.entries(items)) {
        if (Array.isArray(val) && val.length > 0) {
          const formattedCategory = key.replace(/_/g, ' ');
          results.push({ category: formattedCategory, list: val as string[] });
        }
      }
      return results;
    }

    if (Array.isArray(items)) {
      return [{ category: 'Included Items', list: items }];
    }

    return [];
  };

  const categorizedItems = getFormattedIncludedItems(selectedPackage);

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col font-sans selection:bg-[#0B2240] selection:text-white">
      {/* Brand Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EFECE6] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#EFECE6] p-1 flex items-center justify-center shrink-0">
              <img src="/assets/Olive_Coast_Logo.jpg" alt="Logo" className="h-full w-full object-contain scale-110" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-[#0B2240] tracking-wide leading-tight">OLIVE COAST</h1>
              <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#607A41] uppercase block mt-0.5">Premium Event Catering</span>
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
          <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Step 1: Pick a package */}
              <section className="space-y-4">
                <h2 className="text-xl font-serif font-bold text-[#0B2240]">1. Pick a package</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {packages.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    return (
                      <div 
                        key={pkg.id} 
                        onClick={() => setSelectedPackage(pkg)}
                        className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all bg-white shadow-sm flex flex-col justify-between ${
                          isSelected ? 'border-[#0B2240] ring-2 ring-[#0B2240]/10 bg-white' : 'border-[#EFECE6] hover:border-[#DCD7CC]'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-[#0B2240] text-white rounded-full flex items-center justify-center shadow-sm">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-[#0B2240] text-lg">{pkg.name}</h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{pkg.description}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#FAF8F5]">
                          <span className="font-black text-[#0B2240] text-lg">${parseFloat(pkg.pricePerPerson).toFixed(2)}</span>
                          <span className="text-xs text-slate-400 font-medium"> /guest</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Included Items Breakdown Box */}
                {selectedPackage && (
                  <div className="p-6 bg-[#FAF8F5] rounded-2xl border border-[#EFECE6] transition-all space-y-4">
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
                              {group.list.map((item: string, itemIdx: number) => (
                                <li key={itemIdx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                                  <Check size={13} className="text-[#0B2240] shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No specific items listed for this package.</p>
                    )}
                  </div>
                )}
              </section>

              {/* Step 2: How many guests? */}
              <section className="space-y-4">
                <h2 className="text-xl font-serif font-bold text-[#0B2240]">2. How many guests?</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center bg-white border border-[#EFECE6] rounded-2xl p-1.5 shadow-sm">
                    <button 
                      type="button" 
                      onClick={() => setGuestCount(Math.max(10, guestCount - 5))}
                      className="w-10 h-10 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#0B2240] hover:bg-[#EFECE6] transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <input 
                      type="number" 
                      min="10" 
                      value={guestCount} 
                      onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 0))}
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

                  {[25, 50, 80, 100, 200].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setGuestCount(preset)}
                      className={`px-4 py-3 rounded-2xl font-bold text-xs transition-all border ${
                        guestCount === preset 
                          ? 'bg-[#0B2240] text-white border-[#0B2240] shadow-sm' 
                          : 'bg-white text-[#0B2240] border-[#EFECE6] hover:border-[#DCD7CC]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </section>

              {/* Step 3: Any upgrades? */}
              {addons.length > 0 && (
                <section className="space-y-3">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#0B2240]">3. Any upgrades?</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Optional — priced per guest.</p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {addons.map((addon) => {
                      const isAdded = selectedAddons.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => toggleAddon(addon.id)}
                          className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2 ${
                            isAdded 
                              ? 'bg-[#0B2240] text-white border-[#0B2240] shadow-sm' 
                              : 'bg-white text-[#0B2240] border-[#EFECE6] hover:border-[#DCD7CC]'
                          }`}
                        >
                          <span>{addon.name}</span>
                          <span className={isAdded ? 'text-white/80' : 'text-[#607A41]'}>
                            +${parseFloat(addon.pricePerPerson).toFixed(0)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Step 4: Event Logistics */}
              <section className="space-y-4 pt-4 border-t border-[#EFECE6]">
                <h2 className="text-xl font-serif font-bold text-[#0B2240]">4. Event Logistics</h2>
                <div className="bg-white p-6 rounded-2xl border border-[#EFECE6] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 mb-1.5">
                      <Calendar size={12}/> Event Date
                    </label>
                    <input 
                      type="date" 
                      required 
                      value={eventDetails.eventDate} 
                      onChange={(e) => setEventDetails({...eventDetails, eventDate: e.target.value})} 
                      className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]" 
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 mb-1.5">
                      <User size={12}/> Full Name
                    </label>
                    <input 
                      type="text" 
                      required 
                      placeholder="John Doe" 
                      value={eventDetails.customerName} 
                      onChange={(e) => setEventDetails({...eventDetails, customerName: e.target.value})} 
                      className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]" 
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 mb-1.5">
                      <Phone size={12}/> Phone Number
                    </label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="+1 234 567 8900" 
                      value={eventDetails.customerPhone} 
                      onChange={(e) => setEventDetails({...eventDetails, customerPhone: e.target.value})} 
                      className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]" 
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 mb-1.5">
                      <MapPin size={12}/> Event Location / Venue
                    </label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Full venue address" 
                      value={eventDetails.eventLocation} 
                      onChange={(e) => setEventDetails({...eventDetails, eventLocation: e.target.value})} 
                      className="w-full text-sm p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#0B2240]" 
                    />
                  </div>
                </div>
              </section>

            </div>

            {/* Right Column: Sticky Quote Summary Card */}
            <div className="lg:col-span-1 sticky top-28">
              <div className="bg-white p-6 rounded-3xl shadow-md border border-[#EFECE6] space-y-6">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Your estimate</span>
                  <div className="text-3xl font-black text-[#0B2240] mt-1">
                    ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    ${effectivePerPerson.toFixed(2)} per guest
                  </span>
                </div>

                <div className="border-t border-[#EFECE6] pt-4 space-y-3 text-sm">
                  {selectedPackage ? (
                    <div className="flex justify-between items-center font-medium">
                      <span className="text-slate-600">{selectedPackage.name} × {guestCount}</span>
                      <span className="font-bold text-[#0B2240]">${packageTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-rose-500 italic">Please select a package.</p>
                  )}

                  {selectedAddons.map(id => {
                    const addon = addons.find(a => a.id === id);
                    if (!addon) return null;
                    const addonCost = parseFloat(addon.pricePerPerson) * guestCount;
                    return (
                      <div key={id} className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">{addon.name} × {guestCount}</span>
                        <span className="font-medium text-[#0B2240]">+${addonCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[#EFECE6] pt-4">
                  <button 
                    type="submit"
                    disabled={!selectedPackage || !eventDetails.customerName || !eventDetails.eventDate || !eventDetails.eventLocation} 
                    className="w-full py-4 bg-[#0B2240] text-white rounded-2xl text-sm font-bold shadow-md hover:bg-[#15345b] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    Request booking
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-3 leading-relaxed">
                    No payment now. Delivery and staff quoted after we confirm.
                  </p>
                </div>
              </div>
            </div>

          </form>
        )}
      </main>
    </div>
  );
};