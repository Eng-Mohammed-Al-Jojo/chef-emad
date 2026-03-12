import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { ref, onValue, push, remove, update, get, set } from "firebase/database";
import { FiDownload, FiSettings, FiUpload } from "react-icons/fi";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { FiLogOut } from "react-icons/fi";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import CategorySection from "../components/admin/CategorySection";
import ItemSection from "../components/admin/ItemSection";
import Popup from "../components/admin/Popup";
import { type PopupState } from "../components/admin/types";
import OrderSettingsModal from "../components/admin/OrderSettingsModal";
import PdfExport from "../components/admin/PdfExport";
import { FaDatabase } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Admin() {
  const [authOk, setAuthOk] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [categories, setCategories] = useState<any>({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [items, setItems] = useState<any>({});
  const [popup, setPopup] = useState<PopupState>({ type: null });
  const [resetPasswordPopup, setResetPasswordPopup] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [editItemValues, setEditItemValues] = useState<{
    itemName: string;
    itemPrice: string;
    priceTw: string;
    selectedCategory: string;
    itemIngredients?: string;
  }>({
    itemName: "",
    itemPrice: "",
    priceTw: "",
    selectedCategory: "",
    itemIngredients: "",
  });
  const [editItemId, setEditItemId] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOrderSettings, setShowOrderSettings] = useState(false);
  const [orderSettings, setOrderSettings] = useState<any>(null);
  const [settings, setSettings] = useState({
    orderSystem: false,
    orderSettings: { inRestaurant: false, takeaway: false, inPhone: "", outPhone: "" },
    complaintsWhatsapp: "",
    footerInfo: { address: "", phone: "", whatsapp: "", facebook: "", instagram: "", tiktok: "" },
  });


  // ================= AUTH LISTENER =================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthOk(!!user);
    });
    return () => unsub();
  }, []);

  // ================= AUTO LOGOUT ON LEAVE /admin =================
  // useEffect(() => {
  //   const handleBeforeUnload = () => {
  //     signOut(auth);
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);
  //   return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  // }, []);


  // ================= FIREBASE DATA =================
  useEffect(() => {
    if (!authOk) return;
    setLoading(true); // 🔥 شغّل اللودر

    const catRef = ref(db, "categories");
    const itemRef = ref(db, "items");
    onValue(catRef, (snap) => setCategories(snap.val() || {}));
    onValue(itemRef, (snap) => setItems(snap.val() || {}));
    setLoading(false); // 🔥 اطفّل اللودر
  }, [authOk]);

  // ================= ORDER SETTINGS INITIALIZE =================
  useEffect(() => {
    if (!authOk) return;

    const settingsRef = ref(db, "settings"); // ⚡ جلب كل الإعدادات
    const initSettings = async () => {
      const snap = await get(settingsRef);
      if (!snap.exists()) {
        // إذا مش موجود، نضيف إعدادات افتراضية كاملة
        const defaultSettings = {
          complaintsWhatsapp: "",
          footerInfo: {
            address: "",
            facebook: "",
            instagram: "",
            phone: "",
            tiktok: "",
            whatsapp: ""
          },
          orderSettings: {
            inRestaurant: false,
            inPhone: "",
            takeaway: false,
            outPhone: "",
          },
          orderSystem: true
        };
        await set(settingsRef, defaultSettings);
        setSettings(defaultSettings);
        setOrderSettings(defaultSettings); // ⚡ للModal
      } else {
        const data = snap.val();
        setSettings(data);
        setOrderSettings(data); // ⚡ للModal
      }
    };
    initSettings();
  }, [authOk]);

  // ================= LOGIN =================
  const login = async () => {
    if (!email || !password) {
      setToast("أدخل البريد وكلمة المرور");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setToast("تم تسجيل الدخول بنجاح ✅");
      setTimeout(() => setToast(""), 3000);
    } catch {
      setToast("بيانات الدخول غير صحيحة");
      setTimeout(() => setToast(""), 3000);
    }
  };

  // ================= RESET PASSWORD =================
  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      setResetMessage("أدخل البريد الإلكتروني أولاً");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك!");
    } catch (err: any) {
      setToast(err.message);
      setTimeout(() => setToast(""), 3000);
    }
  };

  // ================= LOGOUT =================
  const logout = async () => {
    await signOut(auth);
    setPopup({ type: null });
    setToast("تم تسجيل الخروج بنجاح ✅");
    setTimeout(() => setToast(""), 3000);
  };

  // ================= CATEGORY =================
  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      setToast("⚠️  يجب إدخال اسم القسم أولاً");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    const newName = newCategoryName.trim();
    const exists = Object.values(categories).some(
      (cat: any) => cat.name.trim().toLowerCase() === newName.toLowerCase()
    );
    if (exists) {
      setToast(`القسم "${newName}" موجود مسبقاً`);
      setTimeout(() => setToast(""), 3000);
      return;
    }
    await push(ref(db, "categories"), {
      name: newName,
      createdAt: Date.now(),
    });
    setNewCategoryName("");
    setPopup({ type: null });
    setToast(`تم إضافة القسم "${newName}" بنجاح ✅`);
    setTimeout(() => setToast(""), 4000);
  };

  const deleteCategory = async (id: string) => {
    await remove(ref(db, `categories/${id}`));
    Object.keys(items).forEach((itemId) => {
      if (items[itemId].categoryId === id) remove(ref(db, `items/${itemId}`));
    });
    setPopup({ type: null });
    setToast("  تم حذف القسم بنجاح ✅");
    setTimeout(() => setToast(""), 4000);
  };

  // ================= ITEMS =================
  const deleteItem = async () => {
    if (!popup.id) return;
    await remove(ref(db, `items/${popup.id}`));
    setPopup({ type: null });
    setToast("  تم حذف الصنف بنجاح ✅");
    setTimeout(() => setToast(""), 4000);
  };

  const updateItem = async () => {
    if (!editItemId) return;
    await update(ref(db, `items/${editItemId}`), {
      name: editItemValues.itemName,
      price: editItemValues.itemPrice,
      priceTw: editItemValues.priceTw || "",
      categoryId: editItemValues.selectedCategory,
      ingredients: editItemValues.itemIngredients || "",
    });
    setPopup({ type: null });
    setEditItemId("");
    setEditItemValues({
      itemName: "",
      itemPrice: "",
      priceTw: "",
      selectedCategory: "",
      itemIngredients: "",
    });
    setToast("  تم التعديل بنجاح ✅");
    setTimeout(() => setToast(""), 4000);
  };
  // ================= EXPORT EXCEL =================
  const exportToExcel = async () => {
    if (!categories || !items) {
      alert("البيانات لم يتم تحميلها بعد!");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Items");

    sheet.columns = [
      { header: "الاسم", key: "name", width: 30 },
      { header: "السعر", key: "price", width: 15 },
      { header: "سعر TW", key: "priceTw", width: 15 },
      { header: "القسم", key: "categoryName", width: 30 },
      { header: "المكونات", key: "ingredients", width: 40 },
      { header: "متوفر", key: "visible", width: 10 },
      { header: "مميزة", key: "star", width: 10 },
      { header: "صورة", key: "image", width: 25 },
    ];

    Object.values(items).forEach((item: any) => {
      const categoryName = categories[item.categoryId]?.name ?? "غير محدد";
      sheet.addRow({
        name: item.name,
        price: item.price,
        priceTw: item.priceTw || "",
        categoryName,
        ingredients: item.ingredients || "",
        visible: item.visible ? "نعم" : "لا",
        star: item.star ? "⭐" : "",
        image: item.image || "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "menu.xlsx");

    setToast("تم تصدير البيانات بنجاح ✅");
    setTimeout(() => setToast(""), 3000);
  };

  // ================= IMPORT EXCEL =================
  const importFromExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const buffer = await file.arrayBuffer();
      await workbook.xlsx.load(buffer);

      const sheet = workbook.getWorksheet(1);
      if (!sheet) {
        setToast("ملف غير صالح ❌");
        setLoading(false);
        return;
      }

      const categoryMap: Record<string, string> = {};
      Object.entries(categories).forEach(([id, cat]: any) => {
        categoryMap[cat.name.trim().toLowerCase()] = id;
      });

      const rows: any[] = [];
      sheet.eachRow((row, index) => {
        if (index === 1) return; // تجاهل رأس الجدول
        rows.push({
          name: row.getCell(1).value?.toString().trim() || "",
          price: row.getCell(2).value?.toString().trim() || "",
          priceTw: row.getCell(3).value?.toString().trim() || "",
          categoryName: row.getCell(4).value?.toString().trim() || "",
          ingredients: row.getCell(5).value?.toString().trim() || "",
          visible: row.getCell(6).value?.toString().trim().toLowerCase() === "نعم",
          star: row.getCell(7).value?.toString().trim() === "⭐",
          image: row.getCell(8).value?.toString().trim() || "",
        });
      });

      let addedCount = 0;
      for (const item of rows) {
        if (!item.name || !item.categoryName) continue;
        const categoryId = categoryMap[item.categoryName.toLowerCase()];
        if (!categoryId) continue;

        const exists = Object.values(items).some(
          (i: any) =>
            i.name.trim().toLowerCase() === item.name.toLowerCase() &&
            i.categoryId === categoryId
        );
        if (exists) continue;

        await push(ref(db, "items"), {
          name: item.name,
          price: item.price,
          priceTw: item.priceTw || "",
          categoryId,
          ingredients: item.ingredients || "",
          visible: item.visible ?? true,
          star: item.star ?? false,
          featured: item.featured || "",
          createdAt: Date.now(),
        });
        addedCount++;
      }

      if (addedCount > 0) setToast(`تم إضافة ${addedCount} صنف جديد ✅`);
      else setToast("القائمة محدثة بالفعل ✅");
    } catch (err) {
      console.error(err);
      setToast("حدث خطأ أثناء الاستيراد ❌");
    } finally {
      setLoading(false);
      e.target.value = "";
      setTimeout(() => setToast(""), 4000);
    }
  };


  // ================= EXPORT JSON =================
  const exportToJSON = () => {
    // بناء بيانات JSON بشكل مرتب
    const data = {
      categories,
      items,
      settings: {
        orderSystem: settings.orderSystem,
        orderSettings: {
          inRestaurant: settings.orderSettings.inRestaurant,
          takeaway: settings.orderSettings.takeaway,
          inPhone: settings.orderSettings.inPhone,
          outPhone: settings.orderSettings.outPhone,
        },
        complaintsWhatsapp: settings.complaintsWhatsapp,
        footerInfo: {
          address: settings.footerInfo.address || "",
          phone: settings.footerInfo.phone || "",
          whatsapp: settings.footerInfo.whatsapp || "",
          facebook: settings.footerInfo.facebook || "",
          instagram: settings.footerInfo.instagram || "",
          tiktok: settings.footerInfo.tiktok || "",
        },
      },
      meta: { version: "1.0", exportedAt: Date.now() },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "menu.json";
    a.click();
    URL.revokeObjectURL(url);

    setToast("📦 تم تصدير جميع البيانات والإعدادات بنجاح");
    setTimeout(() => setToast(""), 4000);
  };





  // ================= SAVE ORDER SETTINGS =================
  const handleSaveOrderSettings = async (newSettings: any) => {
    try {
      setLoading(true);

      // تحديث Firebase
      await update(ref(db, "settings"), newSettings);

      // تحديث الـ state محلياً
      setSettings(newSettings);
      setOrderSettings(newSettings);

      setToast("تم حفظ إعدادات الطلب بنجاح ✅");
      setShowOrderSettings(false);
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      console.error(err);
      setToast("حدث خطأ أثناء الحفظ ❌");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(false);
    }
  };



  // ================= LOGIN UI =================
  if (!authOk) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-black font-[Cairo] relative overflow-hidden" dir="rtl">
        {/* Background Accents */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full" />
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-100 bg-gold text-luxury-black px-6 py-3 rounded-xl shadow-premium font-black text-xs uppercase tracking-widest"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* POPUP إعادة تعيين كلمة المرور */}
        {resetPasswordPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-luxury-black/90 backdrop-blur-xl flex justify-center items-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-morphic rounded-3xl p-6 w-full max-w-md border border-white/10 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-gold/10 via-transparent to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex justify-center mb-8">
                  <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain animate-premium-float" />
                </div>
                <h2 className="text-xl font-black mb-4 text-white text-center">
                  إعادة تعيين كلمة المرور
                </h2>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-gold/50 transition-colors"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                  {resetMessage && (
                    <p className="text-sm text-center text-green-400 font-bold">{resetMessage}</p>
                  )}
                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      onClick={handleResetPassword}
                      className="w-full bg-gold text-luxury-black font-black py-3 rounded-xl hover:bg-gold/90 transition shadow-lg shadow-gold/20 text-sm"
                    >
                      إرسال الرابط
                    </button>
                    <button
                      onClick={() => {
                        setResetPasswordPopup(false);
                        setResetMessage("");
                      }}
                      className="w-full bg-white/5 text-white font-bold py-3 rounded-xl border border-white/10 hover:bg-white/10 transition text-sm"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* LOGIN FORM */}
        {!resetPasswordPopup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphic p-8 md:p-10 rounded-3xl w-full max-w-sm border border-white/10 relative overflow-hidden mx-4"
          >
            <div className="absolute inset-0 bg-linear-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full animate-pulse" />
                <img src="/logo.png" alt="Logo" className="relative w-20 h-20 object-contain" />
              </div>
              
              <div className="text-center mb-10">
                <h1 className="text-2xl font-black text-white mb-2">دخول الأدمن</h1>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.3em]">Chef Emad Administration</p>
              </div>

              <div className="w-full space-y-4">
                <div className="group">
                  <input
                    type="email"
                     className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white outline-none focus:border-gold/50 transition-all group-hover:border-white/20"
                    placeholder="البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="group">
                  <input
                    type="password"
                     className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white outline-none focus:border-gold/50 transition-all group-hover:border-white/20"
                    placeholder="كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <button
                  onClick={login}
                  className="w-full py-4 rounded-xl font-black bg-gold text-luxury-black hover:bg-gold/90 transition-all shadow-xl shadow-gold/20 mt-4 text-xs uppercase tracking-widest active:scale-[0.98]"
                >
                  تسجيل الدخول
                </button>
                
                <button
                  onClick={() => setResetPasswordPopup(true)}
                  className="w-full mt-4 text-xs text-white/40 hover:text-gold transition-colors font-bold uppercase tracking-widest"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  }


  // ================= ADMIN PANEL =================
  return (
    <div className="min-h-screen w-full bg-luxury-black font-[Cairo] relative overflow-x-hidden" dir="rtl">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-gold/5 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-100 bg-gold text-luxury-black px-8 py-4 rounded-2xl shadow-premium font-black text-sm uppercase tracking-widest"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="fixed inset-0 bg-luxury-black/60 backdrop-blur-md flex justify-center items-center z-90">
          <div className="flex flex-col items-center gap-6">
            <img src="/logo.png" className="w-24 h-24 object-contain animate-premium-float" alt="Loading" />
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-gold rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-gold rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-gold rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* Inputs مخفية للملفات */}
      <input type="file" accept=".xlsx" id="excelUpload" hidden onChange={importFromExcel} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8 bg-white/5 border border-white/5 p-5 rounded-3xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 p-1 rounded-full bg-linear-to-br from-gold/30 to-transparent">
              <div className="w-full h-full rounded-full bg-luxury-black flex items-center justify-center border border-white/10">
                <img src="/logo.png" className="w-10 h-10 object-contain" alt="Admin" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-white tracking-tight">لوحة التحكم</h1>
              <p className="text-gold/50 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Chef Emad Admin Portal</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex bg-white/5 p-1.5 rounded-xl border border-white/5 gap-1.5">
              <button
                onClick={() => setShowOrderSettings(true)}
                title="إعدادات النظام"
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 text-gold hover:bg-gold hover:text-luxury-black transition-all duration-300"
              >
                <FiSettings size={20} />
              </button>
              
              <div className="w-px bg-white/10 mx-1 self-stretch" />

              <button
                onClick={exportToExcel}
                title="تصدير Excel"
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-300"
              >
                <FiUpload size={20} />
              </button>
              <button
                onClick={() => document.getElementById("excelUpload")?.click()}
                title="استيراد Excel"
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-300"
              >
                <FiDownload size={20} />
              </button>

              <div className="w-px bg-white/10 mx-1 self-stretch" />

              <PdfExport 
                categories={categories} 
                items={items} 
                restaurantName="طاهي عماد - Chef Emad" 
              />

              <div className="w-px bg-white/10 mx-1 self-stretch" />

              <button
                onClick={exportToJSON}
                title="نسخة احتياطية (JSON)"
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                <FaDatabase size={18} />
              </button>
            </div>

            <button
              onClick={() => setPopup({ type: "logout" })}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all duration-300 font-bold text-sm"
            >
              <FiLogOut />
              <span>خروج</span>
            </button>
          </div>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <CategorySection
              categories={categories}
              setPopup={setPopup}
              newCategoryName={newCategoryName}
              setNewCategoryName={setNewCategoryName}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <ItemSection
              categories={categories}
              items={items}
              popup={popup}
              setPopup={(p) => {
                setPopup(p);
                if (p.type === "editItem" && p.id) {
                  const item = items[p.id];
                  if (item) {
                    setEditItemId(p.id);
                    setEditItemValues({
                      itemName: item.name,
                      itemPrice: item.price,
                      priceTw: item.priceTw || "",
                      selectedCategory: item.categoryId,
                      itemIngredients: item.ingredients || "",
                    });
                  }
                }
              }}
            />
          </motion.div>
        </div>

        <Popup
          popup={popup}
          setPopup={setPopup}
          addCategory={addCategory}
          deleteCategory={deleteCategory}
          deleteItem={deleteItem}
          updateItem={updateItem}
          editItemValues={editItemValues}
          setEditItemValues={setEditItemValues}
          categories={categories}
          resetPasswordPopup={resetPasswordPopup}
          setResetPasswordPopup={setResetPasswordPopup}
          resetEmail={resetEmail}
          setResetEmail={setResetEmail}
          resetMessage={resetMessage}
          handleResetPassword={handleResetPassword}
          logout={logout}
        />
      </div>

      {/* Order Settings Modal */}
      <AnimatePresence>
        {showOrderSettings && orderSettings && (
          <OrderSettingsModal
            setShowOrderSettings={setShowOrderSettings}
            orderSettings={orderSettings}
            onSave={handleSaveOrderSettings}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
