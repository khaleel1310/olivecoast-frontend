// 📁 frontend/src/components/Header.tsx
import React from "react";
import { Phone } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EFECE6] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#EFECE6] p-1 flex items-center justify-center shrink-0">
            <img
              src="/assets/Olive_Coast_Logo.jpg"
              alt="Logo"
              className="h-full w-full object-contain scale-110"
            />
          </div>

          <div>
            <h1 className="text-xl font-serif font-bold text-[#0B2240] tracking-wide leading-tight">
              OLIVE COAST
            </h1>
            <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#607A41] uppercase block mt-0.5">
              Premium Event Catering
            </span>
          </div>
        </div>

        {/* Navigation Links matching UI */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-[#0B2240]">
          <a
            href="#packages"
            className="hover:text-[#607A41] transition-colors"
          >
            Packages
          </a>
          <a href="#guests" className="hover:text-[#607A41] transition-colors">
            Guests
          </a>
          <a
            href="#food-upgrades"
            className="hover:text-[#607A41] transition-colors"
          >
            Food Upgrades
          </a>
          <a href="#drinks" className="hover:text-[#607A41] transition-colors">
            Drinks & Beverages
          </a>
          <a
            href="#logistics"
            className="hover:text-[#607A41] transition-colors"
          >
            Event Logistics
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="tel:+18036161856"
            className="flex items-center gap-2 text-xs font-bold text-white bg-[#0B2240] px-4 py-2 rounded-lg shadow-sm hover:bg-[#15345b] transition-colors"
          >
            <Phone size={14} />
            <span>+1 (803) 616-1856</span>
          </a>
        </div>
      </div>
    </header>
  );
};