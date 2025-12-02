// frontend/src/features/risk-ai/components/EditRiskItemSidebar.jsx

import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogPanel, Title, Text, TextInput, Textarea, Select, SelectItem, NumberInput, Badge } from "@tremor/react";
import { FiX, FiEdit3, FiActivity, FiShield, FiTrendingUp, FiTarget } from "react-icons/fi";
import { toast } from "sonner";

// Helper Kalkulasi Risk Level
const getLevelInfo = (likelihood, impact) => {
  const level = (likelihood || 0) * (impact || 0);
  if (level >= 15) return { text: "5 - High", color: "red", bg: "bg-red-100", textClass: "text-red-700" };
  if (level >= 8) return { text: "4 - Moderate to High", color: "orange", bg: "bg-orange-100", textClass: "text-orange-700" };
  if (level >= 4) return { text: "3 - Moderate", color: "yellow", bg: "bg-yellow-100", textClass: "text-yellow-700" };
  if (level >= 2) return { text: "2 - Low to Moderate", color: "lime", bg: "bg-lime-100", textClass: "text-lime-700" };
  if (level > 0) return { text: "1 - Low", color: "emerald", bg: "bg-emerald-100", textClass: "text-emerald-700" };
  return { text: "N/A", color: "slate", bg: "bg-slate-100", textClass: "text-slate-600" };
};

