// frontend/src/features/risk-management/basic/components/BasicAnalysisModal.jsx

import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, Title, Text, Select, SelectItem, NumberInput, TextInput, Button, Card, Accordion, AccordionHeader, AccordionBody, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from "@tremor/react";
import { FiBarChart2, FiX, FiSave, FiTarget, FiInfo } from "react-icons/fi";
import { toast } from "sonner";

const initialAnalysisState = { risk_identification_id: "", probabilitas: 1, dampak: 1, probabilitas_kualitatif: 0, dampak_finansial: 0 };

// Helper internal untuk formatting rupiah
const parseCurrency = (val) => Number(String(val).replace(/[^0-9]/g, ""));
const formatCurrency = (val) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val || 0);

// --- DATA REFERENSI ---
const PROBABILITY_REFERENCE = [
  { level: 5, label: "Hampir Pasti", desc: "> 90% kemungkinan terjadi dalam 1 tahun" },
  { level: 4, label: "Sangat Mungkin", desc: "60% - 90% kemungkinan terjadi" },
  { level: 3, label: "Mungkin", desc: "40% - 60% kemungkinan terjadi" },
  { level: 2, label: "Jarang", desc: "10% - 40% kemungkinan terjadi" },
  { level: 1, label: "Sangat Jarang", desc: "< 10% kemungkinan terjadi" },
];

export default function BasicAnalysisModal({ isOpen, onClose, onSave, initialData, availableRisks }) {
  const [analysisData, setAnalysisData] = useState(initialAnalysisState);

  useEffect(() => {
    if (isOpen) {
      setAnalysisData(initialData || initialAnalysisState);
    }
  }, [isOpen, initialData]);

  const handleChange = (name, value) => {
    setAnalysisData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (analysisData.risk_identification_id === "" || analysisData.risk_identification_id === null || analysisData.risk_identification_id === undefined) {
      toast.error("Pilih risiko terlebih dahulu.");
      return;
    }
    if (analysisData.probabilitas_kualitatif <= 0) {
      toast.error("Probabilitas (%) tidak boleh 0.");
      return;
    }
    onSave(analysisData);
    onClose();
  };

  // Hitung nilai bersih real-time untuk preview
  const nilaiBersih = (analysisData.dampak_finansial || 0) * ((analysisData.probabilitas_kualitatif || 0) / 100);
  const skorRisiko = (analysisData.probabilitas || 0) * (analysisData.dampak || 0);

  return (
    <Dialog open={isOpen} onClose={onClose} static={true}>
      <DialogPanel className="max-w-3xl p-0 overflow-hidden rounded-xl bg-white shadow-xl">
        {" "}
        {/* Lebar ditambah jadi max-w-3xl */}
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm border border-emerald-100">
              <FiBarChart2 size={22} />
            </div>
            <div>
              <Title className="text-xl text-slate-800 font-bold">Analisis Risiko</Title>
              <Text className="text-xs text-gray-500 mt-0.5">Hitung skor dan nilai eksposur risiko.</Text>
            </div>
          </div>
          <Button icon={FiX} variant="light" color="slate" onClick={onClose} className="rounded-full hover:bg-gray-200 p-2" />
        </div>
        {/* Body */}
        <div className="p-8 space-y-6 bg-slate-50/30 max-h-[75vh] overflow-y-auto">
          {/* Pilih Risiko */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Pilih Risiko</label>
            <Select value={String(analysisData.risk_identification_id)} onValueChange={(val) => handleChange("risk_identification_id", Number(val))}>
              {availableRisks.map((risk) => (
                <SelectItem key={risk.originalIndex} value={String(risk.originalIndex)}>
                  {risk.deskripsi_risiko}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* KOLOM KIRI: INPUT */}
            <div className="space-y-6">
              {/* Skor Kuantitatif */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
                <div className="pb-2 border-b border-gray-100">
                  <Text className="text-xs font-bold text-gray-400 uppercase">Skoring Matriks</Text>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Probabilitas (1-5)</label>
                    <NumberInput value={analysisData.probabilitas} onValueChange={(val) => handleChange("probabilitas", val)} min={1} max={5} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Dampak (1-5)</label>
                    <NumberInput value={analysisData.dampak} onValueChange={(val) => handleChange("dampak", val)} min={1} max={5} />
                  </div>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">Total Skor</span>
                  <span className={`text-lg font-bold ${skorRisiko >= 15 ? "text-red-600" : skorRisiko >= 8 ? "text-orange-500" : "text-green-600"}`}>{skorRisiko}</span>
                </div>
              </div>

              {/* Dampak Finansial */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
                <div className="pb-2 border-b border-gray-100">
                  <Text className="text-xs font-bold text-gray-400 uppercase">Analisis Finansial</Text>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Probabilitas (%)</label>
                  <NumberInput
                    value={analysisData.probabilitas_kualitatif}
                    onValueChange={(val) => {
                      const safeVal = val === undefined || val === null ? 0 : val;
                      handleChange("probabilitas_kualitatif", Math.min(100, Math.max(0, safeVal)));
                    }}
                    min={0}
                    max={100}
                    icon={() => <span className="text-gray-400 text-xs ml-2">%</span>}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Dampak Finansial</label>
                  <TextInput
                    value={analysisData.dampak_finansial?.toLocaleString("id-ID")}
                    onChange={(e) => handleChange("dampak_finansial", parseCurrency(e.target.value))}
                    placeholder="1.000.000"
                    icon={() => <span className="text-gray-400 text-xs ml-2">Rp</span>}
                  />
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: REFERENSI (BARU) */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 h-full">
                <div className="flex items-center gap-2 mb-3 text-blue-700">
                  <FiInfo size={16} />
                  <Text className="font-bold text-sm">Referensi Probabilitas</Text>
                </div>
                <div className="space-y-6 mt-5">
                  {PROBABILITY_REFERENCE.map((ref) => (
                    <div key={ref.level} className="flex items-start gap-2 bg-white p-2 rounded border border-blue-100/50 text-xs">
                      <span className="font-bold text-blue-600 min-w-[20px] text-center bg-blue-50 rounded">{ref.level}</span>
                      <div>
                        <div className="font-semibold text-slate-700">{ref.label}</div>
                        <div className="text-slate-500 text-[10px]">{ref.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Result Preview */}
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex justify-between items-center mt-6">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <FiTarget /> Nilai Bersih Risiko (Net Risk)
            </div>
            <Text className="font-mono font-bold text-xl text-emerald-800">{formatCurrency(nilaiBersih)}</Text>
          </div>
        </div>
        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" className="rounded-md" color="rose" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave} className="text-white bg-emerald-600 border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700 shadow-lg shadow-emerald-100 rounded-md">
            Simpan Analisis
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
