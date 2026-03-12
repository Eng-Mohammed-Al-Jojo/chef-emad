import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ref, update } from "firebase/database";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSettings, FiSave, FiMapPin, FiPhone, FiMessageCircle, FiFacebook, FiInstagram, FiMessageSquare, FiAlertCircle } from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";

/* ================= Toast ================= */
function Toast({ type, message }: { type: "success" | "error"; message: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, x: "-50%" }}
            className={`fixed bottom-10 left-1/2 z-11000
            px-8 py-4 rounded-2xl shadow-2xl text-white text-sm font-black uppercase tracking-widest flex items-center gap-3 backdrop-blur-xl border
            ${type === "success" ? "bg-green-500/90 border-green-500/20" : "bg-red-500/90 border-red-500/20"}`}
        >
            {type === "success" ? <FiSave /> : <FiAlertCircle />}
            {message}
        </motion.div>
    );
}

/* ================= Reusable ================= */
const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-white/10 focus:border-gold/50 transition-all font-bold text-white";

/* ================= Modal ================= */
export default function OrderSettingsModal({
    setShowOrderSettings,
    orderSettings: initialSettings,
    onSave,
}: {
    setShowOrderSettings: (v: boolean) => void;
    orderSettings: any;
    onSave: (newSettings: any) => void;
}) {
    const [orderSystem, setOrderSystem] = useState(true);
    const [inRestaurant, setInRestaurant] = useState(false);
    const [takeaway, setTakeaway] = useState(false);
    const [inPhone, setInPhone] = useState("");
    const [outPhone, setOutPhone] = useState("");
    const [complaintsWhatsapp, setComplaintsWhatsapp] = useState("");
    const [footer, setFooter] = useState({
        address: "",
        phone: "",
        whatsapp: "",
        facebook: "",
        instagram: "",
        tiktok: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<any>(null);

    /* ===== Initialize state from Admin props ===== */
    useEffect(() => {
        if (!initialSettings) return;

        setOrderSystem(initialSettings.orderSystem ?? true);

        const s = initialSettings.orderSettings ?? {};
        setInRestaurant(!!s.inRestaurant);
        setTakeaway(!!s.takeaway);
        setInPhone(s.inPhone || "");
        setOutPhone(s.outPhone || "");

        setComplaintsWhatsapp(initialSettings.complaintsWhatsapp || "");
        setFooter(initialSettings.footerInfo || {});
        setLoading(false);
    }, [initialSettings]);

    if (loading) return null;

    /* ===== Save with Validation ===== */
    const handleSave = async () => {
        if ((inRestaurant && inPhone.trim() === "") || (takeaway && outPhone.trim() === "")) {
            setToast({ type: "error", message: "❌ الرجاء إدخال رقم واتساب لكل خدمة مفعّلة" });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        const newSettings = {
            orderSystem,
            orderSettings: { inRestaurant, takeaway, inPhone, outPhone },
            complaintsWhatsapp,
            footerInfo: footer,
        };

        try {
            setSaving(true);
            await update(ref(db, "settings"), newSettings);
            onSave?.(newSettings);
            setToast({ type: "success", message: "💾 تم حفظ الإعدادات بنجاح" });
            setTimeout(() => setShowOrderSettings(false), 1500);
        } catch {
            setToast({ type: "error", message: "❌ فشل الحفظ" });
        } finally {
            setSaving(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-luxury-black/95 backdrop-blur-md"
                onClick={() => setShowOrderSettings(false)}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative glass-morphic w-full max-w-xl max-h-[90vh] rounded-3xl border border-white/5 text-white shadow-2xl flex flex-col overflow-hidden z-10000"
            >
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center border border-gold/20">
                            <FiSettings size={20} />
                        </div>
                        <h2 className="text-lg font-black">إعدادات النظام</h2>
                    </div>
                    <button
                        onClick={() => setShowOrderSettings(false)}
                        className="text-white/20 hover:text-white transition-colors"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-none relative z-10">
                    {/* Complaints */}
                    <div className="bg-linear-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/10 rounded-3xl p-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <FiMessageCircle className="text-red-500" size={20} />
                            <p className="font-black text-xs uppercase tracking-[0.2em] text-red-500">منظومة الشكاوى والآراء</p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mr-2">رقم واتساب المشرف</label>
                            <input
                                value={complaintsWhatsapp}
                                onChange={(e) => setComplaintsWhatsapp(e.target.value.replace(/\D/g, ""))}
                                placeholder="0097259xxxxxxx"
                                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-white/5 focus:border-red-500/50 transition-all font-bold text-white shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <FiMapPin className="text-gold" size={20} />
                            <p className="font-black text-[10px] uppercase tracking-[0.2em] text-gold">معلومات الفوتر والتواصل</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mr-2">العنوان</label>
                                <input
                                    placeholder="الموقع الجغرافي للمطعم"
                                    value={footer.address}
                                    onChange={(e) => setFooter({ ...footer, address: e.target.value })}
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mr-2">رقم الهاتف</label>
                                <div className="relative">
                                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        placeholder="05xxxxxxx"
                                        value={footer.phone}
                                        onChange={(e) => setFooter({ ...footer, phone: e.target.value })}
                                        className={inputClass + " pl-10"}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mr-2">واتساب</label>
                                <div className="relative">
                                    <FiMessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        placeholder="رقم التواصل الرئيسي"
                                        value={footer.whatsapp}
                                        onChange={(e) => setFooter({ ...footer, whatsapp: e.target.value })}
                                        className={inputClass + " pl-10"}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mr-2">فيسبوك</label>
                                <div className="relative">
                                    <FiFacebook className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        placeholder="رابط الصفحة"
                                        value={footer.facebook}
                                        onChange={(e) => setFooter({ ...footer, facebook: e.target.value })}
                                        className={inputClass + " pl-10"}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mr-2">انستجرام</label>
                                <div className="relative">
                                    <FiInstagram className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        placeholder="رابط الحساب"
                                        value={footer.instagram}
                                        onChange={(e) => setFooter({ ...footer, instagram: e.target.value })}
                                        className={inputClass + " pl-10"}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mr-2">تيك توك</label>
                                <div className="relative">
                                    <FaTiktok className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        placeholder="رابط الحساب"
                                        value={footer.tiktok}
                                        onChange={(e) => setFooter({ ...footer, tiktok: e.target.value })}
                                        className={inputClass + " pl-10"}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save */}
                <div className="px-6 py-4 border-t border-white/5 relative z-20 bg-luxury-black/50 backdrop-blur-md">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-4 rounded-xl bg-gold text-luxury-black font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-gold/20 hover:bg-gold/90 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {saving ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                                <FiSettings size={20} />
                            </motion.div>
                        ) : <FiSave size={20} />}
                        {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </button>
                </div>
            </motion.div>

            <AnimatePresence>
                {toast && <Toast type={toast.type} message={toast.message} />}
            </AnimatePresence>
        </div>,
        document.body
    );
}
