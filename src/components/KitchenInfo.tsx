// 📁 frontend/src/components/KitchenInfo.tsx
import React from "react";
import { Clock, Users, DollarSign, Calendar } from "lucide-react";

interface KitchenInfoProps {
  monSatHours?: string;
  sundayHours?: string;
  minGuests?: number;
  deliveryFee?: number;
}

export const KitchenInfo: React.FC<KitchenInfoProps> = ({
  monSatHours = "11:00 AM - 10:00 PM",
  sundayHours = "12:00 PM - 9:00 PM",
  minGuests = 20,
  deliveryFee = 100.0,
}) => {
  return (
    <section id="kitchen-info" className="bg-[#FBF9F6] py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Image & Floating Badge Column */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden border border-[#EFECE6] shadow-lg bg-[#FAF8F5]">
              <img
                src="/assets/Event.jpg"
                alt="Chef preparing food"
                className="w-full h-[400px] sm:h-[500px] object-cover"
              />
            </div>
          </div>

          {/* Content Column */}
          <div className="space-y-6 order-1 lg:order-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D56A38]">
              Kitchen & Schedule
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#0B2240] leading-[1.1]">
              A kitchen built around
              <span className="text-[#607A41]"> your event day</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-7 font-light">
              We coordinate our preparation schedules directly around your event timeline, ensuring every dish is packed fresh, delivered promptly, and ready to serve when your guests arrive.
            </p>

            {/* Feature Grid matching AboutUs grid spacing and card layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#0B2240]/5 flex items-center justify-center text-[#0B2240] shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B2240]">
                    Mon - Sat
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {monSatHours}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#0B2240]/5 flex items-center justify-center text-[#0B2240] shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B2240]">
                    Sunday Hours
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {sundayHours}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#0B2240]/5 flex items-center justify-center text-[#0B2240] shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B2240]">
                    Minimum Order
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {minGuests} guests required.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#0B2240]/5 flex items-center justify-center text-[#0B2240] shrink-0">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B2240]">
                    Delivery Fee
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    ${deliveryFee.toFixed(2)} flat rate.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA matching AboutUs style */}
            <div className="pt-4">
              <a
                href="#guests"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#0B2240] text-white text-[10px] font-bold tracking-[0.25em] uppercase hover:bg-[#15345b] transition-colors rounded-xl shadow-sm"
              >
                Plan Your Event
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};