// frontend/src/features/risk-management/madya/components/RiskInputCard.jsx

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Card, Title, Text, Button, TextInput, Select, SelectItem, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge } from "@tremor/react";
import { FiPlus, FiEdit2, FiTrash2, FiList, FiMaximize, FiMinimize, FiFilter } from "react-icons/fi";
import apiClient from "../../../../api/api";
import RiskInputFormModal from "./RiskInputFormModal";

// Helper Format Currency
const formatCurrency = (value) => {
  if (!value) return "Rp 0";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
};

// Helper Format Date
const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" });
  } catch (e) {
    return "-";
  }
};

// Helper Risk Level Style
const getRiskLevelStyle = (score) => {
  if (score === null || score === undefined) return { text: "#N/A", colorClass: "bg-gray-200 text-gray-500" };
  if (score >= 20) return { text: String(score), colorClass: "bg-red-600 text-white" };
  if (score >= 16) return { text: String(score), colorClass: "bg-orange-500 text-white" };
  if (score >= 12) return { text: String(score), colorClass: "bg-yellow-400 text-black" };
  if (score >= 6) return { text: String(score), colorClass: "bg-lime-400 text-black" };
  if (score >= 1) return { text: String(score), colorClass: "bg-green-500 text-white" };
  return { text: "#N/A", colorClass: "bg-gray-200 text-gray-500" };
};

