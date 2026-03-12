import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FiDownload, FiLoader, FiX, FiEye } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface Item {
  id: string;
  name: string;
  price: string;
  visible: boolean;
  categoryId: string;
  ingredients?: string;
}

interface Category {
  id: string;
  name: string;
  available?: boolean;
  order?: number;
}

interface PdfExportProps {
  categories: Record<string, Category>;
  items: Record<string, Item>;
  restaurantName: string;
}

const PdfExport: React.FC<PdfExportProps> = ({ categories, items, restaurantName }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // هذا العنصر مخفي بالكامل لالتقاطه بدون مشاكل
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!pdfRef.current) return;

    try {
      setIsGenerating(true);
      const filename = `${restaurantName.replace(/\s+/g, "_")}_Menu.pdf`;

      // إنشاء canvas من المحتوى
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // ضبط الصورة لتتناسب داخل صفحة واحدة
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgWidthScaled = imgWidth * ratio;
      const imgHeightScaled = imgHeight * ratio;

      const x = (pdfWidth - imgWidthScaled) / 2;
      const y = 10; // مسافة بسيطة من أعلى الصفحة

      pdf.addImage(imgData, "JPEG", x, y, imgWidthScaled, imgHeightScaled);
      pdf.save(filename);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("حدث خطأ أثناء تحميل الملف. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsGenerating(false);
    }
  };

  const safeStyles = `
.pdf-template {
  width: 210mm;
  min-height: 297mm;
  padding: 25px;
  background-color: #1A1A1A; /* خلفية داكنة */
  color: #F5F5F5;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-sizing: border-box;
  direction: rtl;
}
.pdf-header {
  text-align: center;
  margin-bottom: 25px;
}
.pdf-title {
  font-size: 36px;
  font-weight: 900;
  color: #FFD700; /* ذهبية */
  letter-spacing: 1px;
  text-shadow: 1px 1px 2px #000;
  margin-bottom: 5px;
}
.pdf-slogan {
  font-size: 14px;
  color: #ccc;
  font-style: italic;
  text-shadow: 0 0 2px #000;
}
.pdf-divider {
  width: 100%;
  height: 3px;
  background: linear-gradient(to left, transparent, #FFD700, transparent);
  margin: 15px 0;
}
.pdf-sections {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.pdf-section {
  flex: 1 1 48%;
  min-width: 48%;
  margin-bottom: 15px;
  page-break-inside: avoid;
  background-color: #2A2A2A;
  padding: 12px;
  border-radius: 12px;
}
.pdf-section-title {
  font-size: 16px;
  font-weight: 700;
  color: #FFD700;
  background: #2A2A2A;
  padding: 6px 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  display: inline-block;
  box-shadow: 0 2px 6px rgba(0,0,0,0.5);
}
.pdf-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  border-bottom: 1px dashed #555;
  padding-bottom: 4px;
  align-items: flex-start;
}
.pdf-item-name {
  font-weight: 700;
  font-size: 14px;
  color: #F0E68C;
}
.pdf-item-ingredients {
  font-size: 12px;
  color: #ccc;
  margin-top: 2px;
  font-style: italic;
}
.pdf-item-price {
  font-weight: 700;
  font-size: 14px;
  color: #FFD700;
  white-space: nowrap;
  margin-left: 10px;
}
.pdf-footer {
  margin-top: 20px;
  padding-top: 12px;
  text-align: center;
  font-size: 12px;
  color: #aaa;
  border-top: 1px solid #555;
}
`;

  const MenuTemplate = () => (
    <div className="pdf-template">
      <style>{safeStyles}</style>
      <div className="pdf-header">
        <div className="pdf-title">Menu Chef Emad</div>
        <div className="pdf-slogan">ذكريات لا تنسى</div>
        <div className="pdf-divider" />
      </div>

      <div className="pdf-sections">
        {Object.entries(categories)
          .filter(([_, cat]) => cat.available !== false)
          .sort((a, b) => (a[1].order ?? 0) - (b[1].order ?? 0))
          .map(([catId, cat]) => {
            const catItems = Object.entries(items)
              .map(([id, item]) => ({ ...item, id }))
              .filter(item => item.categoryId === catId && item.visible);

            if (!catItems.length) return null;

            return (
              <div key={catId} className="pdf-section">
                <div className="pdf-section-title">{cat.name}</div>
                {catItems.map(item => (
                  <div key={item.id} className="pdf-item">
                    <div>
                      <div className="pdf-item-name">{item.name}</div>
                      {item.ingredients && <div className="pdf-item-ingredients">{item.ingredients}</div>}
                    </div>
                    <div className="pdf-item-price">{item.price} ₪</div>
                  </div>
                ))}
              </div>
            );
          })}
      </div>

      <div className="pdf-footer">
        تم إنشاؤه في: {new Date().toLocaleDateString("ar-JO")} | {restaurantName}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setShowPreview(true)}
        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gold hover:bg-gold/10 transition-all"
        title="معاينة المنيو PDF"
      >
        <FiEye size={22} />
      </button>

      {createPortal(
        <AnimatePresence>
          {showPreview && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                onClick={() => setShowPreview(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-card-bg w-full max-w-[980px] max-h-[95vh] flex flex-col rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                >
                  <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-luxury-black/40">
                    <h3 className="font-black text-white text-sm uppercase tracking-widest">
                      معاينة المنيو الاحترافي
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-gold text-black rounded-xl flex items-center gap-2 font-black text-xs"
                      >
                        {isGenerating ? <FiLoader className="animate-spin" /> : <FiDownload size={16} />}
                        تحميل المنيو
                      </button>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 text-white/40"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto bg-black/40 p-4 flex justify-center">
                    {/* النسخة المخفية لتوليد PDF بدون مشاكل */}
                    <div ref={pdfRef} style={{ position: "absolute", left: "-9999px", top: 0 }}>
                      <MenuTemplate />
                    </div>
                    {/* المعاينة */}
                    <div>
                      <MenuTemplate />
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default PdfExport;