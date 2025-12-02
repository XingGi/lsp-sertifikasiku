// frontend/src/features/bpr/components/CreateBPRModal.jsx

import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, Title, TextInput, Select, SelectItem, Button, Text } from "@tremor/react";
import { FiSave, FiX, FiPlus, FiFileText, FiBriefcase, FiClock } from "react-icons/fi";
import apiClient from "../../../../api/api";
import { toast } from "sonner";

export default function CreateBPRModal({ isOpen, onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState({ name: "", department_id: "", period: "2025-Q1" });
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Gunakan endpoint list yang ringan jika ada, atau tetap yang ini
      apiClient
        .get("/admin/departments-list")
        .then((res) => setDepartments(res.data))
        .catch(() => setDepartments([]));
      setFormData({ name: "", department_id: "", period: "2025-Q1" });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.post("/bpr/documents", formData);
      toast.success("Dokumen BPR berhasil dibuat.");
      onSaveSuccess();
      onClose();
    } catch (error) {
      toast.error("Gagal membuat BPR.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => !isLoading && onClose()} static={true}>
      <DialogPanel className="max-w-lg p-0 overflow-hidden rounded-xl bg-white shadow-xl transform transition-all">
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm border border-blue-100">
              <FiPlus size={22} />
            </div>
            <div>
              <Title className="text-xl text-slate-800 font-bold">Proses Bisnis Baru</Title>
              <Text className="text-xs text-gray-500 mt-0.5">Mulai pemetaan proses baru.</Text>
            </div>
          </div>
          <Button icon={FiX} variant="light" color="slate" onClick={onClose} disabled={isLoading} className="rounded-full hover:bg-gray-200 p-2" />
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <div className="flex items-center gap-1.5">
                <FiFileText /> Nama Proses
              </div>
            </label>
            <TextInput placeholder="Contoh: Rekrutmen Karyawan" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <div className="flex items-center gap-1.5">
                <FiBriefcase /> Departemen Pemilik
              </div>
            </label>
            <Select value={String(formData.department_id)} onValueChange={(val) => setFormData({ ...formData, department_id: val })} placeholder="Pilih Departemen..." required>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={String(dept.id)}>
                  {dept.name}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <div className="flex items-center gap-1.5">
                <FiClock /> Periode
              </div>
            </label>
            <TextInput value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })} required />
          </div>

          {/* FOOTER (Inside Form for submit) */}
          <div className="pt-6 mt-2 flex justify-end gap-3 border-t border-gray-100">
            <Button variant="secondary" className="text-white bg-rose-300 hover:bg-rose-500 rounded-md" color="slate" onClick={onClose} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" loading={isLoading} icon={FiSave} className="text-white bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700 rounded-md">
              Buat Proses
            </Button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
