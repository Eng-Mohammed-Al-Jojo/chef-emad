import React, { useState } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

// Components
import AuthGate from "../components/admin/AuthGate";
import AdminHeader from "../components/admin/AdminHeader";
import CategorySection from "../components/admin/CategorySection";
import ItemSection from "../components/admin/ItemSection";
import OrderSettingsModal from "../components/admin/OrderSettingsModal";
import Popup from "../components/admin/Popup";
import { useToast } from "../components/admin/ToastProvider";

// Hook & Utils
import { useAdminData } from "../hooks/useAdminData";
import { exportToExcel, importFromExcel, exportToJSON } from "../utils/adminUtils";
import type { PopupState } from "../components/admin/types";

const Admin: React.FC = () => {
  const {
    user,
    categories,
    items,
    settings,
    loading,
    addCategory,
    deleteCategory,
    deleteItem,
    updateItem,
    saveSettings,
  } = useAdminData();

  const { showToast } = useToast();

  // Local UI State
  const [popup, setPopup] = useState<PopupState>({ type: null });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showOrderSettings, setShowOrderSettings] = useState(false);

  // Handlers
  const handleLogout = () => setPopup({ type: "logout" });

  const confirmLogout = async () => {
    await signOut(auth);
    setPopup({ type: null });
    showToast("تم تسجيل الخروج بنجاح", "success");
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      showToast("يرجى إدخال اسم القسم", "warning");
      return;
    }
    const success = await addCategory(newCategoryName);
    if (success) {
      setNewCategoryName("");
      setPopup({ type: null });
    }
  };

  const handleUpdateItem = async () => {
    if (popup.type === "editItem" && popup.id && popup.editItemValues) {
      const success = await updateItem(popup.id, {
        name: popup.editItemValues.itemName,
        price: popup.editItemValues.itemPrice,
        categoryId: popup.editItemValues.selectedCategory,
        ingredients: popup.editItemValues.itemIngredients,
      });
      if (success) {
        setPopup({ type: null });
      }
    }
  };

  if (loading && user) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
          <p className="text-gold font-bold text-sm">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthGate onAuthSuccess={() => { }} />;
  }

  return (
    <div className="min-h-screen bg-luxury-black font-[Cairo] text-white pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        <AdminHeader
          categories={categories}
          items={items}
          onShowSettings={() => setShowOrderSettings(true)}
          onExportExcel={() => exportToExcel(categories, items)}
          onImportExcel={(e) => {
            const file = e.target.files?.[0];
            if (file) importFromExcel(file, categories, showToast);
          }}
          onExportJSON={() => exportToJSON(categories, items, settings)}
          onLogout={handleLogout}
        />

        <div className="grid grid-cols-1 gap-8">
          <CategorySection
            categories={categories}
            setPopup={setPopup}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
          />

          <ItemSection
            categories={categories}
            items={items}
            setPopup={setPopup}
          />
        </div>
      </div>

      {/* Modals & Popups */}
      <OrderSettingsModal
        visible={showOrderSettings}
        onClose={() => setShowOrderSettings(false)}
        onSave={saveSettings}
        initialSettings={settings}
      />

      <Popup
        popup={popup}
        setPopup={setPopup}
        deleteItem={() => popup.id && deleteItem(popup.id)}
        deleteCategory={deleteCategory}
        addCategory={handleAddCategory}
        updateItem={handleUpdateItem}
        editItemValues={popup.editItemValues}
        setEditItemValues={(values) =>
          setPopup({
            ...popup,
            editItemValues: {
              itemName: values.itemName,
              itemPrice: values.itemPrice,
              selectedCategory: values.selectedCategory,
              itemIngredients: values.itemIngredients ?? "",
            },
          })
        }
        categories={categories}
        logout={confirmLogout}
      />
    </div>
  );
};

export default Admin;
