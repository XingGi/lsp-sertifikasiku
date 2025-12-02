// frontend/src/features/risk-management/madya/components/ImageViewModal.jsx
import React from "react";
import { Dialog, DialogPanel, Button } from "@tremor/react";
import { FiX } from "react-icons/fi";

function ImageViewModal({ isOpen, onClose, imageUrl }) {
  if (!isOpen || !imageUrl) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} size="3xl">
      {" "}
      {/* Ukuran bisa disesuaikan */}
      <DialogPanel>
        <div className="flex justify-end mb-2">
          <Button icon={FiX} variant="light" onClick={onClose} />
        </div>
        <img
          src={imageUrl}
          alt="Struktur Organisasi"
          className="max-w-full max-h-[75vh] object-contain mx-auto rounded" // Batasi tinggi & pusatkan
        />
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Tutup</Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default ImageViewModal;
