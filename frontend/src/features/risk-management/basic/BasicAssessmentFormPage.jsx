// frontend/src/features/risk-management/basic/BasicAssessmentFormPage.jsx

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Title, Text, Button, TextInput, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Dialog, DialogPanel, Flex, Badge, Icon } from "@tremor/react";
import { FiBriefcase, FiHome, FiSave, FiPlus, FiTrash2, FiEdit2, FiHelpCircle, FiMaximize, FiMinimize, FiAlertTriangle, FiArrowLeft, FiCheckCircle, FiLayers, FiList, FiBarChart2, FiLoader } from "react-icons/fi";
import apiClient from "../../../api/api";
import { toast } from "sonner";
import { formatDate } from "../../../utils/formatters";

// Import Komponen Modal Baru
import BasicContextModal from "./components/BasicContextModal";
import BasicRiskModal from "./components/BasicRiskModal";
import BasicAnalysisModal from "./components/BasicAnalysisModal";

// --- Helper Functions ---
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
};

const Tooltip = ({ children }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-slate-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
      <h4 className="font-bold mb-1">Kategori Risiko:</h4>
      <ul className="list-disc list-inside">
        <li>Operasional</li>
        <li>Keuangan</li>
        <li>Kepatuhan</li>
        <li>Strategis</li>
      </ul>
    </div>
  </div>
);

// Komponen Konfirmasi Hapus
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => (
  <Dialog open={isOpen} onClose={onClose} static={true}>
    <DialogPanel className="max-w-sm">
      <div className="text-center p-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <FiAlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <Title className="text-xl">{title}</Title>
        <Text className="mt-2 text-gray-600">{message}</Text>
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <Button className="rounded-md" variant="secondary" onClick={onClose}>
          Batal
        </Button>
        <Button className="rounded-md" color="red" onClick={onConfirm}>
          Ya, Hapus
        </Button>
      </div>
    </DialogPanel>
  </Dialog>
);

