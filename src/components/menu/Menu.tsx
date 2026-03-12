import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { ref, onValue } from "firebase/database";
import CategorySection from "./CategorySection";
import { motion, AnimatePresence } from "framer-motion";

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxury-black">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/10 blur-[150px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center px-8 md:px-12 py-12 md:py-16 rounded-[2.5rem] bg-luxury-black/60 backdrop-blur-3xl border border-white/5 shadow-2xl"
        >
          <motion.div
            className="relative w-32 h-32 md:w-40 md:h-40 mb-8"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full" />
            <img
              src="/logo.png"
              alt="Logo"
              className="relative w-full h-full object-contain rounded-full border-2 border-gold/20"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2"
          >
            الشيف عماد
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg font-light tracking-widest uppercase text-gold/80 mb-8"
          >
            ذكريات لا تنسى
          </motion.p>

          <div className="flex gap-1.5 h-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-8 h-full bg-gold/20 rounded-full relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gold"
                  animate={{ left: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (!hasAnyCategories || !hasAnyItems) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-32 px-6">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          لا يوجد أصناف حالياً
        </h2>
        <p className="text-gold/60 text-lg md:text-xl font-light">
          جاري العمل على تجهيز المنيو قريباً
        </p>
        <div className="w-20 h-1 bg-gold/20 rounded-full mt-8" />
      </div>
    );
  }

  /* ================= Render ================= */
  return (
    <main className="max-w-4xl mx-auto px-4 pb-20 pt-8 md:pt-12 min-h-screen">
      {toast && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl font-bold shadow-2xl z-50 text-luxury-black
            ${toast.color === "green" ? "bg-gold" : "bg-gold/90"}`}
          >
            {toast.message}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ===== Tabs الأقسام ===== */}
      <nav className="sticky top-6 z-40 mb-8 md:mb-12">
        <div className="flex items-center justify-start overflow-x-auto gap-2 p-1.5 bg-luxury-black/60 backdrop-blur-xl border border-white/5 rounded-3xl scrollbar-hide">
          <button
            onClick={() => setActiveCatId("all")}
            className={`
              relative px-5 py-2.5 rounded-2xl md:px-6 md:py-3 text-sm md:text-base font-bold whitespace-nowrap transition-all duration-300
              ${activeCatId === "all" ? "text-luxury-black" : "text-white/60 hover:text-white hover:bg-white/5"}
            `}
          >
            {activeCatId === "all" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gold rounded-2xl -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            جميع الأصناف
          </button>

          {availableCategoriesWithItems.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCatId(cat.id)}
              className={`
                relative px-5 py-2.5 rounded-2xl md:px-6 md:py-3 text-sm md:text-base font-bold whitespace-nowrap transition-all duration-300
                ${activeCatId === cat.id ? "text-luxury-black" : "text-white/60 hover:text-white hover:bg-white/5"}
              `}
            >
              {activeCatId === cat.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gold rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      {/* ===== محتوى القسم / عرض الكل ===== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCatId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="min-h-[50vh]"
        >
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
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
