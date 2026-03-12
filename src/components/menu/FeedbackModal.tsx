import { useState, useEffect } from "react";
import { FaTimes, FaStar } from "react-icons/fa";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    show: boolean;
    onClose: () => void;
}

const LOCAL_STORAGE_KEY = "feedbackSettings";

export default function FeedbackModal({ show, onClose }: Props) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [toast, setToast] = useState<string | null>(null);

    const [feedbackPhone, setFeedbackPhone] = useState("");

    useEffect(() => {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
            const data = JSON.parse(localData);
            if (data.feedbackPhone) setFeedbackPhone(data.feedbackPhone);
        }

        const feedbackRef = ref(db, "settings/complaintsWhatsapp");
        const unsubscribe = onValue(feedbackRef, (snapshot) => {
            if (snapshot.exists()) {
                const phone = snapshot.val();
                setFeedbackPhone(phone);
                localStorage.setItem(
                    LOCAL_STORAGE_KEY,
                    JSON.stringify({ feedbackPhone: phone })
                );
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!show) {
            setName("");
            setPhone("");
            setMessage("");
            setRating(0);
            setHoverRating(0);
        }
    }, [show]);

    const handleSend = () => {
        if (!message.trim()) {
            setToast("الرجاء كتابة الملاحظة ⚠️");
            setTimeout(() => setToast(null), 3000);
            return;
        }

        if (!feedbackPhone) {
            setToast("⚠️ رقم الشكاوى غير متوفر حالياً");
            setTimeout(() => setToast(null), 3000);
            return;
        }

        const fullMessage = `⭐ تقييم زبون ⭐
            ------------------
            🔹 الاسم: ${name || "-"}
            🔹 الجوال: ${phone || "-"}
            🔹 التقييم: ${rating}/5
            🔹 الملاحظة: ${message || "-"}`;

        const url =
            "https://wa.me/" + feedbackPhone + "?text=" + encodeURIComponent(fullMessage);
        window.open(url, "_blank");

        setToast("تم إرسال الملاحظة بنجاح ✅");
        setTimeout(() => setToast(null), 3000);
        onClose();
    };

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-luxury-black/90 backdrop-blur-xl"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-luxury-black border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        {/* Shimmer Background */}
                        <div className="absolute inset-0 pointer-events-none opacity-20 bg-linear-to-br from-gold/10 via-transparent to-transparent" />

                        <div className="relative z-10 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex flex-col">
                                    <h2 className="text-2xl font-black text-white tracking-tight">الآراء و الشكاوى</h2>
                                    <p className="text-white/40 text-sm mt-1">نهتم بأرائكم ونعمل على إسعادكم ✨</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gold/60 mr-2">الاسم</label>
                                    <input
                                        type="text"
                                        placeholder="الاسم (اختياري)"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-hidden focus:border-gold/50 transition-all"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gold/60 mr-2">رقم الجوال</label>
                                    <input
                                        type="tel"
                                        placeholder="05x-xxxxxxx"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-hidden focus:border-gold/50 transition-all text-left"
                                        dir="ltr"
                                    />
                                </div>

                                {/* Rating Section */}
                                <div className="flex flex-col items-center py-4 bg-white/5 rounded-3xl border border-white/5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gold/60 mb-3">تقييمك لنا</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(star)}
                                                className="relative w-8 h-8 transition-transform active:scale-90"
                                            >
                                                <FaStar className={`w-full h-full transition-colors duration-200 ${star <= (hoverRating || rating) ? 'text-gold' : 'text-white/10'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gold/60 mr-2">رسالتك</label>
                                    <textarea
                                        placeholder="اكتب ملاحظاتك هنا..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-hidden focus:border-gold/50 transition-all resize-none"
                                        rows={4}
                                    />
                                </div>

                                <button
                                    onClick={handleSend}
                                    className="group relative w-full mt-2 py-4 rounded-3xl bg-gold text-luxury-black font-black text-lg shadow-xl shadow-gold/20 hover:shadow-gold/40 hover:-translate-y-1 active:translate-y-0 transition-all overflow-hidden"
                                >
                                    <span className="relative z-10">إرسال عبر واتساب 📩</span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Toast Notification */}
                    <AnimatePresence>
                        {toast && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-luxury-black border border-white/10 px-6 py-4 rounded-2xl font-bold shadow-2xl text-gold"
                            >
                                {toast}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </AnimatePresence>
    );
}
