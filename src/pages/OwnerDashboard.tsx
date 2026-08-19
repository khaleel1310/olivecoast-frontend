// 📁 frontend/src/pages/OwnerDashboard.tsx
import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuthStore } from "../store/auth.store";
import { useNavigate } from "react-router-dom";
import { LogOut, RefreshCw, DollarSign, CalendarDays, CheckCircle2, Loader2 } from "lucide-react";

export const OwnerDashboard: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const [bookings, setBookings] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "packages">("bookings");
  const [bookingFilter, setBookingFilter] = useState<"ALL" | "PENDING">("ALL");

  const fetchData = async () => {
    try {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      const config = { headers: { Authorization: `Bearer ${storedToken}` } };
      
      const [bookingsRes, pkgsRes] = await Promise.allSettled([
        api.get("/bookings", config),
        api.get("/packages", config),
      ]);

      if (bookingsRes.status === "fulfilled") setBookings(bookingsRes.value.data);
      if (pkgsRes.status === "fulfilled") setPackages(pkgsRes.value.data);
      
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 30000); // Keep polling active
    return () => clearInterval(intervalId);
  }, [isLoggedIn]);

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const doneCount = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED").length;
  const grossRevenue = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + parseFloat(b.grandTotal || "0"), 0);

  const handleLogoutClick = async () => {
    await logout();
    navigate("/login");
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const storedToken = localStorage.getItem("token");
      await api.put(`/bookings/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      fetchData();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const displayedBookings = bookings.filter(
    (b) => bookingFilter === "ALL" || b.status === "PENDING"
  );

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col font-sans selection:bg-[#0B2240] selection:text-white">
      <header className="sticky top-0 z-40 bg-white border-b border-[#EFECE6] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#EFECE6] p-1 flex items-center justify-center shrink-0">
              <img src="/assets/Olive_Coast_Logo.jpg" alt="Logo" className="h-full w-full object-contain scale-110" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-serif font-bold text-[#0B2240] tracking-wide leading-tight">OWNER SUITE</h1>
              <span className="text-[9px] sm:text-[10px] font-sans font-bold tracking-[0.15em] text-[#607A41] uppercase block mt-0.5">Catering Analytics</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button onClick={fetchData} className="p-2.5 sm:p-3 rounded-xl border border-[#DCD7CC] bg-white text-[#0B2240] hover:border-[#0B2240] shadow-sm transition-all active:scale-95">
              <RefreshCw size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button onClick={handleLogoutClick} className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-xs font-bold bg-white text-rose-600 rounded-xl border border-rose-200 hover:bg-rose-50 shadow-sm transition-all active:scale-95">
              <LogOut size={13} /> <span className="hidden xs:inline">Leave Suite</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Analytics Baner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EFECE6] shadow-sm flex items-center justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Gross Bookings Realized</span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0B2240] mt-1 truncate">{grossRevenue.toFixed(2)} <span className="text-xs font-bold text-slate-500">USD</span></h3>
            </div>
            <div className="p-3 bg-[#FAF8F5] rounded-xl text-[#607A41] shrink-0"><DollarSign size={20} className="sm:w-6 sm:h-6" /></div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EFECE6] shadow-sm flex items-center justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Events</span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0B2240] mt-1 truncate">{pendingCount} <span className="text-xs font-medium text-slate-400">Requests</span></h3>
            </div>
            <div className="p-3 bg-[#FAF8F5] rounded-xl text-amber-600 shrink-0"><CalendarDays size={20} className="sm:w-6 sm:h-6" /></div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EFECE6] shadow-sm flex items-center justify-between gap-3 sm:col-span-2 md:col-span-1">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Confirmed Events</span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0B2240] mt-1 truncate">{doneCount} <span className="text-xs font-medium text-slate-400">Completed</span></h3>
            </div>
            <div className="p-3 bg-[#FAF8F5] rounded-xl text-[#607A41] shrink-0"><CheckCircle2 size={20} className="sm:w-6 sm:h-6" /></div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#EFECE6] gap-6 sm:gap-8 overflow-x-auto scrollbar-none">
          <button onClick={() => setActiveTab("bookings")} className={`pb-4 text-xs sm:text-sm font-bold uppercase tracking-wide border-b-2 shrink-0 ${activeTab === "bookings" ? "border-b-[#0B2240] text-[#0B2240]" : "border-transparent text-slate-400"}`}>
            📊 Event Pipeline
          </button>
          <button onClick={() => setActiveTab("packages")} className={`pb-4 text-xs sm:text-sm font-bold uppercase tracking-wide border-b-2 shrink-0 ${activeTab === "packages" ? "border-b-[#0B2240] text-[#0B2240]" : "border-transparent text-slate-400"}`}>
            📜 Catering Packages
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20"><Loader2 size={32} className="animate-spin mx-auto text-[#607A41]" /></div>
        ) : activeTab === "bookings" ? (
          <div className="space-y-4 sm:space-y-6">
             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-4 border border-[#EFECE6] rounded-xl gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Filter Bookings:</span>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setBookingFilter("ALL")} className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${bookingFilter === "ALL" ? "bg-[#0B2240] text-white" : "bg-[#FAF8F5] border text-[#0B2240]"}`}>All History</button>
                <button onClick={() => setBookingFilter("PENDING")} className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${bookingFilter === "PENDING" ? "bg-[#0B2240] text-white" : "bg-[#FAF8F5] border text-[#0B2240]"}`}>Pending Reviews ({pendingCount})</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#EFECE6] shadow-sm overflow-x-auto scrollbar-none">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#EFECE6] text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="p-4">Ref #</th>
                    <th className="p-4">Client & Contact</th>
                    <th className="p-4">Event Date / Location</th>
                    <th className="p-4">Package & Guests</th>
                    <th className="p-4">Total Value</th>
                    <th className="p-4">Status & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6] text-sm text-[#0B2240]">
                  {displayedBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-xs">{b.bookingNumber}</td>
                      <td className="p-4">
                        <span className="font-bold block">{b.customerName}</span>
                        <span className="text-xs text-slate-400">{b.customerPhone}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold block">{new Date(b.eventDate).toLocaleDateString()}</span>
                        <span className="text-[10px] text-slate-500 line-clamp-1 max-w-[150px]">{b.eventLocation}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold block">{b.package?.name || "Unknown"}</span>
                        <span className="text-[10px] text-[#607A41] font-bold uppercase">{b.guestCount} Guests</span>
                      </td>
                      <td className="p-4 font-black">{parseFloat(b.grandTotal).toFixed(2)} USD</td>
                      <td className="p-4 flex items-center gap-2">
                        <select 
                          value={b.status}
                          onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                          className={`text-[10px] font-bold uppercase rounded-lg px-2 py-1.5 border outline-none ${b.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : b.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Packages Editor Window */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white p-5 rounded-xl border border-[#EFECE6] shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[#0B2240] text-base">{pkg.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{pkg.description}</p>
                    </div>
                    <span className="text-xs font-extrabold text-[#607A41] bg-[#FAF8F5] border px-2 py-0.5 rounded-md whitespace-nowrap">
                      {parseFloat(pkg.pricePerPerson).toFixed(2)} USD / guest
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};