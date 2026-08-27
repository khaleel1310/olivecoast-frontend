// 📁 frontend/src/components/PackageCard.tsx
import React from "react";
import { Check } from "lucide-react";

interface Package {
  id: string | number;
  name: string;
  description: string;
  pricePerPerson: string | number;
}

interface PackageCardProps {
  pkg: Package;
  imageUrl: string;
  isSelected: boolean;
  onSelect: (pkg: Package) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  imageUrl,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(pkg)}
      className={`group relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all bg-white shadow-sm flex min-h-[220px] ${
        isSelected
          ? "border-[#0B2240] ring-2 ring-[#0B2240]/10"
          : "border-[#EFECE6] hover:border-[#DCD7CC] hover:shadow-md"
      }`}
    >
      {/* IMAGE */}
      <div className="relative w-[24%] min-w-[90px] overflow-hidden">
        <img
          src={imageUrl}
          alt={pkg.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/20" />

        {/* Decorative Accent */}
        <div className="absolute left-3 top-3 h-8 w-[2px] rounded-full bg-white/80" />
      </div>

      {/* CONTENT */}
      <div className="relative flex flex-1 flex-col justify-between p-5">
        {/* Selected Check */}
        {isSelected && (
          <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#0B2240] text-white shadow-sm">
            <Check size={14} strokeWidth={3} />
          </div>
        )}

        {/* Package Info */}
        <div className={isSelected ? "pr-8" : ""}>
          <h3 className="font-bold text-[#0B2240] text-base">{pkg.name}</h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
            {pkg.description}
          </p>
        </div>

        {/* Price */}
        <div className="mt-4 pt-3 border-t border-[#FAF8F5]">
          <span className="font-black text-[#0B2240] text-base">
            ${parseFloat(String(pkg.pricePerPerson)).toFixed(2)}
          </span>

          <span className="text-xs text-slate-400 font-medium"> /guest</span>
        </div>
      </div>
    </div>
  );
};