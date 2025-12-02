// frontend/src/features/risk-management/basic/components/BasicContextModal.jsx

import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, Title, Text, Textarea, Button } from "@tremor/react";
import { FiPlus, FiEdit, FiX, FiBriefcase, FiLayers } from "react-icons/fi";
import { toast } from "sonner";

export default function BasicContextModal({ isOpen, onClose, onSave, initialData }) {
  const [contextData, setContextData] = useState({ external: "", internal: "" });

  useEffect(() => {
    if (isOpen) {
      setContextData(initialData || { external: "", internal: "" });
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    setContextData({ ...contextData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!contextData.external || !contextData.internal) {
      toast.error("Konteks eksternal dan internal wajib diisi.");
      return;
    }
    onSave(contextData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} static={true}>
      <DialogPanel className="max-w-2xl p-0 overflow-hidden rounded-xl bg-white shadow-xl transform transition-all">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl shadow-sm border border-cyan-100">{initialData ? <FiEdit size={22} /> : <FiPlus size={22} />}</div>
            <div>
              <Title className="text-xl text-slate-800 font-bold">{initialData ? "Edit Konteks" : "Tambah Konteks"}</Title>
              <Text className="text-xs text-gray-500 mt-0.5">Definisikan faktor internal dan eksternal organisasi.</Text>
            </div>
          </div>
          <Button icon={FiX} variant="light" color="slate" onClick={onClose} className="rounded-full hover:bg-gray-200 p-2" />
        </div>

        {/* Body */}
        <div className="p-8 space-y-6 bg-slate-50/30">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <div className="flex items-center gap-1.5">
                <FiGlobe className="text-blue-500" /> Konteks Eksternal <span className="text-red-500">*</span>
              </div>
            </label>
            <Textarea name="external" value={contextData.external} onChange={handleChange} rows={4} placeholder="Faktor politik, ekonomi, sosial, teknologi..." className="text-sm" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <div className="flex items-center gap-1.5">
                <FiLayers className="text-emerald-500" /> Konteks Internal <span className="text-red-500">*</span>
              </div>
            </label>
            <Textarea name="internal" value={contextData.internal} onChange={handleChange} rows={4} placeholder="Budaya, struktur, sumber daya, kapabilitas..." className="text-sm" />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" className="rounded-md" color="rose" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave} className="text-white bg-cyan-600 border-cyan-600 hover:bg-cyan-700 hover:border-cyan-700 shadow-lg shadow-cyan-100 rounded-md">
            Simpan Konteks
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

import { FiGlobe } from "react-icons/fi"; // Tambahan import icon