function BasicAssessmentFormPage() {
  const { assessmentId } = useParams();
  const isEditMode = Boolean(assessmentId);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // --- State Data Utama ---
  const [formData, setFormData] = useState({ nama_unit_kerja: "", nama_perusahaan: "" });
  const [contexts, setContexts] = useState([]);
  const [risks, setRisks] = useState([]);
  const [analyses, setAnalyses] = useState([]);

  // --- State Modal Control ---
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [editingContextIndex, setEditingContextIndex] = useState(null);

  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [editingRiskIndex, setEditingRiskIndex] = useState(null);

  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [editingAnalysisIndex, setEditingAnalysisIndex] = useState(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

  // Fullscreen logic
  const [isFullscreen, setIsFullscreen] = useState(false);
  const riskTableCardRef = useRef(null);

  // --- Fetch Data (Initial Load) ---
  useEffect(() => {
    if (isEditMode) {
      setIsLoading(true);
      apiClient
        .get(`/basic-assessments/${assessmentId}`)
        .then((response) => {
          const data = response.data;
          setFormData({ nama_unit_kerja: data.nama_unit_kerja, nama_perusahaan: data.nama_perusahaan });
          setContexts(data.contexts || []);
          setRisks(data.risks || []);
          setAnalyses(data.analyses || []);
        })
        .catch((err) => {
          toast.error("Gagal memuat data asesmen.");
          console.error(err);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [assessmentId, isEditMode]);

  // --- Handlers --- (Logic Tidak Berubah)
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleOpenAddContext = () => {
    setEditingContextIndex(null);
    setIsContextModalOpen(true);
  };
  const handleOpenEditContext = (index) => {
    setEditingContextIndex(index);
    setIsContextModalOpen(true);
  };
  const handleSaveContext = (contextData) => {
    if (editingContextIndex !== null) {
      const updated = [...contexts];
      updated[editingContextIndex] = contextData;
      setContexts(updated);
    } else {
      setContexts([...contexts, contextData]);
    }
    setIsContextModalOpen(false);
  };
  const handleDeleteContext = (index) => {
    setDeleteConfirmation({
      isOpen: true,
      title: "Hapus Konteks",
      message: "Yakin ingin menghapus item konteks ini?",
      onConfirm: () => {
        setContexts(contexts.filter((_, i) => i !== index));
        setDeleteConfirmation({ isOpen: false });
      },
    });
  };

  const handleOpenAddRisk = () => {
    setEditingRiskIndex(null);
    setIsRiskModalOpen(true);
  };
  const handleOpenEditRisk = (index) => {
    setEditingRiskIndex(index);
    setIsRiskModalOpen(true);
  };
  const handleSaveRisk = (riskData) => {
    if (editingRiskIndex !== null) {
      const updated = [...risks];
      updated[editingRiskIndex] = riskData;
      setRisks(updated);
    } else {
      setRisks([...risks, riskData]);
    }
    setIsRiskModalOpen(false);
  };
  const handleDeleteRisk = (index) => {
    setDeleteConfirmation({
      isOpen: true,
      title: "Hapus Risiko",
      message: "Yakin ingin menghapus risiko ini?",
      onConfirm: () => {
        setRisks(risks.filter((_, i) => i !== index));
        setDeleteConfirmation({ isOpen: false });
      },
    });
  };

  const availableRisksForAnalysis = useMemo(() => {
    const usedRiskIndices = analyses.map((a) => a.risk_identification_id);
    return risks
      .map((risk, index) => ({ ...risk, originalIndex: index }))
      .filter((risk) => !usedRiskIndices.includes(risk.originalIndex) || (editingAnalysisIndex !== null && analyses[editingAnalysisIndex].risk_identification_id === risk.originalIndex));
  }, [risks, analyses, editingAnalysisIndex]);

  const handleOpenAddAnalysis = () => {
    setEditingAnalysisIndex(null);
    setIsAnalysisModalOpen(true);
  };
  const handleOpenEditAnalysis = (index) => {
    setEditingAnalysisIndex(index);
    setIsAnalysisModalOpen(true);
  };
  const handleSaveAnalysis = (analysisData) => {
    if (editingAnalysisIndex !== null) {
      const updated = [...analyses];
      updated[editingAnalysisIndex] = analysisData;
      setAnalyses(updated);
    } else {
      setAnalyses([...analyses, analysisData]);
    }
    setIsAnalysisModalOpen(false);
  };
  const handleDeleteAnalysis = (index) => {
    setDeleteConfirmation({
      isOpen: true,
      title: "Hapus Analisis",
      message: "Yakin ingin menghapus analisis ini?",
      onConfirm: () => {
        setAnalyses(analyses.filter((_, i) => i !== index));
        setDeleteConfirmation({ isOpen: false });
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = { ...formData, contexts: contexts.map((c) => ({ external: c.external, internal: c.internal })), risks, analyses };
    try {
      if (isEditMode) {
        await apiClient.put(`/basic-assessments/${assessmentId}`, payload);
        toast.success("Asesmen berhasil diperbarui!");
      } else {
        await apiClient.post("/basic-assessments", payload);
        toast.success("Asesmen berhasil disimpan!");
      }
      navigate("/risk-management/dasar");
    } catch (error) {
      toast.error("Gagal menyimpan: " + (error.response?.data?.msg || "Terjadi kesalahan."));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      riskTableCardRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
    }
  };
  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  if (isLoading && isEditMode)
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );

  return (
    <div className="p-6 sm:p-10  mx-auto space-y-8 bg-slate-50 min-h-screen">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4">
          <Button variant="light" icon={FiArrowLeft} onClick={() => navigate("/risk-management/dasar")} title="Kembali ke daftar" />
          <div>
            <div className="flex items-center gap-2">
              <Title className="text-2xl text-slate-800">{isEditMode ? "Edit Asesmen Dasar" : "Asesmen Dasar Baru"}</Title>
              <Badge className="rounded-md" color="blue">
                {isEditMode ? "Mode Edit" : "Draft Baru"}
              </Badge>
            </div>
            <Text className="text-slate-500 mt-1">Isi formulir di bawah ini untuk mendokumentasikan asesmen risiko unit kerja.</Text>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" color="slate" onClick={() => navigate("/risk-management/dasar")} className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors">
            Batal
          </Button>
          <Button icon={FiSave} loading={isLoading} onClick={handleSubmit} className="rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all transform hover:-translate-y-0.5">
            Simpan Asesmen
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* CARD 1: IDENTITAS (Aksen Biru) */}
        <Card className="border-l-4 border-blue-500 shadow-md ring-1 ring-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <FiBriefcase size={24} />
            </div>
            <div>
              <Title>Identitas Unit Kerja</Title>
              <Text>Informasi dasar mengenai pemilik risiko.</Text>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">
                Nama Unit Kerja <span className="text-red-500">*</span>
              </label>
              <TextInput icon={FiBriefcase} name="nama_unit_kerja" value={formData.nama_unit_kerja} onChange={handleChange} placeholder="Contoh: Divisi Keuangan" required />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">
                Nama Perusahaan <span className="text-red-500">*</span>
              </label>
              <TextInput icon={FiHome} name="nama_perusahaan" value={formData.nama_perusahaan} onChange={handleChange} placeholder="Contoh: PT. Sirico Jaya Abadi" required />
            </div>
          </div>
        </Card>

        {/* CARD 2: KONTEKS (Aksen Ungu) */}
        <Card className="border-l-4 border-purple-500 shadow-md ring-1 ring-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <FiLayers size={24} />
              </div>
              <div>
                <Title>1. Konteks Organisasi</Title>
                <Text>Faktor internal dan eksternal yang mempengaruhi risiko.</Text>
              </div>
            </div>
            <Button type="button" className="rounded-lg w-full sm:w-auto" icon={FiPlus} variant="secondary" color="purple" onClick={handleOpenAddContext}>
              Tambah Konteks
            </Button>
          </div>

          <Table className="mt-4">
            <TableHead>
              <TableRow>
                <TableHeaderCell className="bg-purple-50 text-purple-900 font-bold border-b border-purple-200">Konteks Eksternal</TableHeaderCell>
                <TableHeaderCell className="bg-purple-50 text-purple-900 font-bold border-b border-purple-200">Konteks Internal</TableHeaderCell>
                <TableHeaderCell className="bg-purple-50 text-purple-900 font-bold border-b border-purple-200 text-right">Aksi</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contexts.length > 0 ? (
                contexts.map((ctx, index) => (
                  <TableRow key={index} className="hover:bg-purple-50/30 transition-colors">
                    <TableCell className="whitespace-normal text-xs text-slate-700">{ctx.external}</TableCell>
                    <TableCell className="whitespace-normal text-xs text-slate-700">{ctx.internal}</TableCell>
                    <TableCell className="text-right">
                      <Flex justifyContent="end" className="gap-2">
                        <Button type="button" icon={FiEdit2} size="xs" variant="light" color="blue" onClick={() => handleOpenEditContext(index)} />
                        <Button type="button" icon={FiTrash2} size="xs" variant="light" color="red" onClick={() => handleDeleteContext(index)} />
                      </Flex>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-400 py-8 italic">
                    Belum ada data konteks. Silakan tambahkan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* CARD 3: RISIKO (Aksen Oranye) */}
        <Card className={`border-l-4 bg-slate-50 border-orange-500 shadow-md ring-1 ring-gray-100 ${isFullscreen ? "fixed inset-0 z-50 h-screen overflow-auto m-0 rounded-none" : "relative"}`} ref={riskTableCardRef}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <FiList size={24} />
              </div>
              <div>
                <Title>2. Identifikasi Risiko</Title>
                <Text>Daftar potensi kejadian risiko beserta penyebab dan dampaknya.</Text>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button type="button" className="rounded-lg flex-1 sm:flex-none" icon={FiPlus} variant="secondary" color="orange" onClick={handleOpenAddRisk}>
                Tambah Risiko
              </Button>
              <Button type="button" variant="light" icon={isFullscreen ? FiMinimize : FiMaximize} onClick={toggleFullscreen} title="Toggle Fullscreen" />
            </div>
          </div>

          <div className="overflow-x-auto pb-4">
            <Table className="min-w-[1800px]">
              <TableHead>
                <TableRow className="border-b border-orange-200">
                  <TableHeaderCell className="w-12 bg-orange-50 text-orange-900 font-bold">No</TableHeaderCell>
                  <TableHeaderCell className="bg-orange-50 text-orange-900 font-bold">Kode</TableHeaderCell>
                  <TableHeaderCell className="bg-orange-50 text-orange-900 font-bold">
                    <div className="flex items-center gap-1">
                      Kategori{" "}
                      <Tooltip>
                        <FiHelpCircle />
                      </Tooltip>
                    </div>
                  </TableHeaderCell>
                  <TableHeaderCell className="bg-orange-50 text-orange-900 font-bold">Unit Kerja</TableHeaderCell>
                  <TableHeaderCell className="bg-orange-50 text-orange-900 font-bold w-64">Sasaran</TableHeaderCell>
                  <TableHeaderCell className="bg-orange-50 text-orange-900 font-bold">Tgl Identifikasi</TableHeaderCell>
                  <TableHeaderCell className="bg-orange-50 text-orange-900 font-bold w-72">Kejadian Risiko</TableHeaderCell>
                  <TableHeaderCell className="bg-orange-50 text-orange-900 font-bold w-64">Akar Penyebab</TableHeaderCell>
                  <TableHeaderCell className="bg-orange-50 text-orange-900 font-bold w-64">Indikator</TableHeaderCell>
                  <TableHeaderCell className="bg-orange-50 text-orange-900 font-bold w-64">Internal Control</TableHeaderCell>
                  <TableHeaderCell className="bg-orange-50 text-orange-900 font-bold w-64">Dampak</TableHeaderCell>
                  <TableHeaderCell className="bg-orange-50 text-orange-900 font-bold text-right sticky right-0 z-10 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">Aksi</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {risks.length > 0 ? (
                  risks.map((risk, index) => (
                    <TableRow key={index} className="hover:bg-orange-50/30 transition-colors group">
                      <TableCell className="text-center font-medium text-slate-500">{index + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{risk.kode_risiko}</TableCell>
                      <TableCell>
                        <Badge size="xs" color="orange" className="rounded-md">
                          {risk.kategori_risiko}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-normal text-xs text-slate-700">{risk.unit_kerja}</TableCell>
                      <TableCell className="whitespace-normal text-xs text-slate-700">{risk.sasaran}</TableCell>
                      <TableCell className="text-slate-500 text-xs">{formatDate(risk.tanggal_identifikasi)}</TableCell>
                      <TableCell className="whitespace-normal text-xs font-medium text-slate-800">{risk.deskripsi_risiko}</TableCell>
                      <TableCell className="whitespace-normal text-xs text-slate-700">{risk.akar_penyebab}</TableCell>
                      <TableCell className="whitespace-normal text-xs text-slate-700">{risk.indikator_risiko}</TableCell>
                      <TableCell className="whitespace-normal text-xs text-slate-700">{risk.internal_control}</TableCell>
                      <TableCell className="whitespace-normal text-xs text-slate-700">{risk.deskripsi_dampak}</TableCell>
                      <TableCell className="text-right sticky right-0 bg-white group-hover:bg-orange-50/30 transition-colors shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">
                        <Flex justifyContent="end" className="gap-2">
                          <Button type="button" icon={FiEdit2} size="xs" variant="light" color="blue" onClick={() => handleOpenEditRisk(index)} />
                          <Button type="button" icon={FiTrash2} size="xs" variant="light" color="red" onClick={() => handleDeleteRisk(index)} />
                        </Flex>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center text-gray-400 py-10 italic">
                      Belum ada risiko teridentifikasi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* CARD 4: ANALISIS (Aksen Merah) */}
        <Card className="border-l-4 border-red-500 shadow-md ring-1 ring-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <FiBarChart2 size={24} />
              </div>
              <div>
                <Title>3. Analisis Risiko</Title>
                <Text>Penilaian tingkat risiko inheren berdasarkan probabilitas dan dampak.</Text>
              </div>
            </div>
            <Button type="button" className="rounded-lg w-full sm:w-auto" icon={FiPlus} variant="secondary" color="red" onClick={handleOpenAddAnalysis} disabled={availableRisksForAnalysis.length === 0 && editingAnalysisIndex === null}>
              Tambah Analisis
            </Button>
          </div>

          <div className="overflow-x-auto pb-2">
            <Table className="min-w-[1200px]">
              <TableHead>
                <TableRow className="border-b border-red-200">
                  <TableHeaderCell className="bg-red-50 text-red-900 font-bold w-1/3">Kejadian Risiko</TableHeaderCell>
                  <TableHeaderCell className="bg-red-50 text-red-900 font-bold text-center">Prob (P)</TableHeaderCell>
                  <TableHeaderCell className="bg-red-50 text-red-900 font-bold text-center">Dampak (I)</TableHeaderCell>
                  <TableHeaderCell className="bg-red-50 text-red-900 font-bold text-center">Skor (W)</TableHeaderCell>
                  <TableHeaderCell className="bg-red-50 text-red-900 font-bold text-right">Probabilitas (%)</TableHeaderCell>
                  <TableHeaderCell className="bg-red-50 text-red-900 font-bold text-right">Dampak (Rp)</TableHeaderCell>
                  <TableHeaderCell className="bg-red-50 text-red-900 font-bold text-right">Nilai Bersih</TableHeaderCell>
                  <TableHeaderCell className="bg-red-50 text-red-900 font-bold text-right">Aksi</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analyses.length > 0 ? (
                  analyses.map((analysis, index) => {
                    const riskInfo = risks[analysis.risk_identification_id];
                    const skor = (analysis.probabilitas || 0) * (analysis.dampak || 0);
                    const nilaiBersih = (analysis.dampak_finansial || 0) * ((analysis.probabilitas_kualitatif || 0) / 100);

                    // Warna skor
                    let scoreColor = "bg-green-100 text-green-800";
                    if (skor >= 15) scoreColor = "bg-red-100 text-red-800";
                    else if (skor >= 8) scoreColor = "bg-yellow-100 text-yellow-800";

                    return (
                      <TableRow key={index} className="hover:bg-red-50/30 transition-colors">
                        <TableCell className="whitespace-normal text-xs font-medium text-slate-700">{riskInfo?.deskripsi_risiko || <span className="text-red-400 italic">(Risiko induk terhapus)</span>}</TableCell>
                        <TableCell className="text-center">{analysis.probabilitas}</TableCell>
                        <TableCell className="text-center">{analysis.dampak}</TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-1 rounded font-bold text-xs ${scoreColor}`}>{skor}</span>
                        </TableCell>
                        <TableCell className="text-right">{analysis.probabilitas_kualitatif}%</TableCell>
                        <TableCell className="text-right text-slate-600">{formatCurrency(analysis.dampak_finansial)}</TableCell>
                        <TableCell className="text-right font-bold text-slate-800">{formatCurrency(nilaiBersih)}</TableCell>
                        <TableCell className="text-right">
                          <Flex justifyContent="end" className="gap-2">
                            <Button type="button" icon={FiEdit2} size="xs" variant="light" color="blue" onClick={() => handleOpenEditAnalysis(index)} />
                            <Button type="button" icon={FiTrash2} size="xs" variant="light" color="red" onClick={() => handleDeleteAnalysis(index)} />
                          </Flex>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-400 py-8 italic">
                      Belum ada analisis risiko.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </form>

      {/* --- MODALS --- */}
      <BasicContextModal isOpen={isContextModalOpen} onClose={() => setIsContextModalOpen(false)} onSave={handleSaveContext} initialData={editingContextIndex !== null ? contexts[editingContextIndex] : null} />
      <BasicRiskModal isOpen={isRiskModalOpen} onClose={() => setIsRiskModalOpen(false)} onSave={handleSaveRisk} initialData={editingRiskIndex !== null ? risks[editingRiskIndex] : null} />
      <BasicAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        onSave={handleSaveAnalysis}
        initialData={editingAnalysisIndex !== null ? analyses[editingAnalysisIndex] : null}
        availableRisks={availableRisksForAnalysis}
      />
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })}
        onConfirm={deleteConfirmation.onConfirm}
        title={deleteConfirmation.title}
        message={deleteConfirmation.message}
      />
    </div>
  );
}

export default BasicAssessmentFormPage;
