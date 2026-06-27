import React, { useState } from "react";
import { ShoppingBag, Trash2, Plus, Minus, X, CheckCircle } from "lucide-react";
import { useCartStore } from "../store/cart.store";
import { api } from "../api/client";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } =
    useCartStore();

  // Delivery Input States
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Status/Result States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string | null>(
    null,
  );
  // Cache total price temporarily so it stays visible on the success screen after clearing the cart
  const [finalPrice, setFinalPrice] = useState<string>("0.00");

  if (!isOpen) return null;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    const formattedItems = items.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
    }));

    try {
      // Capture total before clearing cart state
      const totalAmount = getTotalPrice().toFixed(2);

      const response = await api.post("/orders", {
        customerName,
        phoneNumber,
        deliveryAddress,
        notes: notes || undefined,
        items: formattedItems,
      });

      const placedOrder = response.data.order;
      setFinalPrice(totalAmount);
      setSuccessOrderNumber(placedOrder.orderNumber);
      clearCart();
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error || "Failed to place order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessOrderNumber(null);
    setFinalPrice("0.00");
    setCustomerName("");
    setPhoneNumber("");
    setDeliveryAddress("");
    setNotes("");
    onClose();
  };

  // 💬 BUILD DYNAMIC MESSENGER URL ROUTE PIPELINE
  const getMessengerUrl = () => {
    const facebookPageName = "OliveCoastRest"; 
    const message = `Hi! I just placed order #${successOrderNumber} (${finalPrice} USD) on the website. Please confirm my order!`;
    return `https://m.me/${facebookPageName}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Dark overlay backdrop background */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* 📱 RESPONSIVE DRAWER FRAME CONTAINER */}
      <div className="absolute bottom-0 sm:top-0 sm:bottom-auto right-0 w-full sm:max-w-md h-[94vh] sm:h-full bg-white rounded-t-3xl sm:rounded-t-none sm:rounded-l-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-out">
        {/* Mobile Swipe/Pull Indicator Accent Bar */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-3 block sm:hidden shrink-0" />

        {/* Header Panel */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-[#0B2240]" size={20} />
            <h2 className="text-lg font-serif font-bold text-[#0B2240]">
              Your Selection
            </h2>
            <span className="bg-[#FAF8F5] border border-[#EFECE6] text-[#607A41] text-xs px-2.5 py-0.5 rounded-full font-bold">
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Core Scrollable Content Panel */}
        <div className="flex-grow overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-none">
          {successOrderNumber ? (
            /* Success Confirmation View Card Layout */
            <div className="flex flex-col items-center justify-center text-center py-6 space-y-4 h-full justify-self-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-1">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#0B2240]">
                Sahtein! Order Received
              </h3>
              <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                Your kitchen ticket has been generated successfully under
                tracking token:
              </p>
              <div className="bg-[#0B2240] text-amber-400 font-mono font-extrabold text-xl px-6 py-3 rounded-xl tracking-wider shadow-sm">
                #{successOrderNumber}
              </div>

              {/* ⚡ NEW: FACEBOOK CONVERSION CTA CALLOUT CONTAINER BOX */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 max-w-xs mt-2 text-left space-y-3">
                <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                  📢 <strong className="font-bold">Final Step:</strong> To guarantee immediate prep, click below to ping our team on Facebook Messenger with your order tracking number!
                </p>
                <a
                  href={getMessengerUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#0084FF] hover:bg-[#0072DD] text-white font-bold text-xs py-3 px-4 rounded-xl transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.145 2 11.257c0 2.914 1.46 5.518 3.753 7.185V22l3.428-1.883a11.216 11.216 0 002.819.356c5.523 0 10-4.145 10-9.256C22 6.145 17.523 2 12 2zm1.061 12.622l-2.556-2.733-4.99 2.733 5.485-5.83 2.61 2.733 4.935-2.733-5.484 5.83z" />
                  </svg>
                  Confirm via Messenger
                </a>
              </div>

              <button
                onClick={handleCloseSuccess}
                className="w-full max-w-xs py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Return to Menu
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 text-slate-400 space-y-3 h-full">
              <ShoppingBag
                size={48}
                className="stroke-[1.5] text-slate-300 animate-pulse"
              />
              <p className="text-sm font-bold text-slate-500">
                Your cart is empty
              </p>
              <p className="text-xs max-w-[200px] text-slate-400">
                Add dishes from the menu to build your feast!
              </p>
            </div>
          ) : (
            /* Core Active List Items Stack Container */
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex items-center justify-between gap-4 p-3 rounded-xl border border-[#EFECE6] bg-[#FAF8F5]"
                >
                  <div className="flex-grow">
                    <h4 className="font-bold text-[#0B2240] text-sm line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[#607A41] font-bold text-xs mt-0.5">
                      {(item.price * item.quantity).toFixed(2)} USD
                    </p>
                  </div>

                  {/* Stepper Quantity Counter Controls Block */}
                  <div className="flex items-center gap-2 bg-white rounded-xl border border-[#DCD7CC] p-1 shrink-0">
                    <button
                      onClick={() =>
                        updateQuantity(item.menuItemId, item.quantity - 1)
                      }
                      className="p-1 rounded-md text-slate-500 hover:bg-slate-50"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-bold text-[#0B2240] w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.menuItemId, item.quantity + 1)
                      }
                      className="p-1 rounded-md text-slate-500 hover:bg-slate-50"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.menuItemId)}
                    className="text-slate-400 hover:text-rose-500 p-1 shrink-0 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {/* Delivery Target Identity Form */}
              <form
                id="checkout-form"
                onSubmit={handlePlaceOrder}
                className="pt-6 border-t border-[#EFECE6] space-y-4"
              >
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#607A41]">
                  Delivery Details
                </h3>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0B2240]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Khaleel Al-Gohany"
                    className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#DCD7CC] rounded-xl focus:outline-none focus:border-[#0B2240]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0B2240]">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 0791234567"
                    className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#DCD7CC] rounded-xl focus:outline-none focus:border-[#0B2240]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0B2240]">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Area, Street name, Building"
                    className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#DCD7CC] rounded-xl focus:outline-none focus:border-[#0B2240]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0B2240]">
                    Special Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Apartment number, gate codes, etc..."
                    className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#DCD7CC] rounded-xl focus:outline-none focus:border-[#0B2240] resize-none"
                  />
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Sticky Lower Interactive Purchase Box Row */}
        {!successOrderNumber && items.length > 0 && (
          <div className="p-5 sm:p-6 border-t border-[#EFECE6] bg-[#FAF8F5] rounded-t-xl sm:rounded-none shrink-0 space-y-4 pb-8 sm:pb-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Amount:
              </span>
              <span className="text-xl font-black text-[#0B2240]">
                {getTotalPrice().toFixed(2)} USD
              </span>
            </div>

            {error && (
              <div className="text-rose-600 text-xs font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full py-3.5 bg-[#0B2240] hover:bg-[#15345c] disabled:bg-slate-300 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.99] shadow-sm"
            >
              {loading ? "Processing Order..." : "Confirm & Place Order"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};