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



  return (
    <footer
      className="
        mt-20
        bg-black
        text-[#F5F8F7]
        rounded-t-3xl
        border-t border-[#FCD451]/30
        font-[Almarai]
      "
    >
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* ===== Right | Address ===== */}
        <div className="flex flex-col md:items-start items-center space-y-3 w-full md:w-auto text-[#F5F5DC]">
          {footer.address && (
            <div className="flex items-center gap-2 text-lg font-[Cairo] text-[#FCD451]">
              <FaMapMarkerAlt className="text-xl shrink-0 text-[#FCD451]" />
              <span className="text-right text-[#FCD451]">{footer.address}</span>
            </div>
          )}



          {footer.phone && (
            <a
              href={`tel:${footer.phone}`}
              className="flex items-center gap-2"
            >
              <FaPhoneAlt /> {footer.phone}
            </a>
          )}
        </div>

        {/* ===== Center | Social + Feedback ===== */}
        <div className="flex flex-col items-center gap-5 w-full md:w-auto">
          <div className="flex gap-4">
            {socialIcons.map(
              ({ Icon, url }, i) =>
                url && (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      w-10 h-10 rounded-full flex items-center justify-center
                      bg-[#FCD451] text-[#ffffff]
                      hover:scale-110
                      hover: shadow-white
                      transition-all duration-300
                    "
                  >
                    <Icon className="text-black text-lg" />
                  </a>
                )
            )}
          </div>

          {/* ===== Feedback Button ===== */}
          {complaintsWhatsapp !== "" && (
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="
                mt-4 w-full max-w-xs flex items-center justify-center gap-2
                bg-[#FCD451] text-[#040309]
                rounded-xl
                py-3 px-4
                shadow-lg
                hover:scale-105 hover:shadow-xl
                transition-all duration-300
              "
            >
              <FaCommentDots className="w-6 h-6 animate-pulse" />
              <span className="text-sm font-bold">أرسل تقييمك</span>
            </button>
          )}
        </div>

        {/* ===== Left | Signature ===== */}
        <div className="flex flex-col md:items-start items-center w-full md:w-auto">
          <a
            href="https://engmohammedaljojo.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-[#F7F3E8]/10 hover:bg-[#F7F3E8]/20 transition"
          >
            <div className="w-10 h-10 rounded-full bg-[#F7F3E8]/20 flex items-center justify-center">
              <FaLaptopCode className="text-[#F7F3E8] text-lg" />
            </div>

            <div className="leading-tight text-center md:text-left">
              <span className="block text-[10px] opacity-80 font-[Lemonada]">
                تصميم وتطوير
              </span>
              <span className="block font-extrabold text-xs md:text-sm font-[Lemonada]">
                Eng. Mohammed Eljoujo
              </span>
            </div>
          </a>
        </div>
      </div>

      {/* ===== Feedback Modal ===== */}
      {complaintsWhatsapp !== "" && (
        <FeedbackModal
          show={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </footer>
  );
}
