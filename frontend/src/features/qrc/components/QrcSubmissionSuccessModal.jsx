// frontend/src/features/qrc/components/QrcSubmissionSuccessModal.jsx
import React from "react";
import { FiCheckCircle, FiArrowRight, FiZap, FiFileText } from "react-icons/fi";

const QrcSubmissionSuccessModal = ({ isOpen, onClose, onToDashboard, type = "standard" }) => {
  if (!isOpen) return null;

  const isEssay = type === "essay";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative transform transition-all scale-100">
        {/* Decorative Header Background */}
        <div className={`absolute top-0 left-0 w-full h-32 z-0 bg-gradient-to-br ${isEssay ? "from-blue-500 to-indigo-600" : "from-red-500 to-rose-600"}`}></div>

        {/* Floating Icon */}
        <div className="relative z-10 flex justify-center mt-12 mb-4">
          <div className="bg-white p-2 rounded-full shadow-xl">
            <div className={`p-4 rounded-full flex items-center justify-center ${isEssay ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"}`}>
              <FiCheckCircle size={48} />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="relative z-10 px-8 pb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Asesmen Terkirim!</h2>

          <div className="flex justify-center mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isEssay ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
              {isEssay ? (
                <>
                  <FiFileText /> Deep Analysis
                </>
              ) : (
                <>
                  <FiZap /> Quick Scan
                </>
              )}
            </span>
          </div>

          <p className="text-gray-500 text-sm leading-relaxed mb-8">Terima kasih telah melengkapi data. Hasil asesmen Anda telah aman tersimpan dan sedang dalam antrean untuk dianalisis oleh sistem & konsultan.</p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onToDashboard}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                isEssay ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30" : "bg-red-600 hover:bg-red-700 shadow-red-600/30"
              }`}
            >
              Lihat Riwayat <FiArrowRight />
            </button>

            <button onClick={onClose} className="w-full py-3.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-bold transition-colors">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrcSubmissionSuccessModal;
