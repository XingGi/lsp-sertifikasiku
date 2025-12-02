// frontend/src/pages/LandingPage.jsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiShield, FiBriefcase, FiBarChart2, FiAlertTriangle, FiArrowRight, FiCpu, FiLayers, FiCheckSquare, FiList, FiSearch, FiTrello, FiUser, FiUsers, FiTrendingUp, FiActivity, FiGlobe, FiLock } from "react-icons/fi";
import AuthModal from "../../components/auth/AuthModal";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { useAuth } from "../../context/AuthContext";

// --- DATA FITUR (Updated Icons & Colors) ---
const features = [
  {
    icon: <FiCpu className="w-8 h-8 text-white" />,
    bg: "bg-blue-500",
    title: "Risk Management AI",
    description: "AI canggih untuk identifikasi risiko otomatis, analisis mendalam, dan rekomendasi mitigasi cerdas dalam hitungan detik.",
  },
  {
    icon: <FiLayers className="w-8 h-8 text-white" />,
    bg: "bg-indigo-500",
    title: "Asesmen Manual Terstruktur",
    description: "Alur kerja sistematis (Dasar & Madya) untuk pemetaan risiko unit kerja yang komprehensif dan terstandarisasi.",
  },
  {
    icon: <FiCheckSquare className="w-8 h-8 text-white" />,
    bg: "bg-emerald-500",
    title: "RSCA (Self-Assessment)",
    description: "Platform mandiri untuk departemen dalam menilai risiko dan efektivitas kontrol internal mereka sendiri.",
  },
  {
    icon: <FiBarChart2 className="w-8 h-8 text-white" />,
    bg: "bg-violet-500",
    title: "Business Process Review",
    description: "Visualisasi dan analisis risiko pada setiap tahapan proses bisnis untuk operasional yang lebih tangguh.",
  },
  {
    icon: <FiAlertTriangle className="w-8 h-8 text-white" />,
    bg: "bg-rose-500",
    title: "Business Impact Analysis",
    description: "Simulasi dampak kegagalan aset kritis terhadap kelangsungan bisnis dengan prediksi kerugian kuantitatif.",
  },
  {
    icon: <FiGlobe className="w-8 h-8 text-white" />,
    bg: "bg-cyan-500",
    title: "Horizon Scanning",
    description: "Deteksi dini ancaman dan peluang strategis dari tren pasar global menggunakan intelijen berbasis data.",
  },
];

