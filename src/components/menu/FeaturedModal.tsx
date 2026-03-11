import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { ref, get } from "firebase/database";
import { db } from "../../firebase";


interface Props {
    show: boolean;
    onClose: () => void;
}

interface Item {
    id: string;
    name: string;
    description?: string;
    price: string;
    image?: string; // اسم الصورة
    star?: boolean;    // ⭐ نجمة
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

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
            {/* Overlay */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-[#040309]/80 backdrop-blur-md"
            />

            {/* Modal Container */}
            <div className="relative w-[90%] max-w-3xl bg-[#040309] rounded-3xl p-6 shadow-[0_0_80px_rgba(252,212,81,0.4)] overflow-hidden animate-fadeIn border-2 border-[#FCD451]">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 text-[#FCD451] hover:text-[#FCD451]/80 transition-colors duration-300"
                >
                    <FaTimes size={24} />
                </button>

                {/* Title */}
                <h2 className="text-center text-3xl md:text-4xl font-extrabold mb-6 text-[#FCD451] tracking-wider">
                    ⭐ الأصناف الأكثر طلباً
                </h2>

                {loading ? (
                    <div className="text-center py-20 text-[#FCD451]/80 text-lg font-[Cairo]">
                        جاري التحميل...
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 text-[#FCD451]/80 text-lg font-[Cairo]">
                        لا يوجد أصناف مميزة حالياً
                    </div>
                ) : (
                    <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide gap-6 py-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="shrink-0 snap-center w-64 md:w-72 bg-[#040309]/50 backdrop-blur-xl rounded-3xl shadow-[0_10px_60px_rgba(252,212,81,0.4)] transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(252,212,81,0.6)]"
                            >
                                {/* Image */}
                                <div className="flex justify-center mt-4">
                                    <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden bg-[#040309]/80 shadow-[0_0_40px_rgba(252,212,81,0.4)] flex items-center justify-center transition-all duration-500 hover:shadow-[0_0_60px_rgba(252,212,81,0.6)] hover:scale-105">
                                        <img
                                            src={item.image ? `/images/${item.image}` : `/logo.png`}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-bold mb-2 text-[#FCD451]">
                                        {item.name}
                                    </h3>

                                    {item.description && (
                                        <p className="text-base text-[#FCD451]/80 mb-4">
                                            {item.description}
                                        </p>
                                    )}

                                    <div className="text-xl font-extrabold text-[#FCD451]">
                                        {item.price}₪
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-center text-sm text-[#FCD451]/80 mt-4 font-[Cairo]">
                    اسحب يمين أو يسار للتنقل
                </p>
            </div>
        </div>
    );
}