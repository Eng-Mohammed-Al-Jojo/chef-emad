import {
  FaLaptopCode,
  FaMapMarkerAlt,
  FaInstagram,
  FaWhatsapp,
  FaFacebookF,
  FaPhoneAlt,
  FaTelegramPlane,
  FaTiktok,
  FaCommentDots,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import FeedbackModal from "../menu/FeedbackModal";
import { motion } from "framer-motion";

const LOCAL_STORAGE_KEY = "footerInfo";

export default function Footer() {

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [complaintsWhatsapp, setComplaintsWhatsapp] = useState("");

  const [footer, setFooter] = useState({
    address: "",
    phone: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    telegram: "",
  });

  const normalizeUrl = (url?: string) => {
    if (!url) return undefined;

    const trimmed = url.trim();

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://")
    ) {
      return trimmed;
    }

    return `https://${trimmed}`;
  };

  useEffect(() => {
    /* ===== footerInfo ===== */
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localData) setFooter(JSON.parse(localData));

    const footerRef = ref(db, "settings/footerInfo");
    const unsubFooter = onValue(footerRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log("Firebase footerInfo:", snapshot.val());
        const data = snapshot.val();
        setFooter(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      }
    });

    /* ===== complaintsWhatsapp ===== */
    const complaintsRef = ref(db, "settings/complaintsWhatsapp");
    const unsubComplaints = onValue(complaintsRef, (snapshot) => {
      const value = snapshot.val();
      setComplaintsWhatsapp(value ? String(value).trim() : "");
    });

    return () => {
      unsubFooter();
      unsubComplaints();
    };
  }, []);

  /* ===== Social Icons ===== */
  const socialIcons: { Icon: any; url: string | undefined }[] = [
    {
      Icon: FaWhatsapp,
      url: footer.whatsapp
        ? `https://wa.me/${footer.whatsapp}`
        : undefined,
    },
    { Icon: FaInstagram, url: normalizeUrl(footer.instagram) },
    { Icon: FaFacebookF, url: normalizeUrl(footer.facebook) },
    { Icon: FaTiktok, url: normalizeUrl(footer.tiktok) },
    { Icon: FaTelegramPlane, url: normalizeUrl(footer.telegram) },
  ];



  /* ===== Render ===== */
  return (
    <footer className="relative mt-20 pt-20 pb-12 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gold/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-morphic rounded-[2.5rem] p-8 md:p-12 overflow-hidden"
        >
          {/* Top Section: Address & Socials */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-12 border-b border-white/5 pb-12">
            
            {/* Address & Contact */}
            <div className="flex flex-col items-center md:items-start space-y-4 text-center md:text-right">
              {footer.address && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold/50">العنوان</span>
                  <div className="flex items-center gap-3 text-white text-xl font-bold">
                    <FaMapMarkerAlt className="text-gold" />
                    <span>{footer.address}</span>
                  </div>
                </div>
              )}

              {footer.phone && (
                <div className="flex flex-col gap-2 mt-4">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold/50">اتصل بنا</span>
                  <a
                    href={`tel:${footer.phone}`}
                    className="group flex items-center gap-3 text-white/80 hover:text-gold transition-colors text-lg"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                      <FaPhoneAlt size={16} />
                    </div>
                    <span>{footer.phone}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Logo/Brand Center */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-24 h-24 p-1 rounded-full bg-gradient-to-b from-gold/30 to-transparent">
                <div className="w-full h-full rounded-full bg-luxury-black overflow-hidden flex items-center justify-center border border-white/10">
                  <img src="/logo.png" alt="Chef Emad" className="w-16 h-16 object-contain" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">الشيف عماد</h2>
            </div>

            {/* Social Links */}
            <div className="flex flex-col items-center md:items-end gap-6">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold/50">تابعنا على</span>
              <div className="flex gap-4">
                {socialIcons.map(
                  ({ Icon, url }, i) =>
                    url && (
                      <motion.a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -5, scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 text-white/60 hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all duration-300"
                      >
                        <Icon size={20} />
                      </motion.a>
                    )
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section: Feedback & Signature */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Feedback Button */}
            {complaintsWhatsapp !== "" && (
              <motion.button
                onClick={() => setShowFeedbackModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-3 bg-gradient-to-r from-gold to-gold-dark text-luxury-black px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-gold/20"
              >
                <FaCommentDots className="text-xl animate-pulse" />
                أرسل تقييمك
              </motion.button>
            )}

            {/* Developer Signature */}
            <a
              href="https://engmohammedaljojo.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-transparent flex items-center justify-center border border-white/10">
                <FaLaptopCode className="text-gold" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-gold/60 transition-colors">تطوير وتصميم</span>
                <span className="text-xs font-black text-white/80 group-hover:text-white transition-colors">Eng. Mohammed Eljoujo</span>
              </div>
            </a>
          </div>
        </motion.div>

        {/* Copyright */}
        <div className="mt-12 text-center">
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} Chef Emad. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* Modals */}
      {complaintsWhatsapp !== "" && (
        <FeedbackModal
          show={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </footer>
  );
}
