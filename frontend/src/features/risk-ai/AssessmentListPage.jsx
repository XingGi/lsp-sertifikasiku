// frontend/src/features/risk-ai/AssessmentListPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Title, Text, TextInput, Select, SelectItem, Button } from "@tremor/react";
import { FiPlus, FiGrid, FiList, FiSearch, FiTrash2, FiFilter, FiCpu, FiCheckSquare, FiSquare, FiCalendar, FiEye, FiAlertTriangle } from "react-icons/fi";
import apiClient from "../../api/api";
import AssessmentItem from "./components/AssessmentItem";
import { toast } from "sonner";
import NotificationModal from "../../components/common/NotificationModal";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import AppResourceTable from "../../components/common/AppResourceTable";
import { formatDate } from "../../utils/formatters";

// --- HELPER ---
const getLevelKeyByScore = (score) => {
  if (score >= 15) return "High";
  if (score >= 8) return "Moderate to High";
  if (score >= 4) return "Moderate";
  if (score >= 2) return "Low to Moderate";
  if (score > 0) return "Low";
  return null;
};

const riskLevelOptions = ["High", "Moderate to High", "Moderate", "Low to Moderate", "Low"];

function AssessmentListPage() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Filter & Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [industryOptions, setIndustryOptions] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("all");
  const [sortOption, setSortOption] = useState("newest"); // Tambahan State Sort

  // State UI
  const [viewMode, setViewMode] = useState("list");
  const [selectedAssessments, setSelectedAssessments] = useState([]);
  const [userLimits, setUserLimits] = useState(null);
  const [limitModal, setLimitModal] = useState({ isOpen: false, message: "" });

  // State Delete
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    isBulk: false,
    assessmentId: null,
    assessmentName: "",
    count: 0,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAssessmentsAndLimits = async () => {
    setIsLoading(true);
    try {
      const [assessmentRes, industryRes, limitsRes] = await Promise.all([apiClient.get("/assessments"), apiClient.get("/master-data?category=INDUSTRY"), apiClient.get("/account/details")]);
      setAssessments(assessmentRes.data);
      setIndustryOptions(industryRes.data);
      setUserLimits(limitsRes.data.assessment_limits);
    } catch (error) {
      console.error("Gagal memuat data:", error);
      toast.error("Gagal memuat data asesmen.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessmentsAndLimits();
  }, []);

  // --- LOGIKA FILTER & SORTING DIPERBARUI ---
  const filteredAndSortedAssessments = useMemo(() => {
    let result = [...assessments];

    // 1. Filter
    result = result.filter((assessment) => {
      const getHighestRiskLevel = (a) => {
        if (!a.risks || a.risks.length === 0) return null;
        const maxScore = Math.max(...a.risks.map((r) => (r.inherent_likelihood || 0) * (r.inherent_impact || 0)));
        return getLevelKeyByScore(maxScore);
      };

      const matchesSearch = assessment.nama_asesmen.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIndustry = selectedIndustry === "all" || assessment.company_industry === selectedIndustry;
      const matchesRiskLevel = selectedRiskLevel === "all" || getHighestRiskLevel(assessment) === selectedRiskLevel;

      return matchesSearch && matchesIndustry && matchesRiskLevel;
    });

    // 2. Sorting (Berdasarkan tanggal_mulai)
    result.sort((a, b) => {
      const dateA = new Date(a.tanggal_mulai || 0);
      const dateB = new Date(b.tanggal_mulai || 0);

      switch (sortOption) {
        case "newest":
          return dateB - dateA;
        case "oldest":
          return dateA - dateB;
        case "a-z":
          return a.nama_asesmen.localeCompare(b.nama_asesmen);
        case "z-a":
          return b.nama_asesmen.localeCompare(a.nama_asesmen);
        default:
          return 0;
      }
    });

    return result;
  }, [assessments, searchTerm, selectedIndustry, selectedRiskLevel, sortOption]);

  // Handlers Checkbox
  const handleSelect = (id) => {
    setSelectedAssessments((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (selectedAssessments.length === filteredAndSortedAssessments.length && filteredAndSortedAssessments.length > 0) {
      setSelectedAssessments([]);
    } else {
      setSelectedAssessments(filteredAndSortedAssessments.map((a) => a.id));
    }
  };

  const isAllSelected = filteredAndSortedAssessments.length > 0 && selectedAssessments.length === filteredAndSortedAssessments.length;

  // Handler Actions
  const handleNewAssessmentClick = () => {
    if (!userLimits) {
      toast.info("Sedang memuat data limit...");
      return;
    }
    const currentCount = assessments.length;
    const limit = userLimits.ai?.limit;

    if (limit !== null && currentCount >= limit) {
      setLimitModal({
        isOpen: true,
        message: `Batas pembuatan Asesmen AI tercapai (${currentCount}/${limit}). Hubungi admin.`,
      });
    } else {
      navigate("/risk-ai/assessment-studio");
    }
  };

  const openSingleDeleteConfirm = (id, name) => {
    setDeleteConfirm({ isOpen: true, isBulk: false, assessmentId: id, assessmentName: name, count: 1 });
  };

  const openBulkDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: true, isBulk: true, assessmentId: null, assessmentName: "", count: selectedAssessments.length });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteConfirm.isBulk) {
        await apiClient.post("/assessments/bulk-delete", { risk_ids: selectedAssessments });
        toast.success(`${selectedAssessments.length} asesmen berhasil dihapus.`);
        setSelectedAssessments([]);
      } else {
        await apiClient.delete(`/assessments/${deleteConfirm.assessmentId}`);
        toast.success(`Asesmen "${deleteConfirm.assessmentName}" berhasil dihapus.`);
      }
      setDeleteConfirm({ isOpen: false, isBulk: false, assessmentId: null, assessmentName: "", count: 0 });
      fetchAssessmentsAndLimits();
    } catch (error) {
      console.error("Gagal hapus:", error);
      toast.error("Gagal menghapus asesmen.");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- DEFINISI KOLOM TABEL (Updated: tanggal_mulai) ---
  const columns = [
    {
      key: "nama_asesmen",
      header: "Nama Asesmen",
      cell: (item) => {
        const industry = industryOptions.find((opt) => opt.key === item.company_industry);
        const industryName = industry ? industry.value : item.company_industry;
        return (
          <div className="cursor-pointer group flex items-center gap-3" onClick={() => navigate(`/risk-ai/assessments/${item.id}`)}>
            <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
              <FiCpu size={14} />
            </div>
            <div>
              <Text className="font-semibold text-tremor-content-strong group-hover:text-indigo-600 transition-colors">{item.nama_asesmen}</Text>
              <Text className="text-xs text-gray-400">{industryName}</Text>
            </div>
          </div>
        );
      },
    },
    {
      key: "tanggal_mulai",
      header: "Tanggal Mulai",
      cell: (item) => (
        <div className="flex items-center gap-2 text-gray-600">
          <FiCalendar className="w-4 h-4 text-gray-400" />
          <Text>{formatDate(item.tanggal_mulai) || "N/A"}</Text>
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
              navigate(`/risk-ai/assessments/${item.id}`);
            }}
            title="Lihat Detail"
          />
          <Button
            size="xs"
            variant="secondary"
            className="rounded-md"
            icon={FiTrash2}
            color="rose"
            onClick={(e) => {
              e.stopPropagation();
              openSingleDeleteConfirm(item.id, item.nama_asesmen);
            }}
            title="Hapus"
          />
        </div>
      ),
      className: "text-right w-32",
    },
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600 shadow-sm">
            <FiCpu size={28} />
          </div>
          <div>
            <Title className="text-2xl text-slate-800">Risk Management AI</Title>
            <Text className="text-slate-500">Kelola asesmen risiko cerdas dengan bantuan AI.</Text>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            size="lg"
            icon={viewMode === "list" ? FiGrid : FiList}
            variant="secondary"
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            title={viewMode === "list" ? "Tampilan Grid" : "Tampilan List"}
            className="shadow-sm border-gray-200 bg-white hover:bg-gray-50 rounded-xl"
          />
          <Button size="lg" icon={FiPlus} onClick={handleNewAssessmentClick} disabled={isLoading || !userLimits} className="shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all rounded-xl">
            Asesmen Baru
          </Button>
        </div>
      </div>

      {/* --- FILTER BAR (DIPERBARUI) --- */}
      <Card className="p-4 shadow-sm border border-gray-100 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama asesmen..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Industri */}
          <div className="md:col-span-3">
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry} icon={FiFilter} placeholder="Industri..." className="h-[42px]">
              <SelectItem value="all">Semua Industri</SelectItem>
              {industryOptions.map((opt) => (
                <SelectItem key={opt.key} value={opt.key}>
                  {opt.value}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Filter Risk Level */}
          <div className="md:col-span-2">
            <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel} icon={FiAlertTriangle} placeholder="Level..." className="h-[42px]">
              <SelectItem value="all">Semua</SelectItem>
              {riskLevelOptions.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Sort Options (BARU) */}
          <div className="md:col-span-2">
            <Select value={sortOption} onValueChange={setSortOption} icon={FiList} placeholder="Urutkan..." className="h-[42px]">
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="oldest">Terlama</SelectItem>
              <SelectItem value="a-z">Abjad A-Z</SelectItem>
              <SelectItem value="z-a">Abjad Z-A</SelectItem>
            </Select>
          </div>

          {/* Select All (Icon Button) */}
          <div className="md:col-span-1 flex justify-end">
            {selectedAssessments.length > 0 ? (
              <Button icon={FiTrash2} color="rose" variant="secondary" size="md" className="w-full" onClick={openBulkDeleteConfirm} title={`Hapus ${selectedAssessments.length} item`} />
            ) : (
              <button onClick={handleSelectAll} className="flex items-center justify-center w-full h-[42px] rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" title="Pilih Semua">
                {isAllSelected ? <FiCheckSquare size={20} className="text-indigo-600" /> : <FiSquare size={20} />}
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* --- CONTENT LIST --- */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <Text>Memuat data asesmen...</Text>
          </div>
        ) : filteredAndSortedAssessments.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-xl bg-white">
            <Text>Tidak ada asesmen yang cocok dengan filter.</Text>
          </div>
        ) : viewMode === "list" ? (
          // --- TAMPILAN TABEL ---
          <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl">
            <AppResourceTable data={filteredAndSortedAssessments} isLoading={isLoading} columns={columns} emptyMessage="Belum ada asesmen AI yang ditemukan." />
          </Card>
        ) : (
          // --- TAMPILAN GRID (KARTU) ---
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedAssessments.map((assessment) => {
              const industry = industryOptions.find((opt) => opt.key === assessment.company_industry);
              const industryName = industry ? industry.value : assessment.company_industry;

              return (
                <AssessmentItem
                  key={assessment.id}
                  assessment={assessment}
                  isSelected={selectedAssessments.includes(assessment.id)}
                  onSelect={handleSelect}
                  industryName={industryName}
                  onDelete={() => openSingleDeleteConfirm(assessment.id, assessment.nama_asesmen)}
                  isDeleting={isDeleting && !deleteConfirm.isBulk && deleteConfirm.assessmentId === assessment.id}
                  viewMode={viewMode}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      <NotificationModal isOpen={limitModal.isOpen} onClose={() => setLimitModal({ isOpen: false, message: "" })} title="Batas Kuota Tercapai" message={limitModal.message} />

      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirmation({ ...deleteConfirm, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={deleteConfirm.isBulk ? "Hapus Massal" : "Hapus Asesmen"}
        message={deleteConfirm.isBulk ? `Yakin ingin menghapus ${deleteConfirm.count} asesmen terpilih?` : `Yakin ingin menghapus "${deleteConfirm.assessmentName}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default AssessmentListPage;
