import React, { useState, useEffect } from "react";
import { ref, push, update } from "firebase/database";
import { db } from "../../firebase";
import { FiEdit, FiTrash2, FiSearch, FiPackage, FiPlus, FiImage, FiChevronDown, FiStar } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import type { PopupState, Category, Item } from "./types";
import FeaturedGallery from "./FeaturedGallery";
import CustomSelect from "./CustomSelect";
import { useToast } from "./ToastProvider";


/* ================== auto load feature images from public/featured ================== */
const galleryImages = Object.keys(
  import.meta.glob("/public/images/*")
).map((path) => path.replace("/public/images/", ""));
/* ================================================================== */

interface Props {
  categories: Record<string, Category>;
  items: Record<string, Item>;
  setPopup: (popup: PopupState) => void;
}

const ItemSection: React.FC<Props> = ({ categories, items, setPopup }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemIngredients, setItemIngredients] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [quickSearch, setQuickSearch] = useState("");

  const [selectedCategoryError, setSelectedCategoryError] = useState(false);
  const [itemNameError, setItemNameError] = useState(false);
  const [itemPriceError, setItemPriceError] = useState(false);
  const { showToast } = useToast();

  // ================== Gallery state ==================
  const [showGallery, setShowGallery] = useState(false);
  const [galleryForItemId, setGalleryForItemId] = useState<string | null>(null);
  const [itemImage, setItemImage] = useState("");

  // ================== Local state for items ==================
  const [localItems, setLocalItems] = useState<Record<string, Item>>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // ================== Firebase updates ==================
  const addItem = async () => {
    // ===== فاليديشن =====
    let hasError = false;
    if (!selectedCategory) { setSelectedCategoryError(true); hasError = true; }
    if (!itemName.trim()) { setItemNameError(true); hasError = true; }

    const priceArray = itemPrice.split(",").map(p => p.trim());
    if (!itemPrice.trim() || priceArray.some(p => isNaN(Number(p)) || Number(p) <= 0)) {
      setItemPriceError(true);
      hasError = true;
    }

    if (hasError) return;

    await push(ref(db, "items"), {
      name: itemName,
      ingredients: itemIngredients,
      price: itemPrice,
      categoryId: selectedCategory,
      visible: true,
      createdAt: Date.now(),
      image: itemImage || "", // ✅
      star: false,
    });

    // Reset form
    setItemName("");
    setItemIngredients("");
    setItemPrice("");
    setSelectedCategory("");
    setItemImage("");

    // Show toast
    showToast("تم إضافة المنتج بنجاح", "success");
  };

  const toggleItem = async (id: string, visible: boolean) => {
    await update(ref(db, `items/${id}`), { visible: !visible });
  };

  const updateImage = async (id: string, image: string) => {
    await update(ref(db, `items/${id}`), { image });
  };

  const removeImage = async (id: string) => {
    await update(ref(db, `items/${id}`), { image: "" });
  };

  const openGallery = (itemId: string, currentImage?: string) => {
    setGalleryForItemId(itemId);
    setItemImage(currentImage || "");
    setShowGallery(true);
  };

  const handleSelectImage = async (img: string) => {
    if (!galleryForItemId) return;
    await updateImage(galleryForItemId, img);
    setShowGallery(false);
  };


  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (


    <div className="glass-morphic p-5 md:p-6 rounded-3xl border border-white/5 relative bg-luxury-black/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
          <FiPackage size={18} />
        </div>
        <h2 className="text-xl font-black text-white">إدارة المنتجات</h2>
      </div>

      {/* ================== إضافة صنف ================== */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-10 relative overflow-hidden group">

        <div className="absolute inset-0 bg-linear-to-br from-gold/5 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="md:col-span-2">
            <h3 className="text-gold text-md font-bold uppercase tracking-[0.15em] mb-2">
              إضافة منتج جديد
            </h3>
          </div>

          {/* الفئة */}
          <div className="flex flex-col gap-1">
            <label className="text-sm uppercase tracking-widest text-white/40 font-bold mr-1">
              فئة المنتج
            </label>

            <CustomSelect
              options={Object.keys(categories).map(id => ({ id, name: categories[id].name }))}
              value={selectedCategory}
              onChange={(val) => { setSelectedCategory(val); setSelectedCategoryError(false); }}
              error={selectedCategoryError}
              placeholder="اختر الفئة"
            />

            {selectedCategoryError && (
              <span className="text-[9px] text-red-500 font-bold mr-1 mt-0.5">
                الرجاء اختيار قسم
              </span>
            )}
          </div>

          {/* اسم الصنف */}
          <div className="flex flex-col gap-1">
            <label className="text-sm uppercase tracking-widest text-white/40 font-bold mr-1">
              اسم الصنف
            </label>

            <input
              className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-gold/50 transition-all font-semibold placeholder:text-white/20
        ${itemNameError ? "border-red-500" : "border-white/10"}`}
              placeholder="مثال: بيتزا مارجريتا"
              value={itemName}
              onChange={(e) => { setItemName(e.target.value); setItemNameError(false); }}
            />

            {itemNameError && (
              <span className="text-sm  text-red-500 font-bold mr-1 mt-0.5">
                الرجاء إدخال اسم الصنف
              </span>
            )}
          </div>

          {/* الوصف */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm  uppercase tracking-widest text-white/40 font-bold mr-1">
              الوصف (اختياري)
            </label>

            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-gold/50 transition-all font-semibold placeholder:text-white/20"
              placeholder="وصف مختصر للمنتج..."
              value={itemIngredients}
              onChange={(e) => setItemIngredients(e.target.value)}
            />
          </div>

          {/* السعر */}
          <div className="flex flex-col gap-1">
            <label className="text-sm  uppercase tracking-widest text-white/40 font-bold mr-1">
              الأسعار
            </label>

            <input
              className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-gold/50 transition-all font-semibold placeholder:text-white/20
        ${itemPriceError ? "border-red-500" : "border-white/10"}`}
              placeholder="20, 35, 50"
              value={itemPrice}
              onChange={(e) => { setItemPrice(e.target.value); setItemPriceError(false); }}
            />

            {itemPriceError && (
              <span className="text-sm  text-red-500 font-bold mr-1 mt-0.5">
                الرجاء إدخال أسعار صحيحة
              </span>
            )}
          </div>

          {/* زر الإضافة */}
          <div className="flex items-end">
            <button
              onClick={addItem}
              className="w-full bg-gold text-luxury-black font-bold py-2.5 rounded-xl hover:bg-gold/90 transition-all shadow-lg shadow-gold/20 text-sm uppercase tracking-wide active:scale-95 flex items-center justify-center gap-1.5"
            >
              <FiPlus size={14} />
              إضافة
            </button>
          </div>

        </div>
      </div>

      {/* ================== البحث ================== */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-white/20">
          <FiSearch size={18} />
        </div>
        <input
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pr-10 pl-4 text-white outline-none focus:border-gold/50 focus:bg-white/10 transition-all font-bold placeholder:text-white/10 text-sm"
          placeholder="ابحث عن أي منتج، فئة، أو سعر..."
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
        />
      </div>

      {/* ================== الأقسام ================== */}
      <div className="space-y-6">
        {Object.keys(categories).map(catId => {
          const cat = categories[catId];
          const catItems = Object.keys(localItems)
            .map(id => ({ ...localItems[id], id }))
            .filter(item => item.categoryId === catId)
            .filter(item => {
              const search = quickSearch.toLowerCase();
              return (
                item.name.toLowerCase().includes(search) ||
                cat.name.toLowerCase().includes(search) ||
                item.price.split(",").some(p => p.includes(search))
              );
            });

          const isExpanded = expandedSections[catId] ?? false;

          return (
            <div key={catId} className="rounded-3xl border border-white/5 overflow-hidden transition-all duration-300">
              <div
                className={`flex justify-between items-center cursor-pointer px-6 py-4 transition-all duration-500
                ${isExpanded ? "bg-white/10 border-b border-white/5" : "bg-white/5 hover:bg-white/10"}`}
                onClick={() => toggleSection(catId)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-md font-black text-white">{cat.name}</span>
                  <span className="px-3 py-1 rounded-full bg-gold text-luxury-black text-[10px] font-black uppercase tracking-widest">
                    {catItems.length}
                  </span>
                </div>
                <div className={`text-white/40 transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`}>
                  <FiChevronDown size={20} />
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 md:p-6 space-y-4">
                      {catItems.map(item => (
                        <div
                          key={item.id}
                          className={`flex flex-col lg:flex-row justify-between items-start lg:items-center p-4 rounded-2xl border border-white/5 bg-white/2 group transition-all duration-300 hover:bg-white/5 hover:border-gold/20
                            ${!item.visible ? "opacity-40" : ""}`}
                        >
                          <div className="flex-1 min-w-0 flex items-center gap-5 w-full lg:w-auto">
                            <div className="relative group/thumb shrink-0">
                              {item.image ? (
                                <>
                                  <img
                                    src={`/images/${item.image}`}
                                    alt={item.name}
                                    className="w-12 h-12 object-cover bg-luxury-black border border-white/10 rounded-xl group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                                    onError={(e) => {
                                      e.currentTarget.src = "/images/placeholder.png";
                                    }}
                                    onClick={() => openGallery(item.id, item.image)}
                                  />
                                  <button
                                    onClick={() => removeImage(item.id)}
                                    className="absolute -top-2 -right-2 w-6 h-6 flex justify-center items-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-all text-xs opacity-0 group-hover/thumb:opacity-100 scale-50 group-hover/thumb:scale-100 z-10"
                                  >
                                    ×
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => openGallery(item.id)}
                                  className="w-12 h-12 flex flex-col justify-center items-center rounded-xl bg-white/5 border border-dashed border-white/20 text-white/20 hover:text-gold hover:border-gold/40 hover:bg-gold/5 transition-all duration-300"
                                >
                                  <FiImage size={20} />
                                  <span className="text-[7px] mt-1 font-black uppercase tracking-widest">إضافة</span>
                                </button>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm md:text-base font-black text-white truncate">{item.name}</p>
                                {item.star && (
                                  <div className="px-2 py-0.5 rounded-lg bg-gold/10 text-gold border border-gold/20 text-[7px] font-black uppercase tracking-widest flex items-center gap-1">
                                    <FaStar size={7} /> مميز
                                  </div>
                                )}
                              </div>
                              {item.ingredients && (
                                <p className="text-white/40 text-xs md:text-sm truncate mt-1 italic font-medium">{item.ingredients}</p>
                              )}
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {item.price.split(",").map((p, i) => (
                                  <span key={i} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-gold text-xs font-black">
                                    {p.trim()} ₪
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 mt-4 lg:mt-0 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                            <button
                              onClick={() => toggleItem(item.id, item.visible)}
                              className={`min-w-[90px] px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all duration-300 border
                                ${item.visible
                                  ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                                  : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"}`}
                            >
                              {item.visible ? "نشط حالياً" : "غير مفعل"}
                            </button>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const itemData = localItems[item.id];
                                  setPopup({
                                    type: "editItem",
                                    id: item.id,
                                    editItemValues: {
                                      itemName: itemData.name,
                                      itemPrice: itemData.price,
                                      selectedCategory: itemData.categoryId,
                                      itemIngredients: itemData.ingredients || "",
                                    }
                                  });
                                }}
                                className="w-9 h-9 flex justify-center items-center bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all duration-300"
                              >
                                <FiEdit size={14} />
                              </button>

                              <button
                                onClick={() => setPopup({ type: "deleteItem", id: item.id })}
                                className="w-9 h-9 flex justify-center items-center bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all duration-300"
                              >
                                <FiTrash2 size={14} />
                              </button>

                              <button
                                onClick={async () => {
                                  if (!item.visible) return;
                                  const newStar = !localItems[item.id].star;
                                  await update(ref(db, `items/${item.id}`), { star: newStar });
                                  setLocalItems(prev => ({
                                    ...prev,
                                    [item.id]: { ...prev[item.id], star: newStar }
                                  }));
                                }}
                                className={`w-9 h-9 flex justify-center items-center rounded-xl transition-all duration-300 border
                                  ${!item.visible
                                    ? "text-white/10 border-white/5 cursor-not-allowed"
                                    : localItems[item.id].star
                                      ? "bg-gold/10 text-gold border-gold/40"
                                      : "bg-white/5 text-white/40 border-white/10 hover:text-gold hover:border-gold/30"}`}
                              >
                                <FiStar size={18} className={localItems[item.id].star ? "fill-gold" : ""} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {catItems.length === 0 && (
                        <div className="text-center py-10 text-white/20 font-bold border-2 border-dashed border-white/5 rounded-3xl">
                          لا يوجد منتجات في هذه الفئة
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <FeaturedGallery
        visible={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={handleSelectImage}
        galleryImages={galleryImages}
        selectedImage={itemImage}
      />
    </div>
  );
};

export default ItemSection;
