import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuthStore } from "../store/auth.store";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  RefreshCw,
  Edit2,
  DollarSign,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  Loader2,
  Save,
  X,
  Upload,
} from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";

export const OwnerDashboard: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"orders" | "menu">("orders");
  const [orderFilter, setOrderFilter] = useState<"ALL" | "PENDING">("ALL");

  // Menu Creation Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newImgUrl, setNewImgUrl] = useState("");
  const [uploadingNew, setUploadingNew] = useState(false);

  // Inline Menu Editing State Tracking
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImgUrl, setEditImgUrl] = useState("");
  const [uploadingEdit, setUploadingEdit] = useState(false);

  const fetchData = async () => {
    try {
      const storedToken = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      };

      const [ordersRes, menuRes] = await Promise.all([
        api.get("/orders", config),
        api.get("/menu"),
      ]);
      setOrders(ordersRes.data);
      
      // Sanitizing array structure cleanly
      const rawMenuData = menuRes.data;
      if (Array.isArray(rawMenuData)) {
        // Force fully flattens nested arrays if the upstream network proxy slips up
        const flattened = rawMenuData.flat(Infinity);
        setCategories(flattened);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const doneCount = orders.filter((o) => o.status === "COMPLETED").length;
  const grossRevenue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);

  // 📸 NATIVE IMAGE FILE UPLOADER LOGIC TRAIN
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "NEW" | "EDIT",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    if (target === "NEW") setUploadingNew(true);
    if (target === "EDIT") setUploadingEdit(true);

    try {
      const storedToken = localStorage.getItem("token");
      const res = await api.post("/menu/upload", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${storedToken}`,
        },
      });

      const secureUrl = res.data.imageUrl;
      if (target === "NEW") setNewImgUrl(secureUrl);
      if (target === "EDIT") setEditImgUrl(secureUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to stream picture to cloud storage.");
    } finally {
      setUploadingNew(false);
      setUploadingEdit(false);
    }
  };

  const startEditing = (item: any) => {
    setEditingItemId(item.id);
    setEditName(item.name);
    setEditPrice(item.price);
    setEditDesc(item.description || "");
    setEditCategory(item.categoryId);
    setEditImgUrl(item.imageUrl || "");
  };

  const handleUpdateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemId) return;

    try {
      const storedToken = localStorage.getItem("token");
      await api.put(`/menu/${editingItemId}`, {
        name: editName,
        price: editPrice,
        description: editDesc,
        categoryId: editCategory,
        image: editImgUrl,
      }, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        }
      });
      setEditingItemId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to update dish entries.");
    }
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !newCategory)
      return alert("Please fill in required fields.");

    try {
      const storedToken = localStorage.getItem("token");
      await api.post("/menu", {
        name: newName,
        price: newPrice,
        description: newDesc,
        categoryId: newCategory,
        image: newImgUrl,
      }, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        }
      });

      setNewName("");
      setNewPrice("");
      setNewDesc("");
      setNewImgUrl("");
      setNewCategory("");
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to insert item.");
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (
      !confirm(
        "Hide this dish from the customer menu? (Existing orders remain completely intact)",
      )
    )
      return;
    try {
      const storedToken = localStorage.getItem("token");
      await api.delete(`/menu/${itemId}`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        }
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to remove item.");
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    navigate("/login");
  };

  const displayedOrders = orders.filter(
    (o) => orderFilter === "ALL" || o.status === "PENDING",
  );

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col font-sans selection:bg-[#0B2240] selection:text-white">
      <header className="sticky top-0 z-40 bg-white border-b border-[#EFECE6] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#EFECE6] p-1 flex items-center justify-center shrink-0">
              <img
                src="/assets/Olive_Coast_Logo.jpg"
                alt="Logo"
                className="h-full w-full object-contain scale-110"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-serif font-bold text-[#0B2240] tracking-wide leading-tight">
                OWNER SUITE
              </h1>
              <span className="text-[9px] sm:text-[10px] font-sans font-bold tracking-[0.15em] text-[#607A41] uppercase block mt-0.5">
                Olive Coast Analytics
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={fetchData}
              className="p-2.5 sm:p-3 rounded-xl border border-[#DCD7CC] bg-white text-[#0B2240] hover:border-[#0B2240] shadow-sm transition-all active:scale-95"
            >
              <RefreshCw size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-xs font-bold bg-white text-rose-600 rounded-xl border border-rose-200 hover:bg-rose-50 shadow-sm transition-all active:scale-95"
            >
              <LogOut size={13} /> <span className="hidden xs:inline">Leave Suite</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* 📊 Analytics Metric Banner Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Revenue */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EFECE6] shadow-sm flex items-center justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Gross Sales Realized
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0B2240] mt-1 truncate">
                {grossRevenue.toFixed(2)} <span className="text-xs font-bold text-slate-500">USD</span>
              </h3>
            </div>
            <div className="p-3 bg-[#FAF8F5] rounded-xl text-[#607A41] shrink-0">
              <DollarSign size={20} className="sm:w-6 sm:h-6" />
            </div>
          </div>

          {/* Card 2: Active Tickets */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EFECE6] shadow-sm flex items-center justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Active Backlog Tickets
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0B2240] mt-1 truncate">
                {pendingCount} <span className="text-xs font-medium text-slate-400">Orders</span>
              </h3>
            </div>
            <div className="p-3 bg-[#FAF8F5] rounded-xl text-amber-600 shrink-0">
              <Clock size={20} className="sm:w-6 sm:h-6" />
            </div>
          </div>

          {/* Card 3: Dispatched Deliveries */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EFECE6] shadow-sm flex items-center justify-between gap-3 sm:col-span-2 md:col-span-1">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Dispatched Deliveries
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0B2240] mt-1 truncate">
                {doneCount} <span className="text-xs font-medium text-slate-400">Completed</span>
              </h3>
            </div>
            <div className="p-3 bg-[#FAF8F5] rounded-xl text-[#607A41] shrink-0">
              <CheckCircle2 size={20} className="sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Tab Selection Headers */}
        <div className="flex border-b border-[#EFECE6] gap-6 sm:gap-8 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-4 text-xs sm:text-sm font-bold uppercase tracking-wide border-b-2 shrink-0 ${activeTab === "orders" ? "border-b-[#0B2240] text-[#0B2240]" : "border-transparent text-slate-400"}`}
          >
            📊 Order Pipeline
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`pb-4 text-xs sm:text-sm font-bold uppercase tracking-wide border-b-2 shrink-0 ${activeTab === "menu" ? "border-b-[#0B2240] text-[#0B2240]" : "border-transparent text-slate-400"}`}
          >
            📜 Menu Settings
          </button>
        </div>

        {/* ORDERS WINDOW */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 size={32} className="animate-spin mx-auto text-[#607A41]" />
          </div>
        ) : activeTab === "orders" ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-4 border border-[#EFECE6] rounded-xl gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Filter Pipelines:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setOrderFilter("ALL")}
                  className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${orderFilter === "ALL" ? "bg-[#0B2240] text-white" : "bg-[#FAF8F5] border text-[#0B2240]"}`}
                >
                  Show All History
                </button>
                <button
                  onClick={() => setOrderFilter("PENDING")}
                  className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${orderFilter === "PENDING" ? "bg-[#0B2240] text-white" : "bg-[#FAF8F5] border text-[#0B2240]"}`}
                >
                  Kitchen Active ({pendingCount})
                </button>
              </div>
            </div>

            {/* Responsive Table Wrapper */}
            <div className="bg-white rounded-2xl border border-[#EFECE6] shadow-sm overflow-x-auto scrollbar-none">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#EFECE6] text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="p-4">Ticket</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Items Ordered</th>
                    <th className="p-4">Total Value</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6] text-sm text-[#0B2240]">
                  {displayedOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-xs">
                        {ord.orderNumber}
                      </td>
                      <td className="p-4">
                        <span className="font-bold block">
                          {ord.customerName}
                        </span>
                        <span className="text-xs text-slate-400">
                          {ord.phoneNumber}
                        </span>
                      </td>
                      <td className="p-4 text-xs max-w-xs text-slate-600 truncate">
                        {ord.items
                          ?.map((it: any) => `${it.itemName} (×${it.quantity})`)
                          .join(", ")}
                      </td>
                      <td className="p-4 font-bold">
                        {parseFloat(ord.total).toFixed(2)} USD
                      </td>
                      <td className="p-4">
                        <StatusBadge status={ord.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* MENU WINDOW WITH INTEGRATED CREATION & INLINE EDITING */
          <div className="space-y-6">
            <div className="flex justify-between items-center gap-2">
              <h3 className="text-sm sm:text-md font-serif font-bold text-[#0B2240]">
                Global Master Menu List
              </h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#607A41] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
              >
                <Plus size={14} /> Add New Dish
              </button>
            </div>

            {showAddForm && (
              <form
                onSubmit={handleAddMenuItem}
                className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EFECE6] shadow-md grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Dish Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Spicy Batata Harra"
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:border-[#0B2240]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Price (USD) *
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="e.g., 6.50"
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:border-[#0B2240]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Target Category *
                  </label>
                  <select
                    required
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:border-[#0B2240]"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 📸 FIXED MOBILE FILE PICKER */}
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Dish Image Upload
                  </label>
                  <div className="flex items-center gap-4 mt-1">
                    <label className="flex items-center gap-2 px-4 py-2 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#DCD7CC] rounded-xl text-xs font-bold text-[#0B2240] cursor-pointer shadow-sm transition-all active:scale-95">
                      <Upload size={14} />{" "}
                      {uploadingNew ? "Streaming..." : "Choose Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "NEW")}
                        className="hidden"
                        disabled={uploadingNew}
                      />
                    </label>
                    {newImgUrl && (
                      <span className="text-[11px] text-[#607A41] font-bold">
                        ✓ Cloud Sync Ready!
                      </span>
                    )}
                  </div>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Menu Description
                  </label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Crispy golden potato cubes..."
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:border-[#0B2240]"
                  />
                </div>
                <div className="md:col-span-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-500 active:scale-95 transition-transform"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingNew}
                    className="px-4 py-2 bg-[#0B2240] text-white rounded-lg text-xs font-bold disabled:opacity-50 active:scale-95 transition-all"
                  >
                    Save to Database
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-6 sm:space-y-8">
              {categories.map((cat) => (
                <div key={cat.id} className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#607A41] border-b pb-1 border-[#EFECE6]">
                    {cat.name}
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {cat.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="bg-white p-4 rounded-xl border border-[#EFECE6] shadow-sm flex gap-4 items-center"
                      >
                        <div className="h-20 w-20 bg-slate-100 rounded-lg overflow-hidden border border-[#EFECE6] shrink-0">
                          <img
                            src={item.imageUrl || "/assets/placeholder.jpg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            onError={({ currentTarget }) => {
                              currentTarget.onerror = null;
                              currentTarget.src =
                                "https://images.unsplash.com/photo-1546069901-ba9597e63c?w=500&auto=format&fit=crop&q=60";
                            }}
                          />
                        </div>

                        <div className="flex-grow min-w-0">
                          {editingItemId === item.id ? (
                            /* INLINE EDIT MODE FORM PANEL */
                            <form
                              onSubmit={handleUpdateMenuItem}
                              className="space-y-2 py-1"
                            >
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full text-xs p-1.5 border rounded bg-slate-50 font-bold focus:outline-none"
                                required
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(e.target.value)}
                                  className="text-xs p-1.5 border rounded bg-slate-50 font-medium focus:outline-none"
                                  required
                                  placeholder="Price"
                                />
                                <select
                                  value={editCategory}
                                  onChange={(e) =>
                                    setEditCategory(e.target.value)
                                  }
                                  className="text-xs p-1.5 border rounded bg-slate-50 focus:outline-none"
                                >
                                  {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              /* 📸 FIXED INLINE EDIT MOBILE FILE PICKER */
                              <div className="flex items-center gap-2 py-1">
                                <label className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#DCD7CC] rounded-xl text-[11px] font-bold text-[#0B2240] cursor-pointer shadow-sm transition-all">
                                  <Upload size={12} />{" "}
                                  {uploadingEdit ? "Streaming..." : "Change Photo"}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleImageUpload(e, "EDIT")
                                    }
                                    className="hidden"
                                    disabled={uploadingEdit}
                                  />
                                </label>
                                {editImgUrl && (
                                  <span className="text-[10px] text-[#607A41] font-bold">
                                    ✓ Uploaded
                                  </span>
                                )}
                              </div>

                              <input
                                type="text"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="w-full text-xs p-1.5 border rounded bg-slate-50 text-slate-500 focus:outline-none"
                                placeholder="Description"
                              />
                              <div className="flex gap-2 justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingItemId(null)}
                                  className="p-1 px-2 bg-slate-100 text-slate-500 rounded text-[11px] font-bold flex items-center gap-1 transition-transform active:scale-95"
                                >
                                  <X size={12} /> Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={uploadingEdit}
                                  className="p-1 px-2 bg-[#0B2240] text-white rounded text-[11px] font-bold flex items-center gap-1 disabled:opacity-50 transition-all active:scale-95"
                                >
                                  <Save size={12} /> Save
                                </button>
                              </div>
                            </form>
                          ) : (
                            /* STANDARD PREVIEW DISPLAY FLOW */
                            <>
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                  <p className="font-bold text-[#0B2240] text-sm truncate">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                    {item.description ||
                                      "No description provided."}
                                  </p>
                                </div>
                                <span className="text-xs font-extrabold text-[#607A41] bg-[#FAF8F5] border px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                                  {parseFloat(item.price).toFixed(2)} USD
                                </span>
                              </div>

                              <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-dashed border-slate-100">
                                <button
                                  onClick={() => startEditing(item)}
                                  className="p-2 text-slate-400 hover:text-[#0B2240] hover:bg-slate-50 rounded-lg transition-all active:scale-95"
                                  title="Edit Product"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteMenuItem(item.id)}
                                  className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-95"
                                  title="Remove Product"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};