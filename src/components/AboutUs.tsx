// 📁 frontend/src/components/AboutUs.tsx
import React from "react";
import { Users, Leaf, Clock, MapPin } from "lucide-react";

export const AboutUs: React.FC = () => {
  return (
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
              <span className="text-[#607A41]"> made for gathering</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-7 font-light">
              Olive Coast was built on a simple idea: great food brings people
              together. We craft chef-inspired Mediterranean collections for
              events of all kinds — weddings, corporate dinners, family
              celebrations, and everything in between.
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-7 font-light">
              Every collection is prepared with fresh olive oil, citrus, herbs,
              and the same care we would serve at our own table. From hummus and
              falafel to grilled vegetables and artisan bread, we keep the
              flavors honest, the portions generous, and the experience
              effortless.
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
  );
};