import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { ref, get } from "firebase/database";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    show: boolean;
    onClose: () => void;
}

interface Item {
    id: string;
    name: string;
    description?: string;
    price: string;
    image?: string;
    star?: boolean;
    visible?: boolean;
}

export default function FeaturedModal({ show, onClose }: Props) {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!show) return;

        const fetchStarItems = async () => {
            try {
                const snap = await get(ref(db, "items"));
                if (snap.exists()) {
                    const data = snap.val();
                    const starItems = Object.entries(data)
                        .map(([id, item]: any) => ({ id, ...item }))
                        .filter(item => item.star === true && item.visible !== false);
                    setItems(starItems);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStarItems();
    }, [show]);

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
                        className="relative w-full max-w-4xl bg-luxury-black border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        {/* Shimmer Background */}
                        <div className="absolute inset-0 pointer-events-none opacity-20 bg-linear-to-br from-gold/10 via-transparent to-transparent" />

                        {/* Header */}
                        <div className="relative z-10 p-6 md:p-8 flex items-center justify-between border-b border-white/5">
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                                <span className="text-gold">⭐</span> الأصناف الأكثر طلباً
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 p-6 md:p-8">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
                                    <p className="text-gold/60 font-medium">جاري التحميل...</p>
                                </div>
                            ) : items.length === 0 ? (
                                <div className="text-center py-20">
                                    <p className="text-white/40 text-lg">لا يوجد أصناف مميزة حالياً</p>
                                </div>
                            ) : (
                                <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 pt-2 scrollbar-hide">
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            whileHover={{ y: -8 }}
                                            className="shrink-0 snap-center w-72 md:w-80 group"
                                        >
                                            <div className="relative rounded-4xl bg-white/5 border border-white/5 p-6 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/10">
                                                {/* Image */}
                                                <div className="aspect-square rounded-2xl overflow-hidden mb-6 bg-luxury-black/40">
                                                    <img
                                                        src={item.image ? `/images/${item.image}` : `/logo.png`}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                </div>

                                                {/* Details */}
                                                <div className="text-center">
                                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gold transition-colors">
                                                        {item.name}
                                                    </h3>
                                                    {item.description && (
                                                        <p className="text-sm text-white/40 line-clamp-2 mb-4 h-10">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                    <div className="inline-block px-4 py-2 rounded-xl bg-gold text-luxury-black font-black">
                                                        {item.price}₪
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="p-4 bg-luxury-black/40 text-center border-t border-white/5">
                            <p className="text-white/30 text-xs font-medium uppercase tracking-widest">
                                اسحب للتنقل بين الأصناف
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}