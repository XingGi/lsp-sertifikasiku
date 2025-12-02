// frontend/src/features/risk-management/madya/MadyaAssessmentListPage.jsx

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Title, Text, Button, Dialog, DialogPanel, Grid, Card, Badge, TextInput, Select, SelectItem } from "@tremor/react";
import { FiPlus, FiEye, FiCheckCircle, FiLoader, FiShield, FiX, FiGrid, FiList, FiTrash2, FiAlertTriangle, FiEdit2, FiDownload, FiMaximize, FiMinimize, FiSearch, FiFilter, FiLayers, FiCalendar, FiBriefcase, FiLayout } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../../../api/api";
import TemplateViewModal from "../templates/components/TemplateViewModal";
import MadyaAssessmentView from "./components/MadyaAssessmentView";
import { toast } from "sonner";
import NotificationModal from "../../../components/common/NotificationModal";
import AppResourceTable from "../../../components/common/AppResourceTable";
import { formatDate } from "../../../utils/formatters";

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, isLoading = false }) => (
  <Dialog open={isOpen} onClose={onClose} static={true}>
    <DialogPanel className="max-w-md">
      <div className="flex flex-col items-center text-center p-2">
        <div className="p-3 bg-red-100 rounded-full text-red-600 mb-4">
          <FiAlertTriangle className="h-8 w-8" />
        </div>
        <Title className="text-xl">{title}</Title>
        <Text className="mt-2 text-gray-600">{message}</Text>
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <Button className="rounded-md" variant="secondary" onClick={onClose} disabled={isLoading}>
          Batal
        </Button>
        <Button className="rounded-md" color="red" onClick={onConfirm} loading={isLoading} disabled={isLoading}>
          Ya, Hapus
        </Button>
      </div>
    </DialogPanel>
  </Dialog>
);

function SelectTemplateModal({ isOpen, onClose, onSelect }) {
  const [templates, setTemplates] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [assessmentName, setAssessmentName] = useState("");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setIsLoadingList(true);
      setTemplates([]);
      setAssessmentName("");
      apiClient
        .get("/risk-maps")
        .then((response) => setTemplates(response.data))
        .catch((error) => console.error("Gagal memuat template:", error))
        .finally(() => setIsLoadingList(false));
    }
  }, [isOpen]);

  const handleSelect = async (templateId) => {
    if (!assessmentName.trim()) {
      alert("Nama asesmen tidak boleh kosong.");
      return;
    }
    setIsCreating(true);
    try {
      await onSelect(templateId, assessmentName);
    } catch (error) {
      console.error("Error selection:", error);
      setIsCreating(false);
    }
  };

  const handleTemplatePreviewClick = (templateId) => {
    setIsDetailLoading(true);
    setIsViewModalOpen(true);
    setViewingTemplate(null);
    apiClient
      .get(`/risk-maps/${templateId}`)
      .then((response) => setViewingTemplate(response.data))
      .catch((error) => {
        alert("Gagal memuat template.");
        setIsViewModalOpen(false);
      })
      .finally(() => setIsDetailLoading(false));
  };

  const canProceed = assessmentName.trim() !== "" && !isCreating;

  return (
    <>
      <Dialog open={isOpen} onClose={() => !isCreating && onClose()} static={true}>
        <DialogPanel className="max-w-5xl p-0 overflow-hidden rounded-xl bg-slate-50">
          {/* Header Modal */}
          <div className="bg-white p-6 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <FiPlus size={20} />
              </div>
              <div>
                <Title>Mulai Asesmen Baru</Title>
                <Text className="text-xs">Silakan isi nama dan pilih template peta risiko.</Text>
              </div>
            </div>
            <Button icon={FiX} variant="light" onClick={onClose} disabled={isCreating} color="slate" />
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Input Nama */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nama Asesmen <span className="text-red-500">*</span>
              </label>
              <TextInput value={assessmentName} onChange={(e) => setAssessmentName(e.target.value)} placeholder="Contoh: Asesmen Risiko Proyek Jalan Tol Q1 2025" disabled={isCreating} />
            </div>

            {/* Pilihan Template */}
            <div>
              <Title className="mb-3 flex items-center gap-2">
                <FiLayout className="text-gray-500" /> Pilih Template Peta Risiko
              </Title>

              {isLoadingList ? (
                <div className="flex flex-col justify-center items-center p-12 bg-white rounded-xl border border-dashed border-gray-300">
                  <FiLoader className="animate-spin h-6 w-6 text-indigo-500 mb-2" />
                  <Text>Memuat template...</Text>
                </div>
              ) : templates.length === 0 ? (
                <Card className="text-center p-8 border-dashed border-2 border-gray-200">
                  <Text>Tidak ada template tersedia.</Text>
                  <Button onClick={() => navigate("/risk-management/templates/new")} className="mt-4" variant="secondary">
                    Buat Template Baru
                  </Button>
                </Card>
              ) : (
                <Grid numItemsSm={1} numItemsMd={2} className="gap-4">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`flex flex-col border cursor-pointer transition-all duration-200 group relative overflow-hidden
                          ${template.is_default ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-gray-300"}
                          hover:shadow-md hover:border-indigo-300 bg-white
                        `}
                    >
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {template.is_default ? <FiShield className="text-blue-500" /> : <FiLayout className="text-gray-400" />}
                            <Title as="h4" className="text-base font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                              {template.name}
                            </Title>
                          </div>
                          {template.is_default && (
                            <Badge className="rounded-md px-2 py-1" color="blue" size="xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <Text className="text-sm text-gray-500 line-clamp-2 h-10">{template.description || "Tidak ada deskripsi."}</Text>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                        <Button
                          icon={FiEye}
                          variant="secondary"
                          size="xs"
                          className="rounded-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTemplatePreviewClick(template.id);
                          }}
                          disabled={isCreating}
                        >
                          Preview
                        </Button>
                        <Button icon={FiCheckCircle} size="xs" className="rounded-md" color="blue" onClick={() => handleSelect(template.id)} loading={isCreating} disabled={!canProceed}>
                          Gunakan
                        </Button>
                      </div>
                    </Card>
                  ))}
                </Grid>
              )}
            </div>
          </div>
        </DialogPanel>
      </Dialog>
      <TemplateViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} templateData={isDetailLoading ? null : viewingTemplate} />
    </>
  );
}

