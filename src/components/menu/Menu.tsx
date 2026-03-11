import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { ref, onValue } from "firebase/database";
import CategorySection from "./CategorySection";
import { motion } from "framer-motion";

/* ================= Types ================= */
export interface Category {
  id: string;
  name: string;
  available?: boolean;
  order?: number;
  createdAt?: number;
}

export interface Item {
  featured: any;
  image: string | undefined;
  id: string;
  name: string;
  price: number;
  ingredients?: string;
  priceTw?: number;
  categoryId: string;
  visible?: boolean;
  star?: boolean;
  createdAt?: number;
}

/* ================= LocalStorage ================= */
const saveToLocal = (cats: Category[], its: Item[], orderSystem: boolean) => {
  localStorage.setItem(
    "menu_cache",
    JSON.stringify({
      categories: cats,
      items: its,
      orderSystem,
      savedAt: Date.now(),
    })
  );
};

const loadFromLocal = () => {
  const cached = localStorage.getItem("menu_cache");
  if (!cached) return null;
  return JSON.parse(cached);
};

/* ================= Main Component ================= */
interface Props {
  onLoadingChange?: (loading: boolean) => void;
  onFeaturedCheck?: (hasFeatured: boolean) => void;
}

export default function Menu({ onLoadingChange, onFeaturedCheck }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderSystem, setOrderSystem] = useState<boolean>(true);

  const [toast, setToast] = useState<{ message: string; color: "green" | "red" } | null>(null);
  const [activeCatId, setActiveCatId] = useState<string | null>("all");

  /* ================= Load Backup JSON ================= */
  const loadMenuJson = async () => {
    try {
      const res = await fetch("/menu.json");
      const data = await res.json();

      const cats: Category[] = Object.entries(data.categories || {}).map(
        ([id, v]: any) => ({
          id,
          name: v.name,
          available: v.available !== false,
          order: v.order ?? 0,
          createdAt: v.createdAt || 0,
        })
      ).sort((a, b) => a.order - b.order);

      const its: Item[] = Object.entries(data.items || {}).map(
        ([id, v]: any) => ({
          id,
          ...v,
          createdAt: v.createdAt || 0,
        })
      );

      setCategories(cats);
      setItems(its);
      setOrderSystem(data.orderSystem ?? true);
      setLoading(false);
      onLoadingChange?.(false);

      setToast({ message: "تم تحميل نسخة احتياطية", color: "red" });
      setTimeout(() => setToast(null), 4000);
    } catch {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  /* ================= useEffect ================= */
  useEffect(() => {
    onLoadingChange?.(true);

    let timeoutId: number | null = null;
    let firebaseLoaded = false;
    const startTime = Date.now();

    const finishFirebase = (cats: Category[], its: Item[], os: boolean) => {
      firebaseLoaded = true;
      saveToLocal(cats, its, os);

      const minLoadingTime = 5000;
      const elapsed = Date.now() - startTime;

      const hideLoading = () => {
        setLoading(false);
        onLoadingChange?.(false);
        if (timeoutId) clearTimeout(timeoutId);

        setToast({ message: "تم التحميل من قاعدة البيانات", color: "green" });
        setTimeout(() => setToast(null), 3000);
      };

      if (elapsed >= minLoadingTime) {
        hideLoading();
      } else {
        timeoutId = window.setTimeout(hideLoading, minLoadingTime - elapsed);
      }
    };

    const loadOnline = () => {
      let cats: Category[] = [];
      let its: Item[] = [];
      let catsLoaded = false;
      let itemsLoaded = false;
      let orderSystemLoaded = false;

      timeoutId = window.setTimeout(() => {
        if (firebaseLoaded) return;
        const cached = loadFromLocal();
        if (cached) {
          setCategories(cached.categories || []);
          setItems(cached.items || []);
          setOrderSystem(cached.orderSystem ?? true);
          setLoading(false);
          onLoadingChange?.(false);

          setToast({
            message: "الإنترنت ضعيف، تم تحميل آخر نسخة محفوظة",
            color: "red",
          });
          setTimeout(() => setToast(null), 4000);
        } else {
          loadMenuJson();
        }
      }, 8000);

      onValue(ref(db, "categories"), (snap) => {
        const data = snap.val();
        cats = data
          ? Object.entries(data).map(([id, v]: any) => ({
            id,
            name: v.name,
            available: v.available !== false,
            order: v.order ?? 0,
            createdAt: v.createdAt || 0,
          }))
          : [];
        cats.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCategories(cats);
        catsLoaded = true;
        if (itemsLoaded && orderSystemLoaded) finishFirebase(cats, its, orderSystem);
      });

      onValue(ref(db, "items"), (snap) => {
        const data = snap.val();
        its = data
          ? Object.entries(data).map(([id, v]: any) => ({
            id,
            ...v,
            createdAt: v.createdAt || 0,
          }))
          : [];
        setItems(its);
        itemsLoaded = true;
        if (catsLoaded && orderSystemLoaded) finishFirebase(cats, its, orderSystem);
      });

      onValue(ref(db, "settings/orderSystem"), (snap) => {
        const val = snap.val();
        setOrderSystem(val ?? true);
        orderSystemLoaded = true;
        if (catsLoaded && itemsLoaded) finishFirebase(cats, its, val ?? true);
      });
    };

    if (navigator.onLine) loadOnline();
    else loadMenuJson();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [onLoadingChange]);

  /* ================= Check Featured Items ================= */
  useEffect(() => {
    const hasFeatured = items.some((item) => item.star === true);
    onFeaturedCheck?.(hasFeatured);
  }, [items, onFeaturedCheck]);

  /* ================= Available Categories WITH ITEMS ================= */
  const availableCategoriesWithItems = categories.filter(cat =>
    cat.available && items.some(i => i.categoryId === cat.id && i.visible !== false)
  );

  const hasAnyItems = items.some(i => i.visible !== false);
  const hasAnyCategories = availableCategoriesWithItems.length > 0;

  /* ===== تحديد أول Tab تلقائيًا ===== */
  useEffect(() => {
    if (!activeCatId && availableCategoriesWithItems.length && items.length) {
      const firstCat = availableCategoriesWithItems.find(cat =>
        items.some(i => i.categoryId === cat.id && i.visible !== false)
      );
      if (firstCat) setActiveCatId(firstCat.id);
    }
  }, [availableCategoriesWithItems, items, activeCatId]);

  /* ========= Loading UI ========= */
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040309]">
        {/* Overlay blur + gradient */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xl" />

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center px-12 py-14 rounded-[3rem] bg-[#0f0f0f]/90 border border-[#FCD451]/20 shadow-[0_0_100px_rgba(252,212,81,0.25)]"
        >
          {/* Glow behind logo */}

          {/* Logo floating */}
          <motion.div
            className="relative w-48 h-48 mb-10"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-contain rounded-full shadow-2xl"
            />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
            className="text-3xl md:text-4xl font-extrabold tracking-widest text-[#FCD451]/90"
          >
            مطعم الشيف عماد
          </motion.h2>

          <motion.div
            className="w-24 h-[2px] bg-linear-to-r from-[#FCD451]/80 to-[#E5CB60]/80 rounded-full my-5"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          />

          <motion.p
            className="text-[#FCD451]/80 text-lg font-[Cairo] text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
          >
            ذكريات لا تنسى
          </motion.p>

          {/* Dots Loading */}
          <div className="flex gap-2 mt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-[#FCD451] rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }
  if (!hasAnyCategories || !hasAnyItems) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-32 px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#E5CB60] mb-3">
          لا يوجد أصناف حالياً
        </h2>
        <p className="text-[#E5CB60] text-lg">
          جاري العمل على تجهيز المنيو قريباً
        </p>
        <div className="w-24 h-[2px] bg-[#E5CB60]/40 rounded-full mt-6" />
      </div>
    );
  }

  /* ================= Render ================= */
  return (
    <main className="max-w-4xl mx-auto px-0 pb-10 font-[Cairo] font-light text-[#F5F8F7]">
      {toast && (
        <div
          className={`fixed top-6 right-6 px-4 py-3 rounded-2xl font-bold shadow-2xl z-50 text-white
          ${toast.color === "green" ? "bg-[#E5CB60]" : "bg-[#E5CB60]"}`}
        >
          {toast.message}
        </div>
      )}

      {/* ===== Tabs الأقسام ===== */}
      <div className="flex flex-wrap gap-3 justify-center top-2 z-30">
        <button
          onClick={() => setActiveCatId("all")}
          className={`px-4 py-2 rounded-full font-bold transition-all duration-200 font-[Cairo] ${activeCatId === "all"
            ? "bg-[#FCD451] text-black shadow-lg scale-105 text-sm md:text-md"
            : "bg-white/95 backdrop-blur text-black hover:bg-white/80 shadow text-xs md:text-md"
            }`}
        >
          جميع الأصناف
        </button>

        {availableCategoriesWithItems.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCatId(cat.id)}
            className={`px-4 py-2 rounded-full font-bold transition-all duration-200 font-[Cairo] ${activeCatId === cat.id
              ? "bg-[#FCD451] text-black shadow-lg scale-105 text-sm md:text-md"
              : "bg-white/95 backdrop-blur text-black hover:bg-white/80 shadow text-xs md:text-md"
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ===== محتوى القسم / عرض الكل ===== */}
      <div className="min-h-screen">
        {activeCatId === "all"
          ? availableCategoriesWithItems.map((cat) => {
            const catItems = items.filter(i => i.categoryId === cat.id && i.visible !== false);
            return <CategorySection key={cat.id} category={cat} items={catItems} orderSystem={orderSystem} />;
          })
          : availableCategoriesWithItems.map((cat) => {
            if (cat.id !== activeCatId) return null;
            const catItems = items.filter(i => i.categoryId === cat.id && i.visible !== false);
            return <CategorySection key={cat.id} category={cat} items={catItems} orderSystem={orderSystem} />;
          })}
      </div>
    </main>
  );
}