function RiskInputCard({ assessmentId, structureEntries = [], sasaranKPIEntries = [], templateScores = [], onRiskInputSaveSuccess, initialFilters, onFilterChange, initialRiskInputData = [], isDataLoading = false }) {
  const uniqueDirektorat = useMemo(() => [...new Set(structureEntries.map((e) => e.direktorat).filter(Boolean))], [structureEntries]);
  const uniqueDivisi = useMemo(() => [...new Set(structureEntries.map((e) => e.divisi).filter(Boolean))], [structureEntries]);
  const uniqueUnitKerja = useMemo(() => [...new Set(structureEntries.map((e) => e.unit_kerja).filter(Boolean))], [structureEntries]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRiskData, setEditingRiskData] = useState(null);
  const [sasaranOptions, setSasaranOptions] = useState([]);
  const riskInputEntries = initialRiskInputData;
  const isLoading = isDataLoading;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const validSasaranProps = Array.isArray(sasaranKPIEntries) ? sasaranKPIEntries : [];
    if (validSasaranProps.length > 0) setSasaranOptions(validSasaranProps.map((s) => ({ id: s.id, sasaran_kpi: s.sasaran_kpi })));
    else setSasaranOptions([]);
  }, [sasaranKPIEntries]);

  const filteredRiskInputs = useMemo(() => {
    return riskInputEntries.filter((risk) => {
      if (initialFilters.departemen && risk.unit_kerja !== initialFilters.departemen) return false;

      const structure = structureEntries.find((s) => s.unit_kerja === risk.unit_kerja);
      const filterOrg = initialFilters.organisasi ? initialFilters.organisasi.toLowerCase() : "";
      const filterDir = initialFilters.direktorat;
      const filterDiv = initialFilters.divisi;

      if (filterOrg || filterDir || filterDiv) {
        if (!structure) return false;
        if (filterOrg && !structure.organisasi?.toLowerCase().includes(filterOrg)) return false;
        if (filterDir && structure.direktorat !== filterDir) return false;
        if (filterDiv && structure.divisi !== filterDiv) return false;
      }
      return true;
    });
  }, [riskInputEntries, initialFilters, structureEntries]);

  const handleOpenAddModal = () => {
    setEditingRiskData(null);
    setIsModalOpen(true);
  };
  const handleOpenEditModal = (riskData) => {
    setEditingRiskData(riskData);
    setIsModalOpen(true);
  };
  const handleSaveRiskInput = (responseData, isUpdate) => {
    setIsModalOpen(false);
    if (onRiskInputSaveSuccess) onRiskInputSaveSuccess(responseData, isUpdate);
  };

  const handleDeleteRiskInput = async (riskInputId) => {
    if (window.confirm("Anda yakin ingin menghapus data risk input ini?")) {
      try {
        await apiClient.delete(`/risk-inputs/${riskInputId}`);
        if (onRiskInputSaveSuccess) onRiskInputSaveSuccess();
      } catch (error) {
        alert("Gagal menghapus data.");
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      cardRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else document.exitFullscreen();
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <>
      <Card className={`border-l-4 border-rose-500 shadow-md ring-1 ring-gray-100 bg-slate-50 ${isFullscreen ? "fixed inset-0 z-50 h-screen overflow-auto m-0 rounded-none" : "relative"}`} ref={cardRef}>
        {/* Header Card */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <FiList size={24} />
            </div>
            <div>
              <Title>4. Risk Input</Title>
              <Text>Identifikasi dan analisis detail risiko.</Text>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button icon={FiPlus} onClick={handleOpenAddModal} loading={isLoading} variant="secondary" className="rounded-md w-full sm:w-auto" color="rose">
              Tambah Risk Input
            </Button>
            <Button variant="light" icon={isFullscreen ? FiMinimize : FiMaximize} onClick={toggleFullscreen} />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border border-rose-100 rounded-xl bg-rose-50/30">
          <div className="col-span-1 md:col-span-4 flex items-center gap-2 text-rose-700 mb-1">
            <FiFilter size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Filter Data</span>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Organisasi</label>
            <TextInput value={initialFilters.organisasi || ""} onChange={(e) => onFilterChange("organisasi", e.target.value)} placeholder="Filter..." className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Direktorat</label>
            <Select value={initialFilters.direktorat || ""} onValueChange={(value) => onFilterChange("direktorat", value)} className="mt-1">
              <SelectItem value="">Semua</SelectItem>
              {uniqueDirektorat.map((dir) => (
                <SelectItem key={dir} value={dir}>
                  {dir}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Divisi</label>
            <Select value={initialFilters.divisi || ""} onValueChange={(value) => onFilterChange("divisi", value)} className="mt-1">
              <SelectItem value="">Semua</SelectItem>
              {uniqueDivisi.map((div) => (
                <SelectItem key={div} value={div}>
                  {div}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Departemen</label>
            <Select value={initialFilters.departemen || ""} onValueChange={(value) => onFilterChange("departemen", value)} className="mt-1">
              <SelectItem value="">Semua</SelectItem>
              {uniqueUnitKerja.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        {/* TABLE SCROLLABLE */}
        <div className="overflow-x-auto pb-2">
          <Table className="min-w-[5000px]">
            <TableHead className="text-sm">
              <TableRow className="border-b border-rose-200">
                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold w-12 sticky left-0 z-10 border-r border-rose-100">No</TableHeaderCell>

                {/* Identifikasi */}
                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold">Kode</TableHeaderCell>
                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold">Status</TableHeaderCell>
                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold">Kategori</TableHeaderCell>
                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold">Unit Kerja</TableHeaderCell>
                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold min-w-[200px]">Sasaran</TableHeaderCell>
                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold w-32">Tgl Identifikasi</TableHeaderCell>

                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold min-w-[300px]">Kejadian Risiko</TableHeaderCell>
                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold min-w-[250px]">Akar Penyebab</TableHeaderCell>
                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold min-w-[200px]">Indikator (KRI)</TableHeaderCell>
                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold min-w-[250px]">Kontrol Internal</TableHeaderCell>
                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold min-w-[250px]">Dampak</TableHeaderCell>

                {/* ANALISIS INHEREN (Biru) */}
                <TableHeaderCell className="bg-blue-100 text-blue-900 font-bold text-center border-l border-blue-200 w-16">P (In)</TableHeaderCell>
                <TableHeaderCell className="bg-blue-100 text-blue-900 font-bold text-center w-16">I (In)</TableHeaderCell>
                <TableHeaderCell className="bg-blue-100 text-blue-900 font-bold text-center w-20">Skor</TableHeaderCell>

                {/* Kolom Inheren Lengkap */}
                <TableHeaderCell className="bg-blue-100 text-blue-900 font-bold text-center w-24">Prob (%)</TableHeaderCell>
                <TableHeaderCell className="bg-blue-100 text-blue-900 font-bold text-center w-32">Dampak (Rp)</TableHeaderCell>
                <TableHeaderCell className="bg-blue-100 text-blue-900 font-bold text-center w-32">Nilai Bersih (In)</TableHeaderCell>

                {/* ANALISIS RESIDUAL (Oranye) */}
                <TableHeaderCell className="bg-orange-100 text-orange-900 font-bold text-center border-l border-orange-200 w-16">P (Res)</TableHeaderCell>
                <TableHeaderCell className="bg-orange-100 text-orange-900 font-bold text-center w-16">I (Res)</TableHeaderCell>
                <TableHeaderCell className="bg-orange-100 text-orange-900 font-bold text-center w-20">Skor</TableHeaderCell>

                {/* Kolom Residual Lengkap */}
                <TableHeaderCell className="bg-orange-100 text-orange-900 font-bold text-center w-24">Prob (%)</TableHeaderCell>
                <TableHeaderCell className="bg-orange-100 text-orange-900 font-bold text-center w-32">Dampak (Rp)</TableHeaderCell>
                <TableHeaderCell className="bg-orange-100 text-orange-900 font-bold text-center w-32">Nilai Bersih (Res)</TableHeaderCell>

                {/* Lainnya (Pemilik & Penanganan) */}
                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold min-w-[150px]">Pemilik Risiko</TableHeaderCell>
                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold min-w-[150px]">Jabatan</TableHeaderCell>
                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold min-w-[200px]">Kontak (HP/Email)</TableHeaderCell>

                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold min-w-[150px]">Strategi</TableHeaderCell>
                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold min-w-[300px]">Rencana Penanganan</TableHeaderCell>
                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold min-w-[150px]">Biaya Penanganan</TableHeaderCell>

                <TableHeaderCell className="bg-rose-50 text-rose-900 font-bold sticky right-0 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)] z-10 w-24 text-center">Aksi</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRiskInputs.length > 0 ? (
                filteredRiskInputs.map((item, index) => {
                  const inherentStyle = getRiskLevelStyle(item.inherent_skor);
                  const residualStyle = getRiskLevelStyle(item.residual_skor);
                  const sasaranLinked = sasaranOptions.find((s) => s.id === item.sasaran_id);

                  // Kalkulasi Nilai Bersih Inheren
                  const inherenNet = (item.inherent_dampak_finansial || 0) * ((item.inherent_prob_kualitatif || 0) / 100);
                  // Kalkulasi Nilai Bersih Residual (sesuai logic modal: Dampak Inheren * Prob Residual)
                  // Cek dulu apakah ada data residual_dampak_finansial langsung
                  let residualNet = 0;
                  if (item.residual_dampak_finansial) {
                    // Jika backend sudah menghitung
                    residualNet = (item.residual_dampak_finansial || 0) * ((item.residual_prob_kualitatif || 0) / 100);
                  } else {
                    // Fallback rumus manual (sama seperti di modal)
                    const dampakResidualHitung = (item.inherent_dampak_finansial || 0) * ((item.residual_prob_kualitatif || 0) / 100);
                    residualNet = dampakResidualHitung * ((item.residual_prob_kualitatif || 0) / 100);
                  }

                  return (
                    <TableRow key={item.id} className="hover:bg-rose-50/20 transition-colors text-xs group">
                      <TableCell className="text-center font-medium text-slate-500 sticky left-0 bg-white z-10 border-r border-rose-100 group-hover:bg-rose-50/20">{index + 1}</TableCell>
                      <TableCell className="font-mono">{item.kode_risiko}</TableCell>
                      <TableCell>
                        <Badge size="xs" className="rounded-md" color={item.status_risiko === "Risiko Aktif" ? "blue" : "gray"}>
                          {item.status_risiko}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.kategori_risiko}</TableCell>
                      <TableCell>{item.unit_kerja}</TableCell>
                      <TableCell className="whitespace-normal">{sasaranLinked?.sasaran_kpi || "-"}</TableCell>
                      <TableCell>{formatDate(item.tanggal_identifikasi)}</TableCell>

                      <TableCell className="whitespace-normal font-medium text-slate-800">{item.deskripsi_risiko}</TableCell>
                      <TableCell className="whitespace-normal">{item.akar_penyebab}</TableCell>
                      <TableCell className="whitespace-normal">{item.indikator_risiko}</TableCell>
                      <TableCell className="whitespace-normal">{item.internal_control}</TableCell>
                      <TableCell className="whitespace-normal">{item.deskripsi_dampak}</TableCell>

                      {/* INHERENT (P & I) */}
                      <TableCell className={`text-center font-semibold border-l border-blue-100 ${inherentStyle.colorClass}`}>{item.inherent_probabilitas}</TableCell>
                      <TableCell className={`text-center font-semibold ${inherentStyle.colorClass}`}>{item.inherent_dampak}</TableCell>
                      <TableCell className={`text-center font-semibold ${inherentStyle.colorClass}`}>{item.inherent_skor}</TableCell>

                      <TableCell className="text-center">{item.inherent_prob_kualitatif}%</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.inherent_dampak_finansial)}</TableCell>
                      <TableCell className="text-right font-bold text-blue-700">{formatCurrency(inherenNet)}</TableCell>

                      {/* RESIDUAL (P & I) */}
                      <TableCell className={`text-center font-semibold border-l border-orange-100 ${residualStyle.colorClass}`}>{item.residual_probabilitas}</TableCell>
                      <TableCell className={`text-center font-semibold ${residualStyle.colorClass}`}>{item.residual_dampak}</TableCell>
                      <TableCell className={`text-center font-semibold ${residualStyle.colorClass}`}>{item.residual_skor}</TableCell>

                      <TableCell className="text-center">{item.residual_prob_kualitatif}%</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.residual_dampak_finansial)}</TableCell>
                      <TableCell className="text-right font-bold text-orange-700">{formatCurrency(residualNet)}</TableCell>

                      {/* LAINNYA */}
                      <TableCell className="whitespace-nowrap font-medium">{item.pemilik_risiko}</TableCell>
                      <TableCell className="whitespace-nowrap text-gray-500">{item.jabatan_pemilik || "-"}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        <div>{item.kontak_pemilik_hp || "-"}</div>
                        <div className="text-gray-400">{item.kontak_pemilik_email}</div>
                      </TableCell>

                      <TableCell>
                        <Badge size="xs" className="rounded-md" color="cyan">
                          {item.strategi || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-normal">{item.rencana_penanganan}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.biaya_penanganan)}</TableCell>

                      <TableCell className="sticky right-0 bg-white group-hover:bg-rose-50/20 transition-colors shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)] z-10 text-center">
                        <div className="flex justify-center gap-1">
                          <Button size="xs" variant="light" icon={FiEdit2} color="blue" onClick={() => handleOpenEditModal(item)} />
                          <Button size="xs" variant="light" icon={FiTrash2} color="red" onClick={() => handleDeleteRiskInput(item.id)} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={30} className="text-center py-8 text-gray-400 italic">
                    Belum ada data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <RiskInputFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={handleSaveRiskInput}
        assessmentId={assessmentId}
        initialData={editingRiskData}
        sasaranOptions={sasaranOptions || []}
        unitKerjaOptions={uniqueUnitKerja || []}
        templateScores={templateScores}
      />
    </>
  );
}

export default RiskInputCard;
