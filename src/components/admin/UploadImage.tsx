// src/components/UploadImage.tsx
import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FiUpload, FiImage, FiAlertCircle, FiLoader } from "react-icons/fi";

interface UploadImageProps {
    onUpload: (filename: string) => void; // ترجع اسم الصورة بعد الرفع
}

const UploadImage: React.FC<UploadImageProps> = ({ onUpload }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("الرجاء اختيار صورة أولاً");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);

        try {
            setUploading(true);
            const res = await axios.post("http://localhost:5000/upload-image", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            onUpload(res.data.filename); // ترجع اسم الصورة للملف اللي يستدعيه
            setFile(null);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("فشل رفع الصورة، حاول مرة أخرى");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 glass-morphic p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none transition-all duration-500 group-hover:bg-gold/10" />

            <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center border border-gold/20 shadow-lg shadow-gold/5">
                    <FiImage size={18} />
                </div>
                <div>
                    <h4 className="text-white font-black text-xs uppercase tracking-widest">رفع صورة جديدة</h4>
                    <p className="text-white/30 text-[9px] font-medium italic">JPG, PNG, WebP (Max 5MB)</p>
                </div>
            </div>

            <div className="relative group/input">
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`
                    w-full py-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300
                    ${file ? "border-gold/40 bg-gold/5" : "border-white/10 bg-white/5 group-hover/input:border-white/20 group-hover/input:bg-white/[0.07]"}
                `}>
                    <div className={`p-2 rounded-xl transition-all duration-300 ${file ? "bg-gold text-luxury-black" : "bg-white/5 text-white/40"}`}>
                        <FiUpload size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-white/60">
                        {file ? file.name : "اضغط هنا لاختيار ملف"}
                    </span>
                </div>
            </div>

            <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="w-full py-2.5 rounded-xl bg-gold text-luxury-black font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gold/10 hover:bg-gold/90 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-2"
            >
                {uploading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <FiLoader size={18} />
                    </motion.div>
                ) : <FiUpload size={18} />}
                {uploading ? "جاري الرفع..." : "بدء الرفع"}
            </button>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-red-500 font-bold text-xs p-4 rounded-2xl bg-red-500/10 border border-red-500/20"
                >
                    <FiAlertCircle />
                    {error}
                </motion.div>
            )}
        </div>
    );
};

export default UploadImage;
