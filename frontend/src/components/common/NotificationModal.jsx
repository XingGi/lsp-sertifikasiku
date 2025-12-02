// frontend/src/components/common/NotificationModal.jsx
import React from "react";
import { Dialog, DialogPanel, Title, Text, Button, Icon } from "@tremor/react";
import { FiLock, FiX } from "react-icons/fi"; // FiLock cocok untuk kuota

function NotificationModal({ isOpen, onClose, title, message }) {
  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="z-[100]">
      <DialogPanel className="max-w-md p-0 overflow-hidden">
        {/* Header dengan Ikon */}
        <div className="flex flex-col items-center justify-center p-6 bg-blue-50 border-b border-blue-200">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <FiLock className="w-6 h-6 text-blue-600" />
          </div>
          <Title className="text-xl text-slate-800">{title}</Title>
        </div>

        {/* Konten Pesan */}
        <div className="p-6 text-center">
          <Text className="text-tremor-content leading-relaxed">{message}</Text>
        </div>

        {/* Tombol Aksi */}
        <div className="p-4 bg-slate-50 border-t flex justify-center">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Mengerti
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default NotificationModal;
