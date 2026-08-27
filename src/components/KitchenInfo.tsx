// 📁 frontend/src/components/KitchenInfo.tsx
import React from "react";

interface KitchenInfoProps {
  monSatHours?: string;
  sundayHours?: string;
  minGuests?: number;
  deliveryFee?: number;
  backgroundColor?: string; // Optional custom background prop
}

export const KitchenInfo: React.FC<KitchenInfoProps> = ({
  monSatHours = "11:00 AM - 10:00 PM",
  sundayHours = "12:00 PM - 9:00 PM",
  minGuests = 20,
  deliveryFee = 100.0,
  backgroundColor = "bg-[#FBF9F6]", // Default background color as requested
}) => {
  return (
    <section id="kitchen-info" className={`${backgroundColor} py-16 sm:py-24`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Card container matching the original snippet layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-3xl border border-[#EFECE6] shadow-sm overflow-hidden">
          
          {/* Image Column */}
          <div className="relative h-72 sm:h-96 lg:h-full min-h-[350px] bg-[#FAF8F5]">
            <img
              src="/assets/Event.jpg"
              alt="Chef preparing food"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Content Column */}
          <div className="p-8 space-y-6 sm:p-12">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C05621]">
              Kitchen Hours
            </span>

            <h3 className="text-3xl font-serif font-bold text-[#0B2240]">
              A kitchen built around your event day
            </h3>

            {/* Structured Divider List */}
            <div className="border-t border-[#EFECE6] divide-y divide-[#EFECE6] text-sm">
              <div className="py-3 flex justify-between font-medium text-slate-600">
                <span>Mon - Sat</span>
                <span className="font-bold text-[#0B2240]">
                  {monSatHours}
                </span>
              </div>

              <div className="py-3 flex justify-between font-medium text-slate-600">
                <span>Sunday</span>
                <span className="font-bold text-[#0B2240]">
                  {sundayHours}
                </span>
              </div>

              <div className="py-3 flex justify-between font-medium text-slate-600">
                <span>Minimum</span>
                <span className="font-bold text-[#0B2240]">
                  {minGuests} guests required
                </span>
              </div>

              <div className="py-3 flex justify-between font-medium text-slate-600">
                <span>Delivery Fee</span>
                <span className="font-bold text-[#0B2240]">
                  ${deliveryFee.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};