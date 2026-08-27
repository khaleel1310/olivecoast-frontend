// 📁 frontend/src/components/IncludedBanner.tsx
import React from "react";

interface IncludedBannerProps {
  imageSrc?: string;
  quote?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

export const IncludedBanner: React.FC<IncludedBannerProps> = ({
  imageSrc = "/assets/package-Vigi.jpg",
  quote = "Freshly prepared meals delivered straight to your table or counter.",
  description = "Clean, fast, and secure checkout. Secure checkout powered by Stripe. Remaining balance due on event day.",
  ctaText = "Build Your Event",
  ctaHref = "#guests",
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <section className="rounded-3xl overflow-hidden bg-[#0A2015] text-white grid grid-cols-1 lg:grid-cols-2 shadow-md">
        {/* Image */}
        <div className="relative min-h-[300px] lg:min-h-[400px]">
          <img
            src={imageSrc}
            alt="Vigi package"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-8 sm:p-12 flex flex-col justify-center space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A3B899]">
            Included in Every Collection
          </span>

          <blockquote className="text-2xl sm:text-3xl font-serif italic text-white leading-relaxed">
            "{quote}"
          </blockquote>

          <p className="text-xs text-slate-300 leading-relaxed font-light">
            {description}
          </p>

          <div className="pt-2">
            <a
              href={ctaHref}
              className="inline-block px-6 py-3 bg-white text-[#0B2240] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors"
            >
              {ctaText}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};