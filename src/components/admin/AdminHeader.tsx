import React from "react";
import { motion } from "framer-motion";
import { FiDownload, FiSettings, FiUpload, FiLogOut } from "react-icons/fi";
import { FaDatabase } from "react-icons/fa";
import PdfExport from "./PdfExport";

interface AdminHeaderProps {
  onShowSettings: () => void;
  onExportExcel: () => void;
  onImportExcel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportJSON: () => void;
  onLogout: () => void;
  categories: any;
  items: any;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  onShowSettings,
  onExportExcel,
  onImportExcel,
  onExportJSON,
  onLogout,
  categories,
  items,
}) => {
  return (
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
            onClick={onShowSettings}
            title="إعدادات النظام"
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 text-gold hover:bg-gold hover:text-luxury-black transition-all duration-300"
          >
            <FiSettings size={20} />
          </button>
          
          <div className="w-px bg-white/10 mx-1 self-stretch" />

          <button
            onClick={onExportExcel}
            title="تصدير Excel"
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-300"
          >
            <FiUpload size={20} />
          </button>
          
          <label 
            htmlFor="excelUpload" 
            title="استيراد Excel"
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-300 cursor-pointer"
          >
            <FiDownload size={20} />
            <input 
              type="file" 
              accept=".xlsx" 
              id="excelUpload" 
              hidden 
              onChange={onImportExcel} 
            />
          </label>

          <div className="w-px bg-white/10 mx-1 self-stretch" />

          <PdfExport 
            categories={categories} 
            items={items} 
            restaurantName="طاهي عماد - Chef Emad" 
          />

          <div className="w-px bg-white/10 mx-1 self-stretch" />

          <button
            onClick={onExportJSON}
            title="نسخة احتياطية (JSON)"
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            <FaDatabase size={18} />
          </button>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all duration-300 font-bold text-sm"
        >
          <FiLogOut />
          <span>خروج</span>
        </button>
      </div>
    </motion.div>
  );
};

export default AdminHeader;
