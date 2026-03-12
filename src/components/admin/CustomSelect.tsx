import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiCheck } from "react-icons/fi";

interface Props {
    options: { id: string; name: string }[];
    value: string;
    onChange: (val: string) => void;
    error?: boolean;
    placeholder?: string;
}

const CustomSelect: React.FC<Props> = ({ options, value, onChange, error, placeholder }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.id === value);

    return (
        <div className="relative w-full" ref={ref} dir="rtl">

            {/* الزر */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`
                    w-full flex flex-row justify-between items-center px-4 py-2.5 border rounded-xl text-sm
                    ${error ? "border-red-500/50 bg-red-500/5 text-red-400" : "border-white/10 bg-white/5 text-white"} 
                    outline-none hover:border-gold/30 transition-all duration-300 group
                `}
            >
                <span className="font-semibold">
                    {selectedOption ? selectedOption.name : placeholder || "اختر"}
                </span>

                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-white/30 group-hover:text-gold transition-colors"
                >
                    <FiChevronDown size={16} />
                </motion.span>
            </button>

            {/* القائمة */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -8 }}
                        className="
                            absolute z-50 w-full right-0 mt-2 
                            border border-white/10 
                            rounded-xl 
                            bg-luxury-black/95 backdrop-blur-md
                            shadow-2xl overflow-hidden py-1
                        "
                    >
                        <div className="max-h-52 overflow-y-auto scrollbar-none">

                            {options.map(o => (
                                <button
                                    key={o.id}
                                    type="button"
                                    onClick={() => { onChange(o.id); setOpen(false); }}
                                    className={`
                                        w-full text-right px-4 py-2.5 text-sm flex items-center justify-between transition-all duration-200
                                        ${value === o.id
                                            ? "bg-gold text-luxury-black font-bold"
                                            : "text-white/70 hover:bg-white/5 hover:text-white"}
                                    `}
                                >
                                    <span>{o.name}</span>
                                    {value === o.id && <FiCheck size={14} />}
                                </button>
                            ))}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomSelect;