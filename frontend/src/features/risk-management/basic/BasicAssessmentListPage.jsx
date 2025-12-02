// frontend/src/features/risk-management/basic/BasicAssessmentListPage.jsx

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Title, Text, Button, Dialog, DialogPanel, Grid, Flex, Icon, Select, SelectItem } from "@tremor/react";
import { FiPlus, FiHome, FiCalendar, FiEdit2, FiEye, FiInfo, FiCheckCircle, FiDownload, FiMaximize, FiMinimize, FiGrid, FiList, FiLoader, FiTrash2, FiSearch, FiLayers, FiFilter, FiBriefcase } from "react-icons/fi";
import apiClient from "../../../api/api";
import BasicAssessmentView from "./components/BasicAssessmentView";
import { toast } from "sonner";
import NotificationModal from "../../../components/common/NotificationModal";
import ConfirmationDialog from "../../../components/common/ConfirmationDialog";
import AppResourceTable from "../../../components/common/AppResourceTable";
import { formatDate } from "../../../utils/formatters";

function BasicAssessmentListPage() {
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // State Filter & Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [viewMode, setViewMode] = useState("list");

  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isExportingId, setIsExportingId] = useState(null);
  const [isViewFullscreen, setIsViewFullscreen] = useState(false);
  const viewContentRef = useRef(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    assessmentId: null,
    assessmentName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [userLimits, setUserLimits] = useState(null);
  const [limitModal, setLimitModal] = useState({ isOpen: false, message: "" });

  const fetchAssessments = () => {
    setIsLoading(true);
    apiClient
      .get("/basic-assessments")
      .then((response) => setAssessments(response.data))
      .catch((error) => console.error("Gagal memuat asesmen dasar:", error))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAssessments();
    apiClient
      .get("/account/details")
      .then((res) => setUserLimits(res.data.assessment_limits))
      .catch((err) => console.error("Gagal memuat limit:", err));

    const handleFullscreenChange = () => setIsViewFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Logic Filter & Sorting
  const filteredAndSortedAssessments = useMemo(() => {
    let result = [...assessments];

    // 1. Filter Pencarian
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((item) => item.nama_unit_kerja.toLowerCase().includes(lowerQuery) || item.nama_perusahaan.toLowerCase().includes(lowerQuery));
    }

    // 2. Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "a-z":
          return a.nama_unit_kerja.localeCompare(b.nama_unit_kerja);
        case "z-a":
          return b.nama_unit_kerja.localeCompare(a.nama_unit_kerja);
        default:
          return 0;
      }
    });

    return result;
  }, [assessments, searchQuery, sortOption]);

  const handleViewClick = async (assessmentId) => {
    setIsViewLoading(true);
    setIsViewModalOpen(true);
    try {
      const response = await apiClient.get(`/basic-assessments/${assessmentId}`);
      setSelectedAssessment(response.data);
    } catch (error) {
      toast.error("Gagal memuat detail.");
      setIsViewModalOpen(false);
    } finally {
      setIsViewLoading(false);
    }
  };

  const toggleViewFullscreen = () => {
    if (!document.fullscreenElement) viewContentRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleExportClick = async (e, assessmentId, assessmentName) => {
    e?.stopPropagation();
    setIsExportingId(assessmentId);
    try {
      const response = await apiClient.get(`/basic-assessments/${assessmentId}/export`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Asesmen_Dasar_${assessmentName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Gagal mengekspor file Excel.");
    } finally {
      setIsExportingId(null);
    }
  };

  const openDeleteConfirm = (e, assessmentId, assessmentName) => {
    e?.stopPropagation();
    setDeleteConfirmation({ isOpen: true, assessmentId, assessmentName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.assessmentId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/basic-assessments/${deleteConfirmation.assessmentId}`);
      toast.success(`Asesmen "${deleteConfirmation.assessmentName}" berhasil dihapus.`);
      setDeleteConfirmation({ isOpen: false, assessmentId: null, assessmentName: "" });
      fetchAssessments();
    } catch (error) {
      toast.error("Gagal menghapus asesmen.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNewAssessmentClick = () => {
    if (!userLimits) {
      toast.info("Sedang memuat data limit...");
      return;
    }
    const currentCount = assessments.length;
    const limit = userLimits.dasar?.limit;

    if (limit !== null && currentCount >= limit) {
      setLimitModal({
        isOpen: true,
        message: `Batas pembuatan Asesmen Dasar tercapai (${currentCount}/${limit}). Hubungi admin.`,
      });
    } else {
      navigate("/risk-management/dasar/new");
    }
  };

  // --- DEFINISI KOLOM TABEL YANG LEBIH MODERN ---
  const columns = [
    {
      key: "unit_kerja",
      header: "Unit Kerja",
      cell: (item) => (
        <div className="cursor-pointer group flex items-center gap-3" onClick={() => navigate(`/risk-management/dasar/edit/${item.id}`)}>
          {/* Ikon Avatar Singkat */}
          <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
            <FiBriefcase size={14} />
          </div>
          <div>
            <Text className="font-semibold text-tremor-content-strong group-hover:text-blue-600 transition-colors">{item.nama_unit_kerja}</Text>
          </div>
        </div>
      ),
    },
    {
      key: "perusahaan",
      header: "Perusahaan",
      cell: (item) => (
        <div className="flex items-center gap-2 text-gray-600">
          <FiHome className="w-4 h-4 text-gray-400" />
          <Text>{item.nama_perusahaan}</Text>
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
              navigate(`/risk-management/dasar/edit/${item.id}`);
            }}
            title="Edit"
          />
          <Button size="xs" variant="secondary" className="rounded-md" icon={FiDownload} loading={isExportingId === item.id} onClick={(e) => handleExportClick(e, item.id, item.nama_unit_kerja)} title="Export Excel" />
          <Button size="xs" variant="secondary" className="rounded-md" icon={FiTrash2} color="rose" onClick={(e) => openDeleteConfirm(e, item.id, item.nama_unit_kerja)} title="Hapus" />
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
            <FiLayers size={28} />
          </div>
          <div>
            <Title className="text-2xl text-slate-800">Asesmen Dasar</Title>
            <Text className="text-slate-500">Identifikasi dan analisis risiko tingkat dasar (Unit Kerja).</Text>
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
          <Button size="lg" icon={FiPlus} onClick={handleNewAssessmentClick} disabled={isLoading} className="shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all rounded-xl">
            Asesmen Baru
          </Button>
        </div>
      </div>

      {/* --- FILTER BAR (DIPERBARUI) --- */}
      <Card className="p-4 shadow-sm border border-gray-100 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          {/* Search Bar - Mengisi Sisa Ruang (flex-grow) */}
          <div className="relative flex-grow w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama unit kerja atau perusahaan..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort Dropdown - Di Ujung Kanan (Fixed Width) */}
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
          <AppResourceTable data={filteredAndSortedAssessments} isLoading={isLoading} columns={columns} emptyMessage="Belum ada asesmen dasar yang ditemukan." />
        </Card>
      ) : // Tampilan Grid (Card)
      isLoading ? (
        <div className="text-center py-20">
          <FiLoader className="animate-spin h-8 w-8 mx-auto text-gray-400" />
        </div>
      ) : filteredAndSortedAssessments.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-xl bg-white">
          <Text>Tidak ada asesmen dasar.</Text>
        </div>
      ) : (
        <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6">
          {filteredAndSortedAssessments.map((item) => (
            <Card key={item.id} className="flex flex-col hover:shadow-lg transition-shadow border-t-4 border-t-blue-500 cursor-pointer group h-full justify-between" onClick={() => navigate(`/risk-management/dasar/edit/${item.id}`)}>
              <div>
                <div className="flex items-start justify-between mb-2">
                  <Title className="text-lg font-bold group-hover:text-blue-600 transition-colors line-clamp-2">{item.nama_unit_kerja}</Title>
                  <div className="p-1.5 bg-blue-50 rounded text-blue-600">
                    <FiBriefcase size={14} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Text className="text-sm text-gray-500 flex items-center gap-2">
                    <FiHome size={14} className="text-gray-400" /> {item.nama_perusahaan}
                  </Text>
                  <Text className="text-xs text-gray-400 flex items-center gap-2">
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
                <Button size="xs" variant="light" icon={FiDownload} loading={isExportingId === item.id} onClick={(e) => handleExportClick(e, item.id, item.nama_unit_kerja)} />
                <Button size="xs" variant="light" color="rose" icon={FiTrash2} onClick={(e) => openDeleteConfirm(e, item.id, item.nama_unit_kerja)} />
              </div>
            </Card>
          ))}
        </Grid>
      )}

      {/* Modals - Code modals (Disclaimer, View, Delete, Limit) tetap sama */}
      <Dialog open={isDisclaimerOpen} onClose={() => setIsDisclaimerOpen(false)} static={true}>
        <DialogPanel className="max-w-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <FiInfo className="w-6 h-6 text-blue-600" />
            </div>
            <Title>Portofolio Uji Kompetensi</Title>
            <Text className="mt-1">Selamat datang di modul Asesmen Dasar.</Text>
          </div>
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-semibold text-tremor-content-strong">Tiga Tugas Utama</h3>
              <Text className="mt-1">Dalam pelatihan Risk Management Officer, Anda diharapkan mampu memetakan tiga hal berikut:</Text>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start">
                  <FiCheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" /> Konteks internal dan eksternal organisasi
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" /> Melakukan Identifikasi Risiko
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" /> Melakukan Analisis Risiko
                </li>
              </ul>
            </div>
            <hr />
            <div>
              <h3 className="font-semibold text-tremor-content-strong">Pemahaman Dasar</h3>
              <ul className="list-decimal list-inside mt-2 space-y-1 text-tremor-content text-sm">
                <li>Konteks adalah faktor-faktor yang mempengaruhi proses manajemen risiko.</li>
                <li>Identifikasi risiko adalah proses mendefinisikan potensi risiko.</li>
                <li>Analisis risiko adalah proses mengukur probabilitas dan dampak risiko.</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <Button onClick={() => setIsDisclaimerOpen(false)}>OK, Saya Mengerti</Button>
          </div>
        </DialogPanel>
      </Dialog>

      <Dialog open={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} static={true}>
        <DialogPanel className="w-full max-w-7xl h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl">
          <div className="bg-white p-6 border-b flex justify-between items-start flex-shrink-0 shadow-sm z-10">
            <div>
              <Title>Detail: {selectedAssessment?.nama_unit_kerja}</Title>
              <Text>{selectedAssessment?.nama_perusahaan}</Text>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={FiDownload} onClick={() => handleExportClick(null, selectedAssessment.id, selectedAssessment.nama_unit_kerja)}>
                Export Excel
              </Button>
              <Button variant="light" icon={FiMinimize} onClick={() => setIsViewModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
          <div ref={viewContentRef} className="flex-grow overflow-y-auto p-6 bg-slate-50">
            {isViewLoading ? <div className="text-center py-20">Memuat detail...</div> : <BasicAssessmentView assessmentData={selectedAssessment} />}
          </div>
        </DialogPanel>
      </Dialog>

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })}
        onConfirm={handleDeleteConfirm}
        title="Hapus Asesmen"
        message={`Yakin ingin menghapus "${deleteConfirmation.assessmentName}"?`}
        isLoading={isDeleting}
      />

      <NotificationModal isOpen={limitModal.isOpen} onClose={() => setLimitModal({ isOpen: false, message: "" })} title="Batas Kuota" message={limitModal.message} />
    </div>
  );
}

export default BasicAssessmentListPage;
