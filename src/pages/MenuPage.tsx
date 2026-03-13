import { useState } from "react";
// import CartButton from "../components/cart/CartButton";
import Footer from "../components/menu/footer";
import Menu from "../components/menu/Menu";
import { FaFire } from "react-icons/fa";
import FeaturedModal from "../components/menu/FeaturedModal";
import { motion, AnimatePresence } from "framer-motion";

export default function MenuPage() {
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasFeatured, setHasFeatured] = useState(false);

  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col bg-luxury-black text-white font-[Cairo] overflow-x-hidden"
    >
      {/* Premium Background Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hero / Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="flex flex-col items-center justify-center w-full pt-16 pb-8 px-4"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-1000" />
            <img
              src="/logo.png"
              alt="Logo"
              className="relative w-48 md:w-64 object-contain drop-shadow-[0_20px_50px_rgba(252,212,81,0.2)] animate-premium-float"
            />
          </div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-8 text-4xl md:text-6xl font-black tracking-tighter text-white text-center"
          >
            الشيف عماد
          </motion.h1>
          <div className="w-12 h-1 bg-gold/30 rounded-full mt-4" />
        </motion.div>

        {/* Menu Content */}
        <div className="flex-1 w-full max-w-7xl mx-auto">
          <Menu
            onLoadingChange={setLoading}
            onFeaturedCheck={setHasFeatured}
          />
        </div>

        {/* Footer */}
        <Footer />
      </div>
      {/* Floating Featured Button */}
      <AnimatePresence>
        {!loading && hasFeatured && (
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="fixed top-8 right-6 z-50"
          >
            <button
              onClick={() => setShowFeaturedModal(true)}
              className="relative group flex items-center gap-2 bg-luxury-black/60 backdrop-blur-xl border border-gold/30 px-4 py-2 rounded-full shadow-xl hover:border-gold/60 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative w-7 h-7 md:w-9 md:h-9 flex items-center justify-center bg-gold rounded-full text-luxury-black shadow-md shadow-gold/20">
                <FaFire className="w-4 h-4 animate-pulse" />
              </div>

              <span className="relative text-[10px] md:text-sm font-black text-gold tracking-wider">
                الأكثر طلباً
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <FeaturedModal
        show={showFeaturedModal}
        onClose={() => setShowFeaturedModal(false)}
      />
    </div>
  );
}
