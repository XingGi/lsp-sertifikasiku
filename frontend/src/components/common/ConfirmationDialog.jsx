// frontend/src/components/common/ConfirmationDialog.jsx
import React from "react";
import { Dialog, DialogPanel, Title, Text, Button, Icon } from "@tremor/react";
import { FiAlertTriangle } from "react-icons/fi";

function ConfirmationDialog({ isOpen, onClose, onConfirm, title, message, isLoading = false, confirmButtonText = "Hapus", confirmButtonColor = "red" }) {
  return (
    <Dialog open={isOpen} onClose={() => !isLoading && onClose()} static={true} className="z-[100]">
      <DialogPanel className="max-w-md">
        <div className="text-center">
          <Icon icon={FiAlertTriangle} size="lg" variant="light" className="mb-4" color={confirmButtonColor} />
          <Title>{title}</Title>
          <Text className="mt-2">{message}</Text>
        </div>
        <div className="mt-8 flex justify-end gap-2">
          <Button variant="secondary" className="rounded-md" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={onConfirm} loading={isLoading} disabled={isLoading} className="rounded-md" color={confirmButtonColor}>
            {confirmButtonText}
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default ConfirmationDialog;