function EditRiskItemSidebar({ risk, isOpen, onClose, onSave }) {
  const [editedRisk, setEditedRisk] = useState(risk);

  useEffect(() => {
    setEditedRisk(risk);
  }, [risk]);

  if (!isOpen || !editedRisk) return null;

  const handleChange = (e) => setEditedRisk((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleValueChange = (name, value) => {
    const numericValue = value === "" ? null : Number(value);
    setEditedRisk((prev) => ({ ...prev, [name]: numericValue }));
  };

  const handleSave = async () => {
    try {
      onSave(editedRisk);
      onClose();
    } catch (error) {
      toast.error("Gagal Menyimpan Perubahan");
    }
  };

  const inherentRiskInfo = getLevelInfo(editedRisk.inherent_likelihood, editedRisk.inherent_impact);
  const residualRiskInfo = getLevelInfo(editedRisk.residual_likelihood, editedRisk.residual_impact);

  return (
    <Dialog open={isOpen} onClose={onClose} static={true}>
      {/* PERBAIKAN STRUKTUR UTAMA: Flex Column */}
      <DialogPanel className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl border-l border-gray-200 transition-transform duration-300 transform translate-x-0 flex flex-col">
        {/* 1. HEADER (Fixed di atas, tidak ikut scroll) */}
        <div className="flex-none bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
              <FiEdit3 size={20} />
            </div>
            <div>
              <Title className="text-lg font-bold text-slate-800">Edit Detail Risiko</Title>
              <Text className="text-xs text-gray-500 font-mono">{editedRisk.kode_risiko || "New Risk"}</Text>
            </div>
          </div>
          <Button icon={FiX} variant="light" color="slate" onClick={onClose} className="rounded-full p-2 hover:bg-slate-100" />
        </div>

        {/* 2. KONTEN FORM (Scrollable Area) - padding bottom aman karena footer di luar */}
        <div className="flex-1 overflow-y-auto p-1 space-y-8">
          {/* Basic Info */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <FiActivity className="text-blue-500" />
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Informasi Dasar</h3>
            </div>
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Risk Title</label>
                <TextInput name="title" value={editedRisk.title || ""} onChange={handleChange} placeholder="Judul singkat risiko..." />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Risk Description</label>
                <Textarea name="deskripsi_risiko" value={editedRisk.deskripsi_risiko || ""} onChange={handleChange} rows={3} placeholder="Deskripsikan risiko secara detail..." />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Objective / Sasaran</label>
                <Textarea name="objective" value={editedRisk.objective || ""} onChange={handleChange} rows={2} placeholder="Sasaran yang terdampak..." />
              </div>
            </div>
          </section>

          {/* Risk Analysis */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <FiTrendingUp className="text-purple-500" />
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Analisis Risiko</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Penyebab (Cause)</label>
                <Textarea name="risk_causes" value={editedRisk.risk_causes || ""} onChange={handleChange} rows={3} className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Dampak (Impact)</label>
                <Textarea name="risk_impacts" value={editedRisk.risk_impacts || ""} onChange={handleChange} rows={3} className="text-sm" />
              </div>
            </div>
          </section>

          {/* Inherent Risk Assessment */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Penilaian Risiko Inheren
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Likelihood (1-5)</label>
                <NumberInput name="inherent_likelihood" value={editedRisk.inherent_likelihood || ""} onValueChange={(val) => handleValueChange("inherent_likelihood", val)} min={1} max={5} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Impact (1-5)</label>
                <NumberInput name="inherent_impact" value={editedRisk.inherent_impact || ""} onValueChange={(val) => handleValueChange("inherent_impact", val)} min={1} max={5} />
              </div>
              <div className="sm:text-center pt-2 sm:pt-0">
                <label className="text-xs font-medium text-gray-400 mb-1 block">Risk Level</label>
                <div className={`py-2 px-3 rounded-lg font-bold text-sm border ${inherentRiskInfo.bg} border-${inherentRiskInfo.color}-200 ${inherentRiskInfo.textClass} text-center`}>{inherentRiskInfo.text}</div>
              </div>
            </div>
          </div>

          {/* 4. CONTROLS & MITIGATION (PERBAIKAN LAYOUT AGAR TIDAK DEMPET) */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <FiShield className="text-emerald-500" />
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Kontrol & Mitigasi</h3>
            </div>

            <div className="grid gap-6">
              {/* Menggunakan Grid yang berubah jadi 1 kolom saat sempit, 2 kolom saat lega */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full">
                  <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Kontrol Saat Ini</label>
                  <Textarea name="existing_controls" value={editedRisk.existing_controls || ""} onChange={handleChange} rows={3} placeholder="Kontrol yang sudah ada..." />
                </div>
                <div className="w-full">
                  <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Efektivitas Kontrol</label>
                  <Select name="control_effectiveness" value={editedRisk.control_effectiveness || ""} onValueChange={(val) => handleValueChange("control_effectiveness", val)}>
                    <SelectItem value="Not Effective">Not Effective</SelectItem>
                    <SelectItem value="Partially Effective">Partially Effective</SelectItem>
                    <SelectItem value="Fully Effective">Fully Effective</SelectItem>
                  </Select>
                </div>
              </div>

              {/* Rencana Mitigasi: Stack vertikal di layar kecil/zoom, Horizontal di layar besar */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Rencana Mitigasi (Treatment)</label>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <div className="w-full sm:w-1/3">
                    <TextInput value="Reduce" disabled className="bg-gray-50 text-center font-semibold text-gray-600" placeholder="Opsi" />
                  </div>
                  <div className="w-full sm:w-2/3">
                    <Textarea name="mitigation_plan" value={editedRisk.mitigation_plan || ""} onChange={handleChange} rows={3} placeholder="Jelaskan langkah perbaikan..." />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Residual Risk */}
          <div className="bg-orange-50 p-5 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-orange-800 flex items-center gap-2">
                <FiTarget size={14} /> Target Risiko Residual
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
              <div>
                <label className="text-xs font-medium text-orange-700 mb-1 block">Target Likelihood</label>
                <NumberInput name="residual_likelihood" value={editedRisk.residual_likelihood || ""} onValueChange={(val) => handleValueChange("residual_likelihood", val)} min={1} max={5} />
              </div>
              <div>
                <label className="text-xs font-medium text-orange-700 mb-1 block">Target Impact</label>
                <NumberInput name="residual_impact" value={editedRisk.residual_impact || ""} onValueChange={(val) => handleValueChange("residual_impact", val)} min={1} max={5} />
              </div>
              <div className="sm:text-center pt-2 sm:pt-0">
                <label className="text-xs font-medium text-orange-400 mb-1 block">Residual Level</label>
                <div className={`py-2 px-3 rounded-lg font-bold text-sm border ${residualRiskInfo.bg} border-${residualRiskInfo.color}-200 ${residualRiskInfo.textClass} text-center`}>{residualRiskInfo.text}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. FOOTER (Fixed di bawah, di luar area scroll) */}
        <div className="flex-none bg-white border-t border-gray-200 p-4 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <Button variant="secondary" className="shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all rounded-xl" color="slate" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave} className="shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all rounded-xl">
            Simpan Perubahan
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default EditRiskItemSidebar;
