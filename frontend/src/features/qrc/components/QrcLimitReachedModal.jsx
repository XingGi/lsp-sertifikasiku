// frontend/src/features/qrc/components/QrcLimitReachedModal.jsx
import React from "react";
import { FiX, FiAlertTriangle, FiPhone } from "react-icons/fi";

const QrcLimitReachedModal = ({ isOpen, onClose, type = "standard" }) => {
  if (!isOpen) return null;

  let title = "";
  let messageContent = null;

  if (type === "all") {
    title = "Semua Kuota Habis";
    messageContent = (
      <>
        Anda telah mencapai batas penggunaan untuk <span className="font-bold text-gray-800">semua tipe asesmen</span> (Standard & Deep Analysis).
      </>
    );
  } else {
    const isEssay = type === "essay";
    const typeName = isEssay ? "Deep Analysis" : "Standard QRC";
    title = "Kuota Habis";
    messageContent = (
      <>
        Mohon maaf, Anda telah mencapai batas penggunaan untuk asesmen tipe <span className="font-bold text-gray-800">{typeName}</span>.
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative transform transition-all scale-100">
        {/* Header Warning Gradient */}
        <div className="absolute top-0 left-0 w-full h-32 z-0 bg-gradient-to-br from-amber-500 to-orange-600"></div>

        {/* Icon */}
        <div className="relative z-10 flex justify-center mt-12 mb-4">
          <div className="bg-white p-2 rounded-full shadow-xl">
            <div className="p-4 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <FiAlertTriangle size={48} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-8 pb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>

          <p className="text-gray-500 text-sm leading-relaxed mb-6">{messageContent}</p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-gray-500 mb-1">Butuh akses lebih?</p>
            <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
              <FiPhone className="text-amber-600" /> Hubungi Admin / Sales
            </p>
          </div>

          <button onClick={onClose} className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95">
            Mengerti
          </button>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 z-20 text-white/80 hover:text-white transition-colors">
          <FiX size={24} />
        </button>
      </div>
    </div>
  );
};

export default QrcLimitReachedModal;
