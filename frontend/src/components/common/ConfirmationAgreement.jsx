// frontend/src/components/common/ConfirmationAgreement.jsx

import React from "react";
import { Dialog, DialogPanel, Title, Text, Button } from "@tremor/react";
import { FiCheckCircle, FiInfo, FiX } from "react-icons/fi";

/**
 * ConfirmationAgreement
 * Digunakan untuk konfirmasi tindakan POSITIF (Bukan Hapus).
 * Contoh: Memulai ujian, Submit formulir, Menyetujui dokumen.
 */
export default function ConfirmationAgreement({ isOpen, onClose, onConfirm, title, message, confirmText = "Ya, Setuju", cancelText = "Batal", isLoading = false }) {
  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="z-[60]">
      <DialogPanel className="max-w-md w-full p-0 overflow-hidden rounded-2xl bg-white shadow-2xl transform transition-all m-4">
        {/* Header Visual: Gradient Biru/Indigo (Optimis) */}
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-6 text-center relative overflow-hidden">
          {/* Dekorasi Background */}
          <div className="absolute top-[-20px] left-[-20px] w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none"></div>
          <div className="absolute bottom-[-10px] right-[-10px] w-20 h-20 bg-white/20 rounded-full blur-xl pointer-events-none"></div>

          {/* Icon Besar */}
          <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 shadow-inner">
            <FiCheckCircle className="text-white text-3xl" />
          </div>

          <Title className="text-white text-xl font-bold tracking-tight relative z-10">{title || "Konfirmasi Tindakan"}</Title>
        </div>

        {/* Body Content */}
        <div className="p-6 text-center">
          <div className="text-slate-600 text-sm leading-relaxed">{message || "Apakah Anda yakin ingin melanjutkan tindakan ini?"}</div>

          {/* Alert Kecil (Optional decoration) */}
          <div className="mt-4 bg-indigo-50 text-indigo-700 text-xs px-3 py-2 rounded-lg border border-indigo-100 flex items-start gap-2 text-left">
            <FiInfo className="shrink-0 mt-0.5" />
            <span>Pastikan data yang dipilih sudah benar sebelum melanjutkan.</span>
          </div>
        </div>

        {/* Footer Actions - UPDATE DISINI */}
        {/* Kita perbesar padding jadi p-6 biar shadow gak kepotong */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button variant="secondary" color="rose" onClick={onClose} disabled={isLoading} className="w-full sm:flex-1 py-2.5 rounded-md">
            {cancelText}
          </Button>
          <Button variant="primary" color="indigo" onClick={onConfirm} loading={isLoading} icon={FiCheckCircle} className="text-white w-full sm:flex-1 shadow-lg shadow-indigo-200 py-2.5 rounded-md hover:bg-indigo-600 hover:text-white">
            {confirmText}
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
