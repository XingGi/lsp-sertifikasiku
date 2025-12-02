// frontend/src/features/risk-management/madya/components/StrukturOrganisasiFormModal.jsx

import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, Title, Text, Button, TextInput } from "@tremor/react";
import apiClient from "../../../../api/api";
import { FiBriefcase, FiLayers, FiMapPin, FiSave, FiX, FiEdit, FiPlus } from "react-icons/fi";

function StrukturOrganisasiFormModal({ isOpen, onClose, assessmentId, onSaveSuccess, initialData = null }) {
  const [formData, setFormData] = useState({ direktorat: "", divisi: "", unit_kerja: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        direktorat: initialData.direktorat || "",
        divisi: initialData.divisi || "",
        unit_kerja: initialData.unit_kerja || "",
      });
    } else {
      setFormData({ direktorat: "", divisi: "", unit_kerja: "" });
    }
  }, [initialData, isEditMode, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const payload = { ...formData };

    try {
      let response;
      if (isEditMode) {
        response = await apiClient.put(`/structure-entries/${initialData.id}`, payload);
      } else {
        response = await apiClient.post(`/madya-assessments/${assessmentId}/structure-entries`, payload);
      }

      onSaveSuccess(response.data.entry, isEditMode);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.msg || `Gagal ${isEditMode ? "memperbarui" : "menyimpan"} data.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} static={true}>
      <DialogPanel className="max-w-lg p-0 overflow-hidden rounded-xl bg-white shadow-xl transform transition-all">
        {/* --- HEADER --- */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl shadow-sm border ${isEditMode ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}>{isEditMode ? <FiEdit size={22} /> : <FiPlus size={22} />}</div>
            <div>
              <Title className="text-xl text-slate-800 font-bold">{isEditMode ? "Edit Struktur" : "Tambah Struktur"}</Title>
              <Text className="text-xs text-gray-500 mt-0.5">{isEditMode ? "Perbarui detail unit organisasi." : "Definisikan hierarki organisasi baru."}</Text>
            </div>
          </div>
          <Button icon={FiX} variant="light" color="slate" onClick={handleClose} disabled={isLoading} className="rounded-full hover:bg-gray-200 p-2" />
        </div>

        {/* --- BODY FORM --- */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs text-center">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <div className="flex items-center gap-1.5">
                <FiBriefcase size={14} /> Direktorat
              </div>
            </label>
            <TextInput name="direktorat" value={formData.direktorat} onChange={handleChange} placeholder="Contoh: Direktorat Keuangan" className="hover:shadow-sm transition-shadow" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <div className="flex items-center gap-1.5">
                <FiLayers size={14} /> Divisi
              </div>
            </label>
            <TextInput name="divisi" value={formData.divisi} onChange={handleChange} placeholder="Contoh: Divisi Akuntansi" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <div className="flex items-center gap-1.5">
                <FiMapPin size={14} /> Unit Kerja / Departemen
              </div>
            </label>
            <TextInput name="unit_kerja" value={formData.unit_kerja} onChange={handleChange} placeholder="Contoh: Bagian Pajak" />
          </div>

          {/* --- FOOTER (Inside Form for Submit) --- */}
          <div className="pt-6 mt-2 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="secondary" className="rounded-md" color="rose" onClick={handleClose} type="button" disabled={isLoading}>
              Batal
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              icon={FiSave}
              className={`shadow-lg border-transparent ${isEditMode ? "text-white bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 rounded-md" : "text-white bg-blue-600 hover:bg-blue-700 shadow-blue-200 rounded-md"}`}
            >
              {isEditMode ? "Simpan Perubahan" : "Simpan Data"}
            </Button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}

export default StrukturOrganisasiFormModal;
