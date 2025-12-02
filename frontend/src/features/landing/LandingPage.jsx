// frontend/src/pages/LandingPage.jsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiShield, FiCheckCircle, FiAward, FiUsers, FiArrowRight, FiBriefcase, FiTrendingUp, FiBookOpen, FiMonitor, FiPieChart, FiPhone, FiMail } from "react-icons/fi";
import AuthModal from "../../components/auth/AuthModal";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { useAuth } from "../../context/AuthContext";

// --- DATA PROGRAM SERTIFIKASI (Disesuaikan dengan referensi gambar) ---
const programs = [
  {
    icon: <FiMonitor className="w-8 h-8" />,
    title: "Sertifikasi IT & Cyber Security",
    description: "Validasi kompetensi teknis Anda dalam keamanan data, pengembangan perangkat lunak, dan manajemen infrastruktur TI.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: <FiBriefcase className="w-8 h-8" />,
    title: "Sertifikasi Manajemen Risiko",
    description: "Standarisasi kemampuan dalam mengidentifikasi, menganalisis, dan memitigasi risiko bisnis sesuai standar ISO 31000.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: <FiUsers className="w-8 h-8" />,
    title: "Sertifikasi SDM (HR)",
    description: "Tingkatkan profesionalisme dalam pengelolaan sumber daya manusia, rekrutmen, dan pengembangan talenta.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: <FiBookOpen className="w-8 h-8" />,
    title: "Sertifikasi Akuntansi",
    description: "Sertifikasi profesi untuk bidang keuangan dan akuntansi yang diakui secara nasional maupun internasional.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    icon: <FiTrendingUp className="w-8 h-8" />,
    title: "Sertifikasi Digital Marketing",
    description: "Program sertifikasi untuk profesional pemasaran di era digital, mencakup SEO, SEM, dan Social Media Strategy.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: <FiPieChart className="w-8 h-8" />,
    title: "Custom Corporate Training",
    description: "Program pelatihan dan sertifikasi yang disesuaikan dengan kebutuhan spesifik industri perusahaan Anda.",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
];

// --- DATA KENAPA MEMILIH KAMI ---
const features = [
  {
    icon: <FiShield className="w-6 h-6" />,
    title: "Terakreditasi BNSP",
    desc: "Semua program sertifikasi kami terakreditasi oleh Badan Nasional Sertifikasi Profesi.",
  },
  {
    icon: <FiUsers className="w-6 h-6" />,
    title: "Instruktur Berpengalaman",
    desc: "Belajar langsung dari praktisi ahli dengan pengalaman industri lebih dari 10 tahun.",
  },
  {
    icon: <FiCheckCircle className="w-6 h-6" />,
    title: "Proses Cepat & Mudah",
    desc: "Pendaftaran online yang mudah dengan proses sertifikasi yang cepat, transparan dan efisien.",
  },
  {
    icon: <FiAward className="w-6 h-6" />,
    title: "Diakui Industri",
    desc: "Sertifikat yang diakui oleh perusahaan-perusahaan terkemuka di Indonesia.",
  },
];

// --- STATISTIK ---
const stats = [
  { number: "10,000+", label: "Profesional Tersertifikasi" },
  { number: "50+", label: "Program Sertifikasi" },
  { number: "500+", label: "Perusahaan Mitra" },
  { number: "98%", label: "Tingkat Kepuasan" },
];

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
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
    <div className="font-sans text-slate-800 bg-white selection:bg-cyan-100">
      <Navbar onLoginClick={handleOpenLogin} onRegisterClick={handleOpenRegister} />

      {/* --- HERO SECTION (Based on Reference) --- */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400">
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-cyan-300/20 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-4xl mx-auto">
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold mb-8 shadow-lg">
              <FiCheckCircle /> Lembaga Sertifikasi Profesi Terpercaya
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
              Tingkatkan Karier dengan <br />
              <span className="text-amber-300">Sertifikasi Profesional</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg lg:text-xl text-blue-50 mb-8 leading-relaxed max-w-2xl mx-auto">
              LSP-Sertifikasiku memberikan sertifikasi berkualitas tinggi yang diakui industri untuk mengembangkan kompetensi profesional Anda ke level berikutnya.
            </motion.p>

            {/* Trust Badges (Pills) */}
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-3 mb-10">
              {["Terakreditasi BNSP", "Instruktur Berpengalaman", "Sertifikat Resmi"].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white text-sm font-medium backdrop-blur-md border border-white/20">
                  <FiCheckCircle className="text-cyan-300" /> {badge}
                </div>
              ))}
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-blue-700 bg-white rounded-xl shadow-xl hover:shadow-2xl hover:bg-blue-50 transition-all transform hover:-translate-y-1"
                >
                  Masuk Dashboard <FiArrowRight className="ml-2" />
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleOpenRegister}
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-amber-500 rounded-xl shadow-lg shadow-amber-500/30 hover:bg-amber-400 transition-all transform hover:-translate-y-1"
                  >
                    Daftar Sekarang
                  </button>
                  <button onClick={handleOpenLogin} className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-transparent border-2 border-white/50 rounded-xl hover:bg-white/10 transition-all">
                    Masuk Akun
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- PROGRAMS SECTION (Grid Cards) --- */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">Program Sertifikasi Kami</h3>
            <p className="mt-4 text-lg text-slate-500">Berbagai pilihan program sertifikasi profesional untuk mengembangkan kompetensi Anda.</p>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="group bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-slate-100 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${program.bg} ${program.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>{program.icon}</div>
                <h4 className="text-xl font-bold text-slate-800 mb-3">{program.title}</h4>
                <p className="text-slate-500 leading-relaxed text-sm">{program.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- WHY CHOOSE US SECTION --- */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">Mengapa Memilih LSP-Sertifikasiku?</h3>
            <p className="mt-4 text-lg text-slate-500">Kami berkomitmen memberikan layanan sertifikasi terbaik untuk kesuksesan karier Anda.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-5 shadow-sm">{feature.icon}</div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed px-4">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STATS STRIP --- */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-4">
                <div className="text-4xl lg:text-5xl font-extrabold mb-2">{stat.number}</div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION (Blue Box Style) --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl p-10 md:p-16 text-center shadow-2xl text-white relative overflow-hidden"
          >
            {/* Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/10 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl"></div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">
              Siap Meningkatkan Kompetensi <br /> Profesional Anda?
            </h2>
            <p className="text-lg text-blue-50 mb-10 max-w-2xl mx-auto relative z-10">Bergabunglah dengan ribuan profesional yang telah meningkatkan karier mereka bersama LSP-Sertifikasiku.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button
                onClick={() => window.open("https://wa.me/6281234567890", "_blank")}
                className="inline-flex items-center justify-center px-8 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg transition-all shadow-lg"
              >
                Konsultasi Gratis <FiArrowRight className="ml-2" />
              </button>
              <button onClick={handleOpenRegister} className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg">
                Lihat Jadwal
              </button>
            </div>

            <div className="mt-8 flex justify-center gap-6 text-sm text-blue-100 font-medium relative z-10">
              <span className="flex items-center gap-2">
                <FiMail /> info@sertifikasiku.id
              </span>
              <span className="flex items-center gap-2">
                <FiPhone /> +62 812-3456-7890
              </span>
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
