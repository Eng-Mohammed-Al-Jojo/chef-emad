import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../../firebase";
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { useToast } from "./ToastProvider";

interface AuthGateProps {
  onAuthSuccess: () => void;
}

const AuthGate: React.FC<AuthGateProps> = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const { showToast } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      showToast("أدخل البريد وكلمة المرور", "warning");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("تم تسجيل الدخول بنجاح ✅", "success");
    } catch {
      showToast("بيانات الدخول غير صحيحة", "error");
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      setResetMessage("أدخل البريد الإلكتروني أولاً");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك!");
      showToast("تم إرسال رابط إعادة التعيين", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-luxury-black font-[Cairo] relative overflow-hidden" dir="rtl">
      {/* Background Accents */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence>
        {showResetPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-luxury-black/90 backdrop-blur-xl flex justify-center items-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-morphic rounded-3xl p-6 w-full max-w-md border border-white/10 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-gold/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="flex justify-center mb-8">
                  <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain animate-premium-float" />
                </div>
                <h2 className="text-xl font-black mb-4 text-white text-center">
                  إعادة تعيين كلمة المرور
                </h2>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-gold/50 transition-colors"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                  {resetMessage && (
                    <p className="text-sm text-center text-green-400 font-bold">{resetMessage}</p>
                  )}
                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      onClick={handleResetPassword}
                      className="w-full bg-gold text-luxury-black font-black py-3 rounded-xl hover:bg-gold/90 transition shadow-lg shadow-gold/20 text-sm"
                    >
                      إرسال الرابط
                    </button>
                    <button
                      onClick={() => {
                        setShowResetPopup(false);
                        setResetMessage("");
                      }}
                      className="w-full bg-white/5 text-white font-bold py-3 rounded-xl border border-white/10 hover:bg-white/10 transition text-sm"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphic p-8 md:p-10 rounded-3xl w-full max-w-sm border border-white/10 relative overflow-hidden mx-4"
      >
        <div className="absolute inset-0 bg-linear-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full animate-pulse" />
            <img src="/logo.png" alt="Logo" className="relative w-20 h-20 object-contain" />
          </div>
          <div className="text-center mb-10">
            <h1 className="text-2xl font-black text-white mb-2">دخول الأدمن</h1>
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.3em]">Chef Emad Administration</p>
          </div>
          <div className="w-full space-y-4">
            <div className="group">
              <input
                type="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white outline-none focus:border-gold/50 transition-all group-hover:border-white/20"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="group">
              <input
                type="password"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white outline-none focus:border-gold/50 transition-all group-hover:border-white/20"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full py-4 rounded-xl font-black bg-gold text-luxury-black hover:bg-gold/90 transition-all shadow-xl shadow-gold/20 mt-4 text-xs uppercase tracking-widest active:scale-[0.98]"
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setShowResetPopup(true)}
              className="w-full mt-4 text-xs text-white/40 hover:text-gold transition-colors font-bold uppercase tracking-widest"
            >
              نسيت كلمة المرور؟
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthGate;
