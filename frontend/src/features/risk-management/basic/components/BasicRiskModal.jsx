// frontend/src/features/risk-management/basic/components/BasicRiskModal.jsx

import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, Title, TextInput, Textarea, Select, SelectItem, Button, Text } from "@tremor/react";
import { FiAlertTriangle, FiTarget, FiFileText, FiCalendar, FiShield, FiActivity, FiX, FiSave } from "react-icons/fi";
import { toast } from "sonner";

const initialRiskState = {
  kode_risiko: "",
  kategori_risiko: "",
  unit_kerja: "",
  sasaran: "",
  tanggal_identifikasi: new Date().toISOString().split("T")[0],
  deskripsi_risiko: "",
  akar_penyebab: "",
  indikator_risiko: "",
  internal_control: "",
  deskripsi_dampak: "",
};

export default function BasicRiskModal({ isOpen, onClose, onSave, initialData }) {
  const [riskData, setRiskData] = useState(initialRiskState);

  useEffect(() => {
    if (isOpen) {
      setRiskData(initialData || initialRiskState);
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    setRiskData({ ...riskData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (val) => {
    setRiskData({ ...riskData, kategori_risiko: val });
  };

  const handleSave = () => {
    if (!riskData.kategori_risiko || !riskData.unit_kerja || !riskData.deskripsi_risiko) {
      toast.error("Kategori, Unit Kerja, dan Deskripsi wajib diisi.");
      return;
    }
    onSave(riskData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} static={true}>
      <DialogPanel className="max-w-4xl p-0 overflow-hidden rounded-xl bg-white shadow-xl transform transition-all">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shadow-sm border border-rose-100">
              <FiAlertTriangle size={22} />
            </div>
            <div>
              <Title className="text-xl text-slate-800 font-bold">Identifikasi Risiko</Title>
              <Text className="text-xs text-gray-500 mt-0.5">Detail risiko, penyebab, dan dampaknya.</Text>
            </div>
          </div>
          <Button icon={FiX} variant="light" color="slate" onClick={onClose} className="rounded-full hover:bg-gray-200 p-2" />
        </div>

        {/* Body Form */}
        <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto bg-slate-50/30">
          {/* Info Dasar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Kode Risiko</label>
              <TextInput name="kode_risiko" value={riskData.kode_risiko} onChange={handleChange} placeholder="Otomatis / Manual" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tanggal Identifikasi</label>
              <TextInput type="date" name="tanggal_identifikasi" value={riskData.tanggal_identifikasi} onChange={handleChange} icon={FiCalendar} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Unit Kerja *</label>
              <TextInput name="unit_kerja" value={riskData.unit_kerja} onChange={handleChange} required placeholder="Nama Unit..." />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Kategori Risiko *</label>
              <Select value={riskData.kategori_risiko} onValueChange={handleSelectChange} placeholder="Pilih Kategori...">
                <SelectItem value="Strategis">Strategis</SelectItem>
                <SelectItem value="Operasional">Operasional</SelectItem>
                <SelectItem value="Keuangan">Keuangan</SelectItem>
                <SelectItem value="Kepatuhan">Kepatuhan</SelectItem>
                <SelectItem value="Reputasi">Reputasi</SelectItem>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-1">
                <FiTarget /> Sasaran
              </label>
              <TextInput name="sasaran" value={riskData.sasaran} onChange={handleChange} placeholder="Sasaran strategis yang terganggu..." />
            </div>
          </div>

          {/* Detail Risiko */}
          <div className="space-y-6 pt-6 border-t border-gray-100">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-1">
                <FiFileText /> Deskripsi Risiko *
              </label>
              <Textarea name="deskripsi_risiko" value={riskData.deskripsi_risiko} onChange={handleChange} required rows={3} placeholder="Jelaskan kejadian risiko..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Akar Penyebab</label>
                <Textarea name="akar_penyebab" value={riskData.akar_penyebab} onChange={handleChange} rows={3} placeholder="Mengapa ini terjadi?" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Deskripsi Dampak</label>
                <Textarea name="deskripsi_dampak" value={riskData.deskripsi_dampak} onChange={handleChange} rows={3} placeholder="Akibat yang ditimbulkan..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-1">
                  <FiActivity /> Indikator Risiko
                </label>
                <Textarea name="indikator_risiko" value={riskData.indikator_risiko} onChange={handleChange} rows={2} placeholder="Tanda-tanda awal..." />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-1">
                  <FiShield /> Kontrol Internal Saat Ini
                </label>
                <Textarea name="internal_control" value={riskData.internal_control} onChange={handleChange} rows={2} placeholder="Pengendalian yang sudah ada..." />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" className="rounded-md" color="rose" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave} icon={FiSave} className="text-white bg-rose-600 border-rose-600 hover:bg-rose-700 hover:border-rose-700 shadow-lg shadow-rose-100 rounded-md">
            Simpan Risiko
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