const userRoles = [
  {
    icon: <FiUser className="w-10 h-10 text-blue-600" />,
    role: "Manajer Risiko",
    needs: "Sentralisasi data risiko, pelaporan otomatis, dan alat analisis canggih.",
  },
  {
    icon: <FiUsers className="w-10 h-10 text-indigo-600" />,
    role: "Pimpinan Unit",
    needs: "Kemudahan input risiko operasional dan pemantauan status mitigasi tim.",
  },
  {
    icon: <FiTrendingUp className="w-10 h-10 text-emerald-600" />,
    role: "Eksekutif (C-Level)",
    needs: "Dashboard strategis, peta risiko visual, dan wawasan untuk pengambilan keputusan.",
  },
];

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState("login");
  const { user } = useAuth();

  const handleOpenLogin = () => {
    setModalView("login");
    setIsModalOpen(true);
  };

  const handleOpenRegister = () => {
    setModalView("register");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="font-sans text-slate-800 bg-white selection:bg-blue-100">
      <Navbar onLoginClick={handleOpenLogin} onRegisterClick={handleOpenRegister} />

      {/* --- HERO SECTION (MODERN & COLORFUL) --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-3xl filter mix-blend-multiply opacity-70 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-400/20 blur-3xl filter mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-[500px] h-[500px] rounded-full bg-pink-400/20 blur-3xl filter mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-left">
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold mb-6 shadow-sm">🚀 Platform GRC Masa Depan</div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                Kelola Risiko dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Kecerdasan AI</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                SIRICO menggabungkan manajemen risiko tradisional dengan kekuatan Artificial Intelligence. Identifikasi, analisis, dan mitigasi risiko bisnis Anda lebih cepat, akurat, dan terintegrasi dalam satu platform modern.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1"
                  >
                    Masuk Dashboard <FiArrowRight className="ml-2" />
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={handleOpenRegister}
                      className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1"
                    >
                      Mulai Gratis
                    </button>
                    <button
                      onClick={handleOpenLogin}
                      className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                      Masuk Akun
                    </button>
                  </>
                )}
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-2">
                  <FiCheckSquare className="text-green-500" /> Setup Instan
                </span>
                <span className="flex items-center gap-2">
                  <FiShield className="text-blue-500" /> Data Aman
                </span>
                <span className="flex items-center gap-2">
                  <FiCpu className="text-purple-500" /> AI Powered
                </span>
              </div>
            </motion.div>

            {/* Illustration / Visual */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative hidden lg:block">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                {/* Placeholder Dashboard UI Mockup */}
                <div className="bg-slate-50 rounded-xl overflow-hidden aspect-[4/3] flex flex-col relative">
                  {/* Header Mockup */}
                  <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  {/* Content Mockup (Abstract) */}
                  <div className="p-6 grid grid-cols-3 gap-4 flex-1">
                    <div className="col-span-2 bg-white rounded-lg shadow-sm p-4 flex flex-col gap-3">
                      <div className="w-1/3 h-4 bg-slate-200 rounded"></div>
                      <div className="w-full h-32 bg-blue-50 rounded-lg relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-blue-200 to-transparent opacity-50"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-16 bg-blue-500 rounded-t"></div>
                        <div className="absolute bottom-4 left-16 w-8 h-24 bg-indigo-500 rounded-t"></div>
                        <div className="absolute bottom-4 left-28 w-8 h-10 bg-cyan-500 rounded-t"></div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col gap-3">
                      <div className="w-1/2 h-4 bg-slate-200 rounded"></div>
                      <div className="flex-1 bg-rose-50 rounded-lg flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border-4 border-rose-500 flex items-center justify-center text-rose-600 font-bold">75%</div>
                      </div>
                    </div>
                    <div className="col-span-3 bg-white rounded-lg shadow-sm p-4 flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-100"></div>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-emerald-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards Decoration */}
              <div className="absolute -top-10 -right-10 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <FiCheckSquare />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Status</div>
                    <div className="text-sm font-bold text-slate-800">Risk Compliant</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-bounce-slow animation-delay-2000">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <FiCpu />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">AI Analysis</div>
                    <div className="text-sm font-bold text-slate-800">Generating...</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION (CARDS) --- */}
      <section className="py-24 bg-slate-50 relative">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">Fitur Unggulan</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">Satu Platform, Solusi GRC Menyeluruh</h3>
            <p className="mt-4 text-lg text-slate-600">Kami menyediakan alat yang Anda butuhkan untuk mengidentifikasi, menilai, dan memitigasi risiko dengan efisiensi tinggi.</p>
          </div>

          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div key={feature.title} variants={itemVariants} className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-slate-100 hover:border-blue-100 transition-all duration-300 relative overflow-hidden">
                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center shadow-lg mb-6 transform group-hover:scale-110 transition-transform duration-300`}>{feature.icon}</div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">{feature.title}</h4>
                  <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- USER ROLES SECTION --- */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Dirancang untuk Kolaborasi Tim</h2>
              <p className="text-lg text-slate-600 mb-8">SIRICO bukan hanya untuk Manajer Risiko. Kami membangun platform yang menghubungkan seluruh lapisan organisasi dalam budaya sadar risiko.</p>

              <div className="space-y-6">
                {userRoles.map((role, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.2 }}
                    className="flex gap-5 p-5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div className="shrink-0">{role.icon}</div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{role.role}</h4>
                      <p className="text-slate-600 text-sm mt-1">{role.needs}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Side: Abstract Visual */}
            <div className="relative lg:h-[600px] bg-slate-100 rounded-3xl overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 opacity-90"></div>
              {/* Pattern */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

              <div className="relative z-10 text-center p-10">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl max-w-md mx-auto">
                  <h3 className="text-2xl font-bold text-white mb-2">Enterprise Grade Security</h3>
                  <p className="text-blue-100 mb-6">Data Anda dilindungi dengan standar keamanan tertinggi dan enkripsi modern.</p>
                  <div className="flex justify-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <FiLock className="text-white w-6 h-6" />
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <FiShield className="text-white w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        <div className="container mx-auto max-w-4xl px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Siap Mengubah Cara Anda Mengelola Risiko?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Bergabunglah dengan organisasi cerdas lainnya yang telah menggunakan SIRICO untuk masa depan yang lebih aman.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Buka Dashboard
                </Link>
              ) : (
                <button
                  onClick={handleOpenRegister}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Daftar Sekarang - Gratis
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <AuthModal isOpen={isModalOpen} onClose={handleCloseModal} initialView={modalView} />
    </div>
  );
}

export default LandingPage;
