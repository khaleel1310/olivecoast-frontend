import React from 'react';
import { Clock, Check } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  itemName: string; // 🎯 Perfectly matches the direct property from your API!
}

interface OrderProps {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    phoneNumber: string;
    deliveryAddress: string;
    notes: string | null;
    status: 'PENDING' | 'DONE';
    createdAt: string;
    items: OrderItem[];
  };
  onMarkDone: (id: string) => void;
}

export const OrderCard: React.FC<OrderProps> = ({ order, onMarkDone }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EFECE6] overflow-hidden flex flex-col h-full hover:shadow-md transition-all duration-300">
      
      {/* Upper Meta Header Banner */}
      <div className="p-4 bg-[#FAF8F5] border-b border-[#EFECE6] flex justify-between items-center">
        <div>
          <span className="text-xs font-mono font-black text-[#0B2240] tracking-wider bg-white px-2.5 py-1 rounded-lg border border-[#DCD7CC]">
            {order.orderNumber}
          </span>
          <p className="text-[10px] text-slate-500 font-bold mt-2 flex items-center gap-1">
            <Clock size={11} className="text-[#607A41]" /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        
        {/* PENDING Status Badge */}
        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          {order.status}
        </span>
      </div>

      {/* Main Dishes Ticket Listing Frame */}
      <div className="p-5 flex-grow space-y-4">
        <div className="space-y-2">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ordered Dishes</h4>
          <div className="divide-y divide-[#EFECE6]">
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-baseline justify-between gap-4">
                  {/* ⚡ Targeted item.itemName directly to match backend schema */}
                  <span className="text-sm text-[#0B2240] font-bold">
                    {item.itemName || 'Unknown Dish'}
                  </span>
                  <span className="text-xs font-extrabold text-[#607A41] bg-[#FAF8F5] h-6 w-9 rounded-lg flex items-center justify-center shrink-0 border border-[#EFECE6]">
                    ×{item.quantity}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-rose-500 py-2">No items listed in this ticket.</p>
            )}
          </div>
        </div>

        {/* Kitchen Notes Alert Frame */}
        {order.notes && (
          <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl text-xs text-amber-900 italic">
            <span className="block text-[10px] font-black uppercase tracking-wider text-amber-700 not-italic mb-0.5">Note from client:</span>
            "{order.notes}"
          </div>
        )}

        {/* Customer Details Block */}
        <div className="pt-3 border-t border-[#EFECE6] space-y-1.5 text-xs text-slate-600">
          <p><strong className="text-[#0B2240] font-bold">Customer:</strong> {order.customerName}</p>
          <p><strong className="text-[#0B2240] font-bold">Phone:</strong> {order.phoneNumber}</p>
          <p className="line-clamp-2 leading-relaxed"><strong className="text-[#0B2240] font-bold">Deliver To:</strong> {order.deliveryAddress}</p>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4 border-t border-[#EFECE6] bg-[#FAF8F5]/50">
        <button
          onClick={() => onMarkDone(order.id)}
          className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-[#607A41] hover:bg-[#506637] text-white transition-all active:scale-[0.98] shadow-sm"
        >
          <Check size={14} /> Mark Cooked & Dispatch
        </button>
      </div>

    </div>
  );
};