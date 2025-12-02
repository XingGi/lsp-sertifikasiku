// frontend/src/features/qrc/components/QrcTypeSelectionModal.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiX, FiZap, FiFileText, FiCheckCircle, FiLock } from "react-icons/fi";
import QrcLimitReachedModal from "./QrcLimitReachedModal"; // Import Modal Baru

const QrcTypeSelectionModal = ({ isOpen, onClose, limits }) => {
  const navigate = useNavigate();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitType, setLimitType] = useState("standard");

  if (!isOpen) return null;

  const handleSelect = (type) => {
    // 1. Cek Limit dulu
    const remaining = type === "standard" ? limits?.standard?.remaining : limits?.essay?.remaining;

    if (remaining === 0) {
      setLimitType(type);
      setShowLimitModal(true); // Tampilkan modal limit, jangan tutup modal utama dulu atau tutup juga gapapa
      return;
    }

    // 2. Jika Aman, Navigasi
    onClose();
    if (type === "standard") {
      navigate("/qrc/assessment/new");
    } else {
      navigate("/qrc/assessment/new-essay");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800">Pilih Tipe Asesmen</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
              <FiX size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* STANDARD CARD */}
            <div
              onClick={() => handleSelect("standard")}
              className={`group cursor-pointer relative overflow-hidden rounded-xl border-2 p-5 transition-all duration-300 
                ${limits?.standard?.remaining === 0 ? "border-gray-200 bg-gray-50 opacity-75 grayscale" : "border-gray-100 hover:border-red-500 bg-white hover:shadow-lg"}`}
            >
              {/* Badge Limit */}
              <div className="absolute top-3 right-3">{limits?.standard?.remaining === 0 && <FiLock className="text-gray-400" />}</div>

              <div
                className={`mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg transition-colors 
                ${limits?.standard?.remaining === 0 ? "bg-gray-200 text-gray-500" : "bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white"}`}
              >
                <FiZap size={24} />
              </div>

              <h4 className="text-base font-bold text-gray-900 mb-2">Standard QRC</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Metode cepat (Multiple Choice). Sisa Kuota: <span className="font-bold">{limits?.standard?.remaining || 0}</span>
              </p>
            </div>

            {/* ESSAY CARD */}
            <div
              onClick={() => handleSelect("essay")}
              className={`group cursor-pointer relative overflow-hidden rounded-xl border-2 p-5 transition-all duration-300 
                ${limits?.essay?.remaining === 0 ? "border-gray-200 bg-gray-50 opacity-75 grayscale" : "border-gray-100 hover:border-blue-500 bg-white hover:shadow-lg"}`}
            >
              <div className="absolute top-3 right-3">{limits?.essay?.remaining === 0 && <FiLock className="text-gray-400" />}</div>

              <div
                className={`mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg transition-colors 
                ${limits?.essay?.remaining === 0 ? "bg-gray-200 text-gray-500" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"}`}
              >
                <FiFileText size={24} />
              </div>

              <h4 className="text-base font-bold text-gray-900 mb-2">Deep Analysis</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Metode mendalam (Essay). Sisa Kuota: <span className="font-bold">{limits?.essay?.remaining || 0}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Render Limit Modal jika state true */}
      <QrcLimitReachedModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} type={limitType} />
    </>
  );
};

export default QrcTypeSelectionModal;
