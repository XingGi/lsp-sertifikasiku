// frontend/src/features/qrc/components/QrcAiSuccessModal.jsx
import React from "react";
import { FiCheckCircle, FiCpu, FiArrowRight, FiX } from "react-icons/fi";

const QrcAiSuccessModal = ({ isOpen, onClose, onReview }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative transform transition-all scale-100">
        {/* Header Gradient (Indigo/Purple for AI) */}
        <div className="absolute top-0 left-0 w-full h-32 z-0 bg-gradient-to-br from-indigo-600 to-purple-700">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>
        </div>

        {/* Floating Icon */}
        <div className="relative z-10 flex justify-center mt-16 mb-4">
          <div className="bg-white p-2 rounded-full shadow-xl">
            <div className="p-4 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FiCpu size={48} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-8 pb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analisis Selesai!</h2>

          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-indigo-100 text-indigo-700 border border-indigo-200">AI Generated</span>
          </div>

          <p className="text-gray-500 text-sm leading-relaxed mb-8">Asisten AI telah berhasil menganalisis jawaban responden dan menyusun draft laporan awal. Silakan review dan sesuaikan hasilnya.</p>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={onReview} // Fungsi untuk scroll ke editor atau tutup modal
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              Review Hasil <FiArrowRight />
            </button>
          </div>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 z-20 text-white/80 hover:text-white transition-colors">
          <FiX size={24} />
        </button>
      </div>
    </div>
  );
};

export default QrcAiSuccessModal;
