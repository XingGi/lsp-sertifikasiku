// frontend/src/features/risk-management/madya/components/SasaranKPIAppetiteCard.jsx
import React, { useState, useEffect } from "react";
import { Card, Title, Text, Button, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Textarea, Dialog, DialogPanel, Select, SelectItem } from "@tremor/react";
import { FiPlus, FiTrash2, FiSave, FiX, FiTarget, FiEdit3 } from "react-icons/fi";
import apiClient from "../../../../api/api";
import { toast } from "sonner";

function SasaranFormModal({ isOpen, onClose, onSave, initialText = "" }) {
  const [sasaranText, setSasaranText] = useState(initialText);
  useEffect(() => {
    if (isOpen) setSasaranText(initialText);
  }, [isOpen, initialText]);
  const handleSave = () => {
    if (sasaranText.trim()) onSave(sasaranText);
    else alert("Sasaran/KPI tidak boleh kosong.");
  };
  return (
    <Dialog open={isOpen} onClose={onClose} static={true}>
      <DialogPanel className="max-w-xl p-0 overflow-hidden rounded-xl bg-white shadow-xl transform transition-all">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl shadow-sm border border-orange-100">
              <FiTarget size={22} />
            </div>
            <div>
              <Title className="text-xl text-slate-800 font-bold">Tambah Sasaran</Title>
              <Text className="text-xs text-gray-500 mt-0.5">Tetapkan target KPI atau sasaran organisasi.</Text>
            </div>
          </div>
          <Button icon={FiX} variant="light" color="slate" onClick={onClose} className="rounded-full hover:bg-gray-200 p-2" />
        </div>

        {/* Body */}
        <div className="p-8 bg-white">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            <div className="flex items-center gap-1.5">
              <FiEdit3 size={14} /> Deskripsi Sasaran / KPI <span className="text-red-500">*</span>
            </div>
          </label>
          <Textarea value={sasaranText} onChange={(e) => setSasaranText(e.target.value)} placeholder="Contoh: Meningkatkan kepuasan pelanggan sebesar 10%..." rows={5} className="text-sm shadow-sm" required />
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" className="rounded-md" color="rose" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave} icon={FiSave} className="text-white bg-orange-600 border-orange-600 hover:bg-orange-700 hover:border-orange-700 shadow-lg shadow-orange-100 rounded-md">
            Simpan
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

function SasaranKPIAppetiteCard({ assessmentId, initialData: sasaranEntries = [], onSasaranChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingTargetId, setUpdatingTargetId] = useState(null);

  const handleAddSasaran = async (sasaranText) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(`/madya-assessments/${assessmentId}/sasaran-kpi`, { sasaran_kpi: sasaranText });
      setIsModalOpen(false);
      if (onSasaranChange) onSasaranChange(response.data.entry, "add");
    } catch (error) {
      toast.error("Gagal menambahkan Sasaran/KPI");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSasaran = async (sasaranId) => {
    if (window.confirm("Hapus sasaran/KPI ini?")) {
      setIsLoading(true);
      try {
        await apiClient.delete(`/sasaran-kpi/${sasaranId}`);
        if (onSasaranChange) onSasaranChange({ id: sasaranId }, "delete");
      } catch (error) {
        toast.error("Gagal menghapus Sasaran/KPI");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTargetLevelChange = async (sasaranId, newTargetLevel) => {
    setUpdatingTargetId(sasaranId);
    try {
      const response = await apiClient.put(`/sasaran-kpi/${sasaranId}/target`, { target_level: newTargetLevel });
      if (onSasaranChange) onSasaranChange(response.data.entry, "update");
    } catch (error) {
      toast.error("Gagal update Target Level");
    } finally {
      setUpdatingTargetId(null);
    }
  };

  const getCellColor = (score) => {
    if (score === null || score === undefined) return "bg-gray-200 text-gray-500";
    if (score >= 20) return "bg-red-600 text-white";
    if (score >= 16) return "bg-orange-500 text-white";
    if (score >= 12) return "bg-yellow-400 text-black";
    if (score >= 6) return "bg-lime-400 text-black";
    if (score >= 1) return "bg-green-500 text-white";
    return "bg-gray-200 text-gray-500";
  };

  const riskLegend = [
    { code: "R", text: "Low/Rare (1 - 5)", colorClass: "bg-green-500 text-white" },
    { code: "L", text: "Low to Moderate/Low (6 - 11)", colorClass: "bg-lime-400 text-black" },
    { code: "M", text: "Moderate (12 - 15)", colorClass: "bg-yellow-400 text-black" },
    { code: "H", text: "Moderate to High/High (16 - 19)", colorClass: "bg-orange-500 text-white" },
    { code: "E", text: "High/Extreme (20 - 25)", colorClass: "bg-red-600 text-white" },
  ];

  return (
    <>
      <Card className="border-l-4 border-orange-500 shadow-md ring-1 ring-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <FiTarget size={24} />
            </div>
            <div>
              <Title>3. Sasaran Organisasi / KPI</Title>
              <Text>Definisikan Sasaran/KPI dan target toleransi risikonya.</Text>
            </div>
          </div>
          <Button icon={FiPlus} onClick={() => setIsModalOpen(true)} loading={isLoading} variant="secondary" className="rounded-md hover:bg-orange-200 w-full sm:w-auto" color="orange">
            Tambah Sasaran
          </Button>
        </div>

        <Table className="mt-4">
          <TableHead className="text-sm">
            <TableRow className="border-b border-orange-200">
              <TableHeaderCell className="w-1/12 text-center bg-orange-50 text-orange-900">No</TableHeaderCell>
              <TableHeaderCell className="w-5/12 bg-orange-50 text-orange-900">Sasaran Organisasi / KPI</TableHeaderCell>
              <TableHeaderCell className="w-2/12 text-center bg-orange-50 text-orange-900">Target</TableHeaderCell>
              <TableHeaderCell className="w-2/12 text-center bg-orange-50 text-orange-900">Risiko Inheren</TableHeaderCell>
              <TableHeaderCell className="w-2/12 text-center bg-orange-50 text-orange-900">Risiko Residual</TableHeaderCell>
              <TableHeaderCell className="text-right bg-orange-50 text-orange-900">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody className="text-xs">
            {sasaranEntries && sasaranEntries.length > 0 ? (
              sasaranEntries.map((item, index) => {
                const inherentStyle = getCellColor(item.inherent_risk_score);
                const residualStyle = getCellColor(item.residual_risk_score);
                return (
                  <TableRow key={item.id} className="hover:bg-orange-50/20 transition-colors">
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell className="whitespace-normal">{item.sasaran_kpi}</TableCell>
                    <TableCell className="text-center">
                      <Select value={item.target_level || ""} onValueChange={(value) => handleTargetLevelChange(item.id, value)} disabled={updatingTargetId === item.id} className="w-24 mx-auto">
                        <SelectItem value="" className="italic text-gray-400">
                          - Pilih -
                        </SelectItem>
                        {riskLegend.map((level) => (
                          <SelectItem key={level.code} value={level.code} className={level.colorClass}>
                            {level.code}
                          </SelectItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell className={`text-center font-semibold ${inherentStyle}`}>{item.inherent_risk_score ?? "#N/A"}</TableCell>
                    <TableCell className={`text-center font-semibold ${residualStyle}`}>{item.residual_risk_score ?? "#N/A"}</TableCell>
                    <TableCell className="text-right">
                      <Button icon={FiTrash2} variant="light" color="red" onClick={() => handleDeleteSasaran(item.id)} loading={isLoading} size="xs" />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400 italic">
                  Belum ada Sasaran Organisasi / KPI yang ditambahkan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="mt-6 border-t border-gray-100 pt-4">
          <Text className="font-semibold mb-2 text-gray-600 text-xs uppercase tracking-wider">Keterangan Level Risiko:</Text>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {riskLegend.map((level) => (
              <div key={level.code} className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${level.colorClass}`}>{level.code}</span>
                <Text className="text-xs text-gray-600">{level.text}</Text>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <SasaranFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddSasaran} />
    </>
  );
}

export default SasaranKPIAppetiteCard;
