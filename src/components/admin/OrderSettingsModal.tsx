import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiInfo, FiPhone, FiMapPin, FiMessageSquare, FiFacebook, FiInstagram, FiVideo } from "react-icons/fi";
import { RiWhatsappLine } from "react-icons/ri";
import type { Settings } from "./types";

interface OrderSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: Settings) => void;
  initialSettings: Settings | null;
}

const OrderSettingsModal: React.FC<OrderSettingsModalProps> = ({
  visible,
  onClose,
  onSave,
  initialSettings,
}) => {
  const [settings, setSettings] = useState<Settings>(initialSettings || {
    orderSystem: true,
    orderSettings: { inRestaurant: true, takeaway: true, inPhone: "", outPhone: "" },
    complaintsWhatsapp: "",
    footerInfo: { address: "", phone: "", whatsapp: "", facebook: "", instagram: "", tiktok: "" }
  });

  useEffect(() => {
    if (initialSettings) setSettings(initialSettings);
  }, [initialSettings]);

  if (!visible) return null;

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-luxury-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto"
        dir="rtl"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white/5 border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/2">
            <div>
              <h2 className="text-xl font-black text-white">إعدادات النظام</h2>
              <p className="text-gold/60 text-[10px] font-bold uppercase tracking-widest mt-1">System Configuration</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:bg-red-500 hover:text-white transition-all"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gold/20">
            {/* Order System Toggle */}
            {/* <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${settings.orderSystem ? "bg-gold/20 text-gold" : "bg-white/5 text-white/20"}`}>
                  <FiSettings size={22} className={settings.orderSystem ? "animate-spin-slow" : ""} />
                </div>
                <div>
                  <h3 className="font-black text-white">نظام الطلبات</h3>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Master Switch</p>
                </div>
              </div>
              <button
                onClick={() => setSettings(p => ({ ...p, orderSystem: !p.orderSystem }))}
                className={`relative w-14 h-7 rounded-full transition-all duration-500 ${settings.orderSystem ? "bg-gold" : "bg-white/10"}`}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-all duration-500 ${settings.orderSystem ? "translate-x-7 bg-luxury-black" : "translate-x-0 bg-white/40"}`} />
              </button>
            </div> */}

            {/* In-Restaurant & Takeaway */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-5 rounded-3xl border transition-all ${settings.orderSettings.inRestaurant ? "bg-gold/5 border-gold/20" : "bg-white/5 border-white/5"}`}>
                 <div className="flex justify-between items-center mb-4">
                    <span className="font-black text-sm text-white">طلبات الطاولة</span>
                    <button
                      onClick={() => setSettings(p => ({ ...p, orderSettings: { ...p.orderSettings, inRestaurant: !p.orderSettings.inRestaurant } }))}
                      className={`w-10 h-5 rounded-full transition-all ${settings.orderSettings.inRestaurant ? "bg-gold" : "bg-white/10"}`}
                    >
                      <div className={`w-3 h-3 m-1 rounded-full transition-all ${settings.orderSettings.inRestaurant ? "translate-x-5 bg-luxury-black" : "translate-x-0 bg-white/40"}`} />
                    </button>
                 </div>
                 <div className="relative">
                    <FiSmartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                      type="text" 
                      placeholder="رقم هاتف الطاولات"
                      className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-10 text-xs text-white outline-none focus:border-gold/30 transition-all font-bold"
                      value={settings.orderSettings.inPhone}
                      onChange={e => setSettings(p => ({ ...p, orderSettings: { ...p.orderSettings, inPhone: e.target.value } }))}
                    />
                 </div>
              </div>

              <div className={`p-5 rounded-3xl border transition-all ${settings.orderSettings.takeaway ? "bg-gold/5 border-gold/20" : "bg-white/5 border-white/5"}`}>
                 <div className="flex justify-between items-center mb-4">
                    <span className="font-black text-sm text-white">طلبات التيك أوي</span>
                    <button
                      onClick={() => setSettings(p => ({ ...p, orderSettings: { ...p.orderSettings, takeaway: !p.orderSettings.takeaway } }))}
                      className={`w-10 h-5 rounded-full transition-all ${settings.orderSettings.takeaway ? "bg-gold" : "bg-white/10"}`}
                    >
                      <div className={`w-3 h-3 m-1 rounded-full transition-all ${settings.orderSettings.takeaway ? "translate-x-5 bg-luxury-black" : "translate-x-0 bg-white/40"}`} />
                    </button>
                 </div>
                 <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                      type="text" 
                      placeholder="رقم هاتف التوصيل"
                      className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-10 text-xs text-white outline-none focus:border-gold/30 transition-all font-bold"
                      value={settings.orderSettings.outPhone}
                      onChange={e => setSettings(p => ({ ...p, orderSettings: { ...p.orderSettings, outPhone: e.target.value } }))}
                    />
                 </div>
              </div>
            </div> */}

            {/* Complaints WhatsApp */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center">
                  <FiMessageSquare size={16} />
                </div>
                <h3 className="font-black text-white text-sm">رقم واتساب الشكاوي</h3>
              </div>
              <div className="relative">
                <RiWhatsappLine className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500/50" size={20} />
                <input
                  type="text"
                  placeholder="970xxxxxxxxx"
                  className="w-full bg-black/20 border border-white/5 rounded-xl py-4 px-10 text-sm text-white outline-none focus:border-gold/30 transition-all font-bold"
                  value={settings.complaintsWhatsapp}
                  onChange={e => setSettings(p => ({ ...p, complaintsWhatsapp: e.target.value }))}
                />
              </div>
            </div>

            {/* Footer Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <FiInfo className="text-gold" />
                <h3 className="font-black text-white text-sm">معلومات التذييل (Footer)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="text"
                    placeholder="العنوان"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-10 text-xs text-white outline-none focus:border-gold/50"
                    value={settings.footerInfo.address}
                    onChange={e => setSettings(p => ({ ...p, footerInfo: { ...p.footerInfo, address: e.target.value } }))}
                  />
                </div>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="text"
                    placeholder="رقم الهاتف"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-10 text-xs text-white outline-none focus:border-gold/50"
                    value={settings.footerInfo.phone}
                    onChange={e => setSettings(p => ({ ...p, footerInfo: { ...p.footerInfo, phone: e.target.value } }))}
                  />
                </div>
                <div className="relative">
                  <RiWhatsappLine className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="text"
                    placeholder="رابط الواتساب"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-10 text-xs text-white outline-none focus:border-gold/50"
                    value={settings.footerInfo.whatsapp}
                    onChange={e => setSettings(p => ({ ...p, footerInfo: { ...p.footerInfo, whatsapp: e.target.value } }))}
                  />
                </div>
                <div className="relative">
                  <FiFacebook className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="text"
                    placeholder="رابط فيسبوك"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-10 text-xs text-white outline-none focus:border-gold/50"
                    value={settings.footerInfo.facebook}
                    onChange={e => setSettings(p => ({ ...p, footerInfo: { ...p.footerInfo, facebook: e.target.value } }))}
                  />
                </div>
                <div className="relative">
                  <FiInstagram className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="text"
                    placeholder="رابط انستغرام"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-10 text-xs text-white outline-none focus:border-gold/50"
                    value={settings.footerInfo.instagram}
                    onChange={e => setSettings(p => ({ ...p, footerInfo: { ...p.footerInfo, instagram: e.target.value } }))}
                  />
                </div>
                <div className="relative">
                  <FiVideo className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="text"
                    placeholder="رابط تيك توك"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-10 text-xs text-white outline-none focus:border-gold/50"
                    value={settings.footerInfo.tiktok}
                    onChange={e => setSettings(p => ({ ...p, footerInfo: { ...p.footerInfo, tiktok: e.target.value } }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 bg-white/2 flex gap-3 border-t border-white/10">
            <button
              onClick={handleSave}
              className="flex-1 bg-gold text-luxury-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold/90 transition shadow-lg shadow-gold/20 flex items-center justify-center gap-2"
            >
              <FiCheck size={18} />
              <span>حفظ التعديلات</span>
            </button>
            <button
              onClick={onClose}
              className="px-8 bg-white/5 text-white/60 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition border border-white/10"
            >
              إلغاء
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderSettingsModal;
