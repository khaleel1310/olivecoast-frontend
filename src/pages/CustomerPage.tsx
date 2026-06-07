// 📁 frontend/src/pages/CustomerPage.tsx
import React, { useEffect, useState } from 'react';
import { ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../api/client';
import { MenuCard } from '../components/MenuCard';
import { Cart } from '../components/Cart';
import { useCartStore } from '../store/cart.store';

interface FlatMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  isAvailable: boolean;
  categoryName: string;
  imageUrl: string | null; // 📸 FIXED: Added support to track image asset locations in frontend states
}

interface BackendCategoryResponse {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  items: Array<{
    id: string;
    categoryId: string;
    name: string;
    description: string | null;
    price: number | string;
    imageUrl: string | null;
    isAvailable: boolean;
  }>;
}

export const CustomerPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<FlatMenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const cartItems = useCartStore((state) => state.items);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/menu');
        const data: BackendCategoryResponse[] = response.data;

        const flattenedItems: FlatMenuItem[] = [];
        const uniqueCategories: string[] = ['All'];

        data.forEach((category) => {
          if (category.isActive) {
            uniqueCategories.push(category.name);
            category.items.forEach((item) => {
              flattenedItems.push({
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                isAvailable: item.isAvailable,
                categoryName: category.name,
                imageUrl: item.imageUrl, // 🎯 FIXED: Mapping the cloud imageUrl database record straight down
              });
            });
          }
        });

        setMenuItems(flattenedItems);
        setCategories(uniqueCategories);
      } catch (err: any) {
        console.error(err);
        setError('Unable to parse the menu catalog layout.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.categoryName === selectedCategory);

  return (
    /* 🏛️ Updated background to an elegant, soft Mediterranean cream tone (#FBF9F6) */
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col font-sans selection:bg-[#0B2240] selection:text-white">
      
     {/* 🏙️ Rebranded Premium Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EFECE6] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-28 flex items-center justify-between">
          
          {/* 🍽️ Expanded Logo + Serif Brand Typography Combo */}
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#EFECE6] p-1 flex items-center justify-center shrink-0">
              <img 
                src="/assets/Olive_Coast_Logo.jpg" 
                alt="Olive Coast Emblem" 
                className="h-full w-full object-contain scale-110"
              />
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-serif font-bold text-[#0B2240] tracking-wide leading-tight">
                OLIVE COAST
              </h1>
              <span className="text-[10px] md:text-xs font-sans font-bold tracking-[0.2em] text-[#607A41] uppercase mt-0.5">
                Mediterranean Kitchen
              </span>
            </div>
          </div>

          {/* Floating Shopping Cart Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 rounded-xl border border-[#DCD7CC] bg-white text-[#0B2240] hover:border-[#0B2240] hover:text-[#0B2240] transition-all duration-200 shadow-sm active:scale-95"
          >
            <ShoppingCart size={22} />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#607A41] text-white font-extrabold text-[10px] h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <Loader2 size={32} className="animate-spin text-[#607A41]" />
            <p className="text-sm font-medium text-slate-500">Curating our fresh selection...</p>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-start gap-4 text-rose-800 my-12">
            <AlertCircle size={24} className="shrink-0 text-rose-500" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm">Data Extraction Error</h4>
              <p className="text-xs text-rose-600/90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Dynamic Category Navigation Tabs — Themed to Deep Navy (#0B2240) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-[#0B2240] text-white shadow-sm shadow-slate-900/10'
                      : 'bg-white text-slate-600 hover:bg-[#F5F2EC] border border-[#DCD7CC]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-medium text-sm">
                No items found under this category selection.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <MenuCard 
                    key={item.id} 
                    item={{
                      id: item.id,
                      name: item.name,
                      description: item.description,
                      price: item.price,
                      isAvailable: item.isAvailable,
                      imageUrl: item.imageUrl, // 🎯 FIXED: Relaying the cloud image string down into your custom card markup!
                      category: { name: item.categoryName }
                    }} 
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};