// --- HALAMAN UTAMA ---

function MadyaAssessmentListPage() {
  const navigate = useNavigate();

  // State Data
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLimits, setUserLimits] = useState(null);

  // State Filter & Sort (Baru ditambahkan)
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [viewMode, setViewMode] = useState("list");

  // State UI Interactions
  const [limitModal, setLimitModal] = useState({ isOpen: false, message: "" });
  const [isSelectTemplateModalOpen, setIsSelectTemplateModalOpen] = useState(false);
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);

  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, assessmentId: null, assessmentName: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingAssessmentData, setViewingAssessmentData] = useState(null);
  const [viewingTemplateData, setViewingTemplateData] = useState(null);
  const [viewingRiskInputs, setViewingRiskInputs] = useState([]);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isExportingId, setIsExportingId] = useState(null);
  const [isViewFullscreen, setIsViewFullscreen] = useState(false);
  const viewContentRef = useRef(null);

  // Fetch Data
  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/madya-assessments");
      setAssessments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Gagal memuat asesmen:", error);
      setAssessments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
    apiClient
      .get("/account/details")
      .then((res) => setUserLimits(res.data.assessment_limits))
      .catch((err) => console.error("Gagal limit:", err));

    const handleFs = () => setIsViewFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  // Logic Filter & Sorting (Sama seperti Basic)
  const filteredAndSortedAssessments = useMemo(() => {
    let result = [...assessments];

    // 1. Filter Pencarian
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((item) => item.nama_asesmen?.toLowerCase().includes(lowerQuery) || `#${item.id}`.includes(lowerQuery));
    }

    // 2. Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "a-z":
          return (a.nama_asesmen || "").localeCompare(b.nama_asesmen || "");
        case "z-a":
          return (b.nama_asesmen || "").localeCompare(a.nama_asesmen || "");
        default:
          return 0;
      }
    });

    return result;
  }, [assessments, searchQuery, sortOption]);

  // Handlers
  const handleViewClick = async (assessmentId) => {
    setIsViewLoading(true);
    setIsViewModalOpen(true);
    setViewingAssessmentData(null);
    setViewingRiskInputs([]);
    try {
      const [res, inputsRes] = await Promise.all([apiClient.get(`/madya-assessments/${assessmentId}`), apiClient.get(`/madya-assessments/${assessmentId}/risk-inputs`)]);
      setViewingAssessmentData(res.data);
      setViewingRiskInputs(inputsRes.data || []);

      if (res.data.risk_map_template_id) {
        const tplRes = await apiClient.get(`/risk-maps/${res.data.risk_map_template_id}`);
        setViewingTemplateData(tplRes.data);
      }
    } catch (error) {
      toast.error("Gagal memuat detail.");
      setIsViewModalOpen(false);
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleExportClick = async (e, assessmentId, name) => {
    e?.stopPropagation();
    setIsExportingId(assessmentId);
    try {
      const response = await apiClient.get(`/madya-assessments/${assessmentId}/export`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Asesmen_Madya_${name || assessmentId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error("Gagal mengekspor file.");
    } finally {
      setIsExportingId(null);
    }
  };

  const handleOpenSelectTemplateModal = () => {
    if (userLimits) {
      const count = assessments.length;
      const limit = userLimits.madya?.limit;
      if (limit !== null && count >= limit) {
        setLimitModal({ isOpen: true, message: `Batas pembuatan Asesmen Madya tercapai (${count}/${limit}).  Hubungi admin.` });
        return;
      }
    }
    setIsSelectTemplateModalOpen(true);
  };

  const handleTemplateSelected = async (templateId, name) => {
    setIsCreatingAssessment(true);
    try {
      const response = await apiClient.post("/madya-assessments", { risk_map_template_id: templateId, nama_asesmen: name });
      setIsSelectTemplateModalOpen(false);
      navigate(`/risk-management/madya/form/${response.data.id}`);
    } catch (error) {
      toast.error("Gagal membuat asesmen baru.");
    } finally {
      setIsCreatingAssessment(false);
    }
  };

  const openDeleteConfirm = (e, assessmentId, assessmentName) => {
    e?.stopPropagation();
    setDeleteConfirmation({
      isOpen: true,
      assessmentId: assessmentId,
      assessmentName: assessmentName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.assessmentId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/madya-assessments/${deleteConfirmation.assessmentId}`);
      toast.success(`Asesmen "${deleteConfirmation.assessmentName}" berhasil dihapus.`);
      setDeleteConfirmation({ isOpen: false, assessmentId: null, assessmentName: "" });
      fetchAssessments();
    } catch (error) {
      toast.error("Gagal menghapus asesmen.");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleViewFullscreen = () => {
    if (!document.fullscreenElement) viewContentRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  // --- DEFINISI KOLOM TABEL (Untuk Mode List) ---
  const columns = [
    {
      key: "nama_asesmen",
      header: "Nama Asesmen",
      cell: (item) => (
        <div className="cursor-pointer group flex items-center gap-3" onClick={() => navigate(`/risk-management/madya/form/${item.id}`)}>
          <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
            <FiBriefcase size={14} />
          </div>
          <div>
            <Text className="font-semibold text-tremor-content-strong group-hover:text-blue-600 transition-colors">{item.nama_asesmen || `Asesmen #${item.id}`}</Text>
          </div>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Tanggal Dibuat",
      cell: (item) => (
        <div className="flex items-center gap-2 text-gray-600">
          <FiCalendar className="w-4 h-4 text-gray-400" />
          <Text>{formatDate(item.created_at)}</Text>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (item) => (
        <div className="flex justify-end gap-1 opacity-80 hover:opacity-100 transition-opacity">
          <Button
            size="xs"
            variant="secondary"
            className="rounded-md"
            icon={FiEye}
            onClick={(e) => {
              e.stopPropagation();
              handleViewClick(item.id);
            }}
            title="Lihat Detail"
          />
          <Button
            size="xs"
            variant="secondary"
            className="rounded-md"
            icon={FiEdit2}
            color="blue"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/risk-management/madya/form/${item.id}`);
            }}
            title="Edit"
          />
          <Button size="xs" variant="secondary" className="rounded-md" icon={FiDownload} loading={isExportingId === item.id} onClick={(e) => handleExportClick(e, item.id, item.nama_asesmen)} title="Export" />
          <Button size="xs" variant="secondary" className="rounded-md" icon={FiTrash2} color="rose" onClick={(e) => openDeleteConfirm(e, item.id, item.nama_asesmen)} title="Hapus" />
        </div>
      ),
      className: "text-right w-48",
    },
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
            <FiShield size={28} />
          </div>
          <div>
            <Title className="text-2xl text-slate-800">Asesmen Madya</Title>
            <Text className="text-slate-500">Identifikasi dan analisis risiko tingkat madya (Proyek/Divisi).</Text>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            size="lg"
            icon={viewMode === "list" ? FiGrid : FiList}
            variant="secondary"
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            title={viewMode === "list" ? "Tampilan Grid" : "Tampilan Tabel"}
            className="shadow-sm border-gray-200 bg-white hover:bg-gray-50 rounded-xl"
          />
          <Button
            size="lg"
            icon={FiPlus}
            onClick={handleOpenSelectTemplateModal}
            loading={isCreatingAssessment}
            disabled={isLoading || !userLimits}
            className="shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all rounded-xl"
          >
            Asesmen Baru
          </Button>
        </div>
      </div>

      {/* --- FILTER BAR --- */}
      <Card className="p-4 shadow-sm border border-gray-100 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          <div className="relative flex-grow w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama asesmen..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-56 flex-shrink-0">
            <Select value={sortOption} onValueChange={setSortOption} icon={FiFilter} placeholder="Urutkan..." className="h-[42px]">
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="oldest">Terlama</SelectItem>
              <SelectItem value="a-z">Abjad A-Z</SelectItem>
              <SelectItem value="z-a">Abjad Z-A</SelectItem>
            </Select>
          </div>
        </div>
      </Card>

      {/* Content List */}
      {viewMode === "list" ? (
        <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl">
          <AppResourceTable data={filteredAndSortedAssessments} isLoading={isLoading} columns={columns} emptyMessage="Belum ada asesmen madya yang ditemukan." />
        </Card>
      ) : isLoading ? (
        <div className="text-center py-20">
          <FiLoader className="animate-spin h-8 w-8 mx-auto text-gray-400" />
        </div>
      ) : filteredAndSortedAssessments.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-xl bg-white">
          <Text>Tidak ada asesmen madya.</Text>
        </div>
      ) : (
        <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6">
          {filteredAndSortedAssessments.map((item) => (
            <Card key={item.id} className="flex flex-col hover:shadow-lg transition-shadow border-t-4 border-t-blue-500 cursor-pointer group h-full justify-between" onClick={() => navigate(`/risk-management/madya/form/${item.id}`)}>
              <div>
                <div className="flex items-start justify-between mb-2">
                  <Title className="text-lg font-bold group-hover:text-blue-600 transition-colors line-clamp-2">{item.nama_asesmen || `Asesmen #${item.id}`}</Title>
                  <div className="p-1.5 bg-blue-50 rounded text-blue-600">
                    <FiShield size={14} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Text className="text-sm text-gray-500 flex items-center gap-2">
                    <FiCalendar size={14} className="text-gray-400" /> {formatDate(item.created_at)}
                  </Text>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end gap-2">
                <Button
                  size="xs"
                  variant="light"
                  icon={FiEye}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewClick(item.id);
                  }}
                />
                <Button size="xs" variant="light" icon={FiDownload} loading={isExportingId === item.id} onClick={(e) => handleExportClick(e, item.id, item.nama_asesmen)} />
                <Button
                  size="xs"
                  variant="light"
                  color="rose"
                  icon={FiTrash2}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmation({ isOpen: true, assessmentId: item.id });
                  }}
                />
              </div>
            </Card>
          ))}
        </Grid>
      )}

      {/* Modals */}
      <SelectTemplateModal isOpen={isSelectTemplateModalOpen} onClose={() => setIsSelectTemplateModalOpen(false)} onSelect={handleTemplateSelected} />

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })}
        onConfirm={handleDeleteConfirm}
        title="Hapus Asesmen"
        message={`Yakin ingin menghapus asesmen "${deleteConfirmation.assessmentName}"? Data terkait akan hilang permanen.`}
        isLoading={isDeleting}
      />

      <Dialog open={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} static={true}>
        <DialogPanel className="w-full max-w-7xl h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl">
          <div className="bg-white p-6 border-b flex justify-between items-start flex-shrink-0 shadow-sm z-10">
            <div>
              <Title>Detail: {viewingAssessmentData?.nama_asesmen}</Title>
              <Text>ID: RAM-#{viewingAssessmentData?.id}</Text>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={FiDownload} onClick={(e) => handleExportClick(e, viewingAssessmentData?.id, viewingAssessmentData?.nama_asesmen)}>
                Export
              </Button>
              <Button variant="light" icon={isViewFullscreen ? FiMinimize : FiMaximize} onClick={toggleViewFullscreen}>
                {isViewFullscreen ? "Keluar Fullscreen" : "Fullscreen"}
              </Button>
              <Button variant="light" icon={FiX} onClick={() => setIsViewModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
          <div ref={viewContentRef} className="flex-grow overflow-y-auto p-6 bg-slate-50">
            {isViewLoading ? (
              <div className="text-center py-20">Memuat detail...</div>
            ) : (
              viewingAssessmentData && <MadyaAssessmentView assessmentData={viewingAssessmentData} templateData={viewingTemplateData} riskInputEntries={viewingRiskInputs} />
            )}
          </div>
        </DialogPanel>
      </Dialog>

      <NotificationModal isOpen={limitModal.isOpen} onClose={() => setLimitModal({ isOpen: false, message: "" })} title="Batas Kuota" message={limitModal.message} />
    </div>
  );
}

export default MadyaAssessmentListPage;
