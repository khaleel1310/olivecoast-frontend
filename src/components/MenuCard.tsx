// 📁 frontend/src/components/MenuCard.tsx
import React from 'react';
import { Plus } from 'lucide-react';
import { useCartStore } from '../store/cart.store';

interface MenuItemProps {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  isAvailable: boolean;
  imageUrl: string | null; // 📸 FIXED: Added support to read the Cloudinary URL passed from the parent grid
  category: {
    name: string;
  };
}

export const MenuCard: React.FC<{ item: MenuItemProps }> = ({ item }) => {
  const addItem = useCartStore((state) => state.addItem);
  const numericPrice = Number(item.price);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EFECE6] overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      
      {/* 📸 Upgraded Dynamic Food Thumbnail Box */}
      <div className="h-44 w-full bg-[#FAF8F5] relative overflow-hidden border-b border-[#EFECE6] group">
        <img 
          src={item.imageUrl || '/assets/placeholder.jpg'} 
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          // 🛡️ The Ultimate Infinite Loop Protection Shield:
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // ❌ Kill event listener immediately if file fails
            currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'; // 🌍 Safe cloud backup thumbnail
          }}
        />
        
        {/* Subtle Category overlay tag floating on top of the picture */}
        <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-md text-[#0B2240] text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md border border-[#EFECE6]">
          {item.category.name}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <h3 className="text-base font-bold text-[#0B2240] line-clamp-1">{item.name}</h3>
          <span className="text-base font-extrabold text-[#0B2240] shrink-0 whitespace-nowrap">
            {numericPrice.toFixed(2)} USD
          </span>
        </div>

        <p className="text-slate-500 text-xs line-clamp-2 mb-5 flex-grow leading-relaxed">
          {item.description || "Freshly crafted using authentic Mediterranean ingredients."}
        </p>

        {/* Action Button — Themed to Olive Branch Green (#607A41) */}
        <button
          onClick={() => addItem({ menuItemId: item.id, name: item.name, price: numericPrice })}
          disabled={!item.isAvailable}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 ${
            item.isAvailable
              ? 'bg-[#607A41] text-white hover:bg-[#506637] active:scale-[0.98] shadow-sm'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {item.isAvailable ? (
            <>
              <Plus size={14} /> Add to Order
            </>
          ) : (
            'Sold Out'
          )}
        </button>
      </div>
    </div>
  );
};