import { useState, useEffect, useCallback } from "react";
import { db, auth } from "../firebase";
import { 
  ref, 
  onValue, 
  push, 
  remove, 
  update, 
  set
} from "firebase/database";
import { onAuthStateChanged, type User } from "firebase/auth";
import type { Category, Item, Settings } from "../components/admin/types";
import { useToast } from "../components/admin/ToastProvider";

export const useAdminData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [items, setItems] = useState<Record<string, Item>>({});
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) setLoading(false);
    });
    return () => unsub();
  }, []);

  // Data Listeners
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const catRef = ref(db, "categories");
    const itemRef = ref(db, "items");
    const settingsRef = ref(db, "settings");

    let catLoaded = false;
    let itemsLoaded = false;

    const checkLoading = () => {
      if (catLoaded && itemsLoaded) {
        setLoading(false);
      }
    };

    const unsubCat = onValue(catRef, (snap) => {
      setCategories(snap.val() || {});
      catLoaded = true;
      checkLoading();
    });

    const unsubItem = onValue(itemRef, (snap) => {
      setItems(snap.val() || {});
      itemsLoaded = true;
      checkLoading();
    });

    const unsubSettings = onValue(settingsRef, (snap) => {
      setSettings(snap.val());
    });

    return () => {
      unsubCat();
      unsubItem();
      unsubSettings();
    };
  }, [user]);

  // Actions
  const addCategory = useCallback(async (name: string) => {
    try {
      const newName = name.trim();
      const exists = Object.values(categories).some(
        (cat) => cat.name.trim().toLowerCase() === newName.toLowerCase()
      );
      if (exists) {
        showToast(`القسم "${newName}" موجود مسبقاً`, "warning");
        return false;
      }
      await push(ref(db, "categories"), {
        name: newName,
        createdAt: Date.now(),
        order: Object.keys(categories).length,
      });
      showToast(`تم إضافة القسم "${newName}" بنجاح ✅`, "success");
      return true;
    } catch (err) {
      showToast("حدث خطأ أثناء إضافة القسم", "error");
      return false;
    }
  }, [categories, showToast]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await remove(ref(db, `categories/${id}`));
      // Also delete items in this category
      const itemIds = Object.keys(items).filter(itemId => items[itemId].categoryId === id);
      const itemUpdates: Record<string, null> = {};
      itemIds.forEach(itemId => {
        itemUpdates[`items/${itemId}`] = null;
      });
      if (itemIds.length > 0) {
        await update(ref(db), itemUpdates);
      }
      showToast("تم حذف القسم بنجاح ✅", "success");
      return true;
    } catch (err) {
      showToast("حدث خطأ أثناء حذف القسم", "error");
      return false;
    }
  }, [items, showToast]);

  const updateItem = useCallback(async (id: string, data: Partial<Item>) => {
    try {
      await update(ref(db, `items/${id}`), data);
      showToast("تم التعديل بنجاح ✅", "success");
      return true;
    } catch (err) {
      showToast("حدث خطأ أثناء التعديل", "error");
      return false;
    }
  }, [showToast]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      await remove(ref(db, `items/${id}`));
      showToast("تم حذف الصنف بنجاح ✅", "success");
      return true;
    } catch (err) {
      showToast("حدث خطأ أثناء الحذف", "error");
      return false;
    }
  }, [showToast]);

  const saveSettings = useCallback(async (newSettings: Settings) => {
    try {
      setLoading(true);
      await set(ref(db, "settings"), newSettings);
      showToast("تم حفظ الإعدادات بنجاح ✅", "success");
      return true;
    } catch (err) {
      showToast("حدث خطأ أثناء حفظ الإعدادات", "error");
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return {
    user,
    categories,
    items,
    settings,
    loading,
    addCategory,
    deleteCategory,
    updateItem,
    deleteItem,
    saveSettings,
  };
};
