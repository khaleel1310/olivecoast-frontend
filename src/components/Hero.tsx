// 📁 frontend/src/components/Hero.tsx
import React from "react";

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0B2240]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/assets/service-weddings-BG8t11UT.jpg"
          alt="Mediterranean catering table"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Cinematic Overlay */}
      <div className="absolute inset-0 bg-black/25"></div>

      {/* Darker bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-[#0B170F]/90"></div>

      {/* Subtle left-side darkening */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent"></div>

      {/* =========================
          HERO CONTENT
      ========================= */}
      <div className="relative z-10 min-h-[calc(100vh-100px)] max-w-[1180px] mx-auto px-6 lg:px-10 flex items-end pb-20 lg:pb-24">
        <div className="max-w-[760px]">
          {/* Main Heading */}
          <h1 className="font-serif text-white text-5xl sm:text-6xl lg:text-[72px] leading-[0.98] tracking-[-0.025em] font-normal">
            The Mediterranean table,
            <br />
            brought to your celebration
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-[650px] text-sm sm:text-base leading-7 text-white/85 font-light">
            Chef-crafted collections built on olive oil, citrus, charcoal and
            the generosity of a long table shared with people you love.
          </p>

          {/* Working Hours */}
          <div className="mt-5 text-white/80 text-xs sm:text-sm">
            <span className="mx-2 text-white/40">•</span>
            <span>Sun–Thu: 11 AM–10 PM</span>
            <span className="mx-2 text-white/40">•</span>
            <span>Fri–Sat: 11 AM–1 AM</span>
          </div>

          {/* CTA Buttons */}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#guests"
              className="px-9 py-4 bg-[#D56A38] text-white text-[10px] font-bold tracking-[0.25em] uppercase hover:bg-[#C45C2D] transition-colors"
            >
              Build Your Event
            </a>

            <a
              href="#about-us"
              className="px-9 py-4 border border-white/45 bg-black/10 text-white text-[10px] font-bold tracking-[0.25em] uppercase hover:bg-white hover:text-[#0B2240] transition-all"
            >
              Meet Our Story
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};