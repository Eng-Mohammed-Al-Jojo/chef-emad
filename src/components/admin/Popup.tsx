import React from "react";
import { createPortal } from "react-dom";
import { type PopupState } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiEdit, FiLogOut, FiSave, FiRefreshCw } from "react-icons/fi";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

interface Props {
  popup: PopupState;
  setPopup: (popup: PopupState) => void;
  deleteItem?: () => void;
  deleteCategory?: (id: string) => void;
  addCategory?: () => void;
  updateItem?: () => void;
  editItemValues?: {
    itemName: string;
    itemPrice: string;
    priceTw: string;
    selectedCategory: string;
    itemIngredients?: string;
  };
  setEditItemValues?: (values: {
    itemName: string;
    itemPrice: string;
    priceTw: string;
    selectedCategory: string;
    itemIngredients?: string;
  }) => void;
  categories?: any;
  resetPasswordPopup?: boolean;
  setResetPasswordPopup?: (val: boolean) => void;
  resetEmail?: string;
  setResetEmail?: (val: string) => void;
  resetMessage?: string;
  handleResetPassword?: () => void;
  logout?: () => void;
}

const Popup: React.FC<Props> = ({
  popup,
  setPopup,
  deleteItem,
  deleteCategory,
  addCategory,
  updateItem,
  editItemValues,
  setEditItemValues,
  categories,
  resetPasswordPopup,
  setResetPasswordPopup,
  resetEmail,
  setResetEmail,
  resetMessage,
  handleResetPassword,
  logout,
}) => {
  if (!popup.type && !resetPasswordPopup) return null;

  return createPortal(
    <AnimatePresence>
      {(popup.type || resetPasswordPopup) && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 bg-luxury-black/95 backdrop-blur-md"
            onClick={() => {
              setPopup({ type: null });
              setResetPasswordPopup && setResetPasswordPopup(false);
            }}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-10000 flex items-center justify-center p-4" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass-morphic p-6 md:p-8 rounded-3xl border border-white/5 w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

              <button
                onClick={() => {
                  setPopup({ type: null });
                  setResetPasswordPopup && setResetPasswordPopup(false);
                }}
                className="absolute top-4 left-4 text-white/50 hover:text-white transition-colors z-20"
                title="إغلاق"
              >
                <FiX size={24} />
              </button>

              <div className="relative z-10">
                {/* Logout */}
                {popup.type === "logout" && (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                      <FiLogOut size={28} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">تسجيل الخروج</h3>
                    <p className="text-white/40 mb-6 font-medium italic text-sm">هل أنت متأكد من رغبتك في الخروج؟</p>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          logout && logout();
                          setPopup({ type: null });
                        }}
                        className="w-full py-4 rounded-2xl font-black bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 text-sm uppercase tracking-widest active:scale-95"
                      >
                        نعم، خروج
                      </button>
                      <button
                        onClick={() => setPopup({ type: null })}
                        className="w-full py-4 rounded-2xl font-black border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm uppercase tracking-widest active:scale-95"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}

                {/* Add Category Confirmation */}
                {popup.type === "addCategory" && (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                      <FiSave size={28} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">تأكيد الإضافة</h3>
                    <p className="text-white/40 mb-6 font-medium italic text-sm">هل تريد حفظ هذا القسم الجديد في المنيو؟</p>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={addCategory}
                        className="w-full py-4 rounded-2xl font-black bg-green-500 text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 text-sm uppercase tracking-widest active:scale-95"
                      >
                        حفظ القسم
                      </button>
                      <button
                        onClick={() => setPopup({ type: null })}
                        className="w-full py-4 rounded-2xl font-black border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm uppercase tracking-widest active:scale-95"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}

                {/* Delete Category / Item Confirmation */}
                {(popup.type === "deleteCategory" || popup.type === "deleteItem") && (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                      <HiOutlineExclamationTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">تأكيد الحذف</h3>
                    <p className="text-white/40 mb-6 font-medium italic text-sm">
                      {popup.type === "deleteCategory" ? "سيتم حذف القسم وجميع المنتجات المرتبطة به نهائياً." : "هل أنت متأكد من رغبتك في حذف هذا المنتج من المنيو؟"}
                    </p>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          if (popup.type === "deleteCategory") deleteCategory && deleteCategory(popup.id!);
                          else deleteItem && deleteItem();
                          setPopup({ type: null });
                        }}
                        className="w-full py-4 rounded-2xl font-black bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 text-sm uppercase tracking-widest active:scale-95"
                      >
                        حذف نهائي
                      </button>
                      <button
                        onClick={() => setPopup({ type: null })}
                        className="w-full py-4 rounded-2xl font-black border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm uppercase tracking-widest active:scale-95"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}

                {/* Edit Item */}
                {popup.type === "editItem" && editItemValues && setEditItemValues && categories && (
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center border border-gold/20">
                        <FiEdit size={24} />
                      </div>
                      <h3 className="text-2xl font-black text-white">تعديل المنتج</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mr-2">الفئة</label>
                        <select
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-gold/50 transition-all font-bold appearance-none cursor-pointer"
                          value={editItemValues.selectedCategory}
                          onChange={(e) =>
                            setEditItemValues({
                              ...editItemValues,
                              selectedCategory: e.target.value,
                            })
                          }
                        >
                          {Object.keys(categories).map((id) => (
                            <option key={id} value={id} className="bg-luxury-black text-white">
                              {categories[id].name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mr-2">اسم المنتج</label>
                        <input
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-gold/50 transition-all font-bold placeholder:text-white/10"
                          placeholder="اسم المنتج"
                          value={editItemValues.itemName}
                          onChange={(e) =>
                            setEditItemValues({
                              ...editItemValues,
                              itemName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mr-2">الوصف</label>
                        <input
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-gold/50 transition-all font-bold placeholder:text-white/10"
                          placeholder="المكونات أو الوصف..."
                          value={editItemValues.itemIngredients}
                          onChange={(e) =>
                            setEditItemValues({
                              ...editItemValues,
                              itemIngredients: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mr-2">الأسعار</label>
                        <input
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-gold/50 transition-all font-bold placeholder:text-white/10"
                          placeholder="الأسعار (مثال: 20, 35)"
                          value={editItemValues.itemPrice}
                          onChange={(e) =>
                            setEditItemValues({
                              ...editItemValues,
                              itemPrice: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-3 pt-4">
                        <button
                          onClick={updateItem}
                          className="w-full py-4 rounded-2xl font-black bg-gold text-luxury-black hover:bg-gold/90 transition-all shadow-lg shadow-gold/20 text-sm uppercase tracking-widest active:scale-95"
                        >
                          حفظ التغييرات
                        </button>
                        <button
                          onClick={() => setPopup({ type: null })}
                          className="w-full py-4 rounded-2xl font-black border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm uppercase tracking-widest active:scale-95"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reset Password */}
                {resetPasswordPopup && (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                      <FiRefreshCw size={28} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">استعادة كلمة المرور</h3>
                    <p className="text-white/40 mb-6 font-medium italic text-sm">أدخل بريدك الإلكتروني ليتم إرسال رابط الاستعادة</p>
                    <input
                      type="email"
                      placeholder="أدخل بريدك الإلكتروني"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-gold/50 transition-all font-bold placeholder:text-white/10 mb-4"
                      value={resetEmail}
                      onChange={(e) => setResetEmail && setResetEmail(e.target.value)}
                    />
                    {resetMessage && (
                      <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-bold mb-6">
                        {resetMessage}
                      </div>
                    )}
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={handleResetPassword}
                        className="w-full py-4 rounded-2xl font-black bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 text-sm uppercase tracking-widest active:scale-95"
                      >
                        إرسال الرابط
                      </button>
                      <button
                        onClick={() => setResetPasswordPopup && setResetPasswordPopup(false)}
                        className="w-full py-4 rounded-2xl font-black border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm uppercase tracking-widest active:scale-95"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Popup;
