import { create } from 'zustand';

//  Type definitions for items in the cart
export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  // ➕ Add item to cart or increment quantity if it already exists
  addItem: (newItem) => set((state) => {
    const existingItem = state.items.find(item => item.menuItemId === newItem.menuItemId);
    
    if (existingItem) {
      return {
        items: state.items.map(item =>
          item.menuItemId === newItem.menuItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };
    }
    
    return { items: [...state.items, { ...newItem, quantity: 1 }] };
  }),

  // ❌ Remove an entire item from the cart list
  removeItem: (menuItemId) => set((state) => ({
    items: state.items.filter(item => item.menuItemId !== menuItemId)
  })),

  //  Fine-tune quantities directly from the input fields
  updateQuantity: (menuItemId, quantity) => set((state) => ({
    items: state.items
      .map(item => item.menuItemId === menuItemId ? { ...item, quantity } : item)
      .filter(item => item.quantity > 0) // Automatically drops the item if quantity hits 0
  })),

  //  Wipe the cart clean after a successful delivery checkout placement
  clearCart: () => set({ items: [] }),

  //  Compute the live transaction total on the fly
  getTotalPrice: () => {
    return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}));