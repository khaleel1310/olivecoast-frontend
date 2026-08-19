// 📁 frontend/src/pages/OwnerDashboard.tsx
import React, { useEffect, useState } from 'react';
import { LogOut, RefreshCw, DollarSign, CalendarDays, Loader2 } from "lucide-react";
import { api } from "../api/client";
import { useAuthStore } from "../store/auth.store";
import { useNavigate } from "react-router-dom";

interface OwnerDashboardProps {
  onLogout?: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ onLogout }) => {
  const storeLogout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/bookings');
      const data = res.data;
      setBookings(Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []));
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch booking requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleLogoutClick = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await storeLogout();
      navigate("/login");
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert('Failed to update booking status.');
    }
  };

  const totalRevenue = bookings
    .filter(b => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + parseFloat(b.totalPrice || 0), 0);

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-[#EFECE6] sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[#FAF8F5] border border-[#EFECE6] p-1 flex items-center justify-center">
              <img src="/assets/Olive_Coast_Logo.jpg" alt="Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold text-[#0B2240]">Owner Portal</h1>
              <p className="text-[10px] uppercase font-bold text-[#607A41] tracking-wider">Catering Operations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchBookings} 
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#0B2240] bg-[#FAF8F5] border border-[#EFECE6] rounded-xl hover:bg-[#EFECE6] transition-colors"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button 
              onClick={handleLogoutClick} 
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-[#EFECE6] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FAF8F5] rounded-xl text-[#0B2240]"><CalendarDays size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Bookings</p>
              <p className="text-2xl font-black text-[#0B2240]">{bookings.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#EFECE6] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FAF8F5] rounded-xl text-[#607A41]"><DollarSign size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Confirmed Revenue</p>
              <p className="text-2xl font-black text-[#0B2240]">{totalRevenue.toFixed(2)} USD</p>
            </div>
          </div>
        </div>

        {/* Bookings Table Section */}
        <div className="bg-white rounded-2xl border border-[#EFECE6] shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#EFECE6] flex justify-between items-center">
            <h2 className="font-serif font-bold text-lg text-[#0B2240]">Client Event Bookings</h2>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 size={28} className="animate-spin text-[#607A41]" />
            </div>
          )}

          {error && (
            <div className="p-6 text-center text-rose-600 text-sm">{error}</div>
          )}

          {!loading && !error && bookings.length === 0 && (
            <div className="p-16 text-center text-slate-400 text-sm">No bookings recorded yet.</div>
          )}

          {!loading && !error && bookings.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#EFECE6] text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="py-3.5 px-6">Ref / Client</th>
                    <th className="py-3.5 px-6">Package & Guests</th>
                    <th className="py-3.5 px-6">Event Date & Location</th>
                    <th className="py-3.5 px-6">Total Quote</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6] text-xs">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-[#0B2240] block">#{booking.bookingNumber || booking.id.slice(0, 6)}</span>
                        <span className="font-bold text-slate-700">{booking.customerName}</span>
                        <span className="block text-slate-400 text-[11px]">{booking.customerPhone}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-[#0B2240] block">{booking.package?.name || 'Custom Package'}</span>
                        <span className="text-slate-500">{booking.guestCount} Guests</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-slate-700 block">{new Date(booking.eventDate).toLocaleDateString()}</span>
                        <span className="text-slate-400 text-[11px]">{booking.eventLocation}</span>
                      </td>
                      <td className="py-4 px-6 font-black text-[#0B2240]">
                        {parseFloat(booking.totalPrice || 0).toFixed(2)} USD
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          booking.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {booking.status !== 'CONFIRMED' && (
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                            className="px-3 py-1.5 bg-[#607A41] text-white rounded-lg font-bold hover:bg-[#4d6133] transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                        {booking.status !== 'CANCELLED' && (
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg font-bold hover:bg-rose-100 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};