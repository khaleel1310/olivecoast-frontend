import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuthStore } from "../store/auth.store";
import { useNavigate } from "react-router-dom";
import { LogOut, RefreshCw, Loader2 } from "lucide-react";
import { OrderCard } from "../components/OrderCard";

export const ChefDashboard: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const fetchPendingOrders = async () => {
    try {
      const response = await api.get("/orders?status=PENDING");
      setOrders(response.data);
    } catch (err) {
      console.error("Failed to grab kitchen tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();

    const intervalId = setInterval(() => {
      fetchPendingOrders();
    }, 30000); // ⏱️ Auto-refresh fallback every 30s as per V1 Roadmap strategy

    return () => clearInterval(intervalId);
  }, []);

  const handleMarkDone = async (orderId: string) => {
    try {
      await api.put(`/orders/${orderId}`, { status: "DONE" });
      setOrders((prevOrders) => prevOrders.filter((ord) => ord.id !== orderId));
    } catch (err) {
      console.error("Could not update order status:", err);
      alert("Failed to update the order status on the server.");
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    navigate("/login");
  };

  return (
    /* 🏛️ Soft Mediterranean cream tone (#FBF9F6) */
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col font-sans selection:bg-[#0B2240] selection:text-white">
      {/* 🏙️ Mobile-Polished Navigation Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EFECE6] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between gap-2">
          {/* Brand Identity Frame */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#EFECE6] p-1 flex items-center justify-center shrink-0">
              <img
                src="/assets/Olive_Coast_Logo.jpg"
                alt="Olive Coast Emblem"
                className="h-full w-full object-contain scale-110"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-xl font-serif font-bold text-[#0B2240] tracking-wide leading-tight">
                KITCHEN LINE
              </h1>
              <span className="text-[9px] sm:text-[10px] font-sans font-bold tracking-[0.15em] sm:text-[#607A41] text-slate-400 uppercase mt-0.5">
                Active Cooking Queue
              </span>
            </div>
          </div>

          {/* 📱 Mobile Optimized Flex-Shrink Action Controls Container */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={fetchPendingOrders}
              className="p-2.5 sm:p-3 rounded-xl border border-[#DCD7CC] bg-white text-[#0B2240] hover:border-[#0B2240] transition-all shadow-sm active:scale-95"
              title="Manual Refresh"
            >
              <RefreshCw size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-xs font-bold bg-white text-rose-600 rounded-xl border border-rose-200 hover:bg-rose-50 transition-all active:scale-95 shadow-sm"
            >
              <LogOut size={13} />{" "}
              <span className="hidden xs:inline">Leave Line</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dynamic Grid Board */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <Loader2 size={32} className="animate-spin text-[#607A41]" />
            <p className="text-sm font-medium text-slate-500">
              Syncing active kitchen ticket streams...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 max-w-sm mx-auto space-y-3 bg-white border border-[#EFECE6] rounded-2xl p-8 shadow-sm">
            <div className="text-[#607A41] text-3xl">🍃</div>
            <p className="font-bold text-base text-[#0B2240]">All Caught Up!</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              No pending orders right now. The cooking queue is empty!
            </p>
          </div>
        ) : (
          /* 📱 1 Column on Mobile, 2 on Tablet, 3 on Large Screens */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onMarkDone={handleMarkDone}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
