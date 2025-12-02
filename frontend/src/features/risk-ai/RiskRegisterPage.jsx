// frontend/src/features/risk-ai/RiskRegisterPage.jsx

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, Title, Text, Badge, Button, TextInput, Select, SelectItem } from "@tremor/react";
import { FiSearch, FiUpload, FiDownload, FiMaximize, FiMinimize, FiTrash2, FiDatabase, FiFilter, FiList } from "react-icons/fi";
import apiClient from "../../api/api";
import MainRiskRegisterTable from "./components/MainRiskRegisterTable";
import EditRiskItemSidebar from "./components/EditRiskItemSidebar";
import { toast } from "sonner";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";

function RiskRegisterPage() {
  const [risks, setRisks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("date-desc");

  const [selectedRisks, setSelectedRisks] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const tableCardRef = useRef(null);
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState(null);

  // State untuk Delete Confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, isBulk: false });

  const fetchData = () => {
    setIsLoading(true);
    apiClient
      .get("/risk-register")
      .then((response) => {
        setRisks(response.data);
      })
      .catch((error) => {
        console.error("Gagal memuat risk register:", error);
        toast.error("Gagal memuat data risiko.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const sortedAndFilteredRisks = useMemo(() => {
    let filtered = risks.filter(
      (risk) =>
        (risk.deskripsi_risiko || "").toLowerCase().includes(searchTerm.toLowerCase()) || (risk.kode_risiko || "").toLowerCase().includes(searchTerm.toLowerCase()) || (risk.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortOption) {
      case "level-desc":
        return filtered.sort((a, b) => b.inherent_likelihood * b.inherent_impact - a.inherent_likelihood * a.inherent_impact);
      case "level-asc":
        return filtered.sort((a, b) => a.inherent_likelihood * a.inherent_impact - b.inherent_likelihood * b.inherent_impact);
      case "date-asc":
        return filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case "title-asc":
        return filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      default: // date-desc
        return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }, [risks, searchTerm, sortOption]);

  const handleSelectRow = (id) => {
    setSelectedRisks((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRisks(sortedAndFilteredRisks.map((r) => r.id));
    } else {
      setSelectedRisks([]);
    }
  };

  const isAllSelected = sortedAndFilteredRisks.length > 0 && selectedRisks.length === sortedAndFilteredRisks.length;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      tableCardRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleEdit = (risk) => {
    setEditingRisk(risk);
    setIsEditSidebarOpen(true);
  };

  // --- Delete Handlers ---
  const handleDeleteClick = (id) => setDeleteConfirm({ isOpen: true, id, isBulk: false });
  const handleBulkDeleteClick = () => setDeleteConfirm({ isOpen: true, id: null, isBulk: true });

  const handleConfirmDelete = async () => {
    if (deleteConfirm.isBulk) {
      try {
        await apiClient.post("/risk-register/bulk-delete", { risk_ids: selectedRisks });
        toast.success(`${selectedRisks.length} risiko berhasil dihapus.`);
        setSelectedRisks([]);
        fetchData();
      } catch (error) {
        toast.error("Gagal menghapus risiko terpilih.");
      }
    } else {
      try {
        await apiClient.delete(`/risk-register/${deleteConfirm.id}`);
        toast.success("Risiko berhasil dihapus.");
        fetchData();
      } catch (error) {
        toast.error("Gagal menghapus risiko.");
      }
    }
    setDeleteConfirm({ isOpen: false, id: null, isBulk: false });
  };

  const handleSave = async (updatedRisk) => {
    try {
      await apiClient.put(`/risk-register/${updatedRisk.id}`, updatedRisk);
      toast.success("Perubahan berhasil disimpan.");
      fetchData();
      setIsEditSidebarOpen(false);
    } catch (err) {
      toast.error("Gagal menyimpan perubahan.");
    }
  };

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-100 rounded-xl text-rose-600 shadow-sm">
            <FiDatabase size={28} />
          </div>
          <div>
            <Title className="text-2xl text-slate-800">Risk Register Utama</Title>
            <Text className="text-slate-500">Database terpusat seluruh risiko organisasi.</Text>
          </div>
        </div>
      </div>

      {/* --- FILTER BAR --- */}
      <Card className="p-4 shadow-sm border border-gray-100 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Kiri: Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kode, judul, atau deskripsi..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={sortOption} onValueChange={setSortOption} icon={FiFilter} placeholder="Urutkan..." className="h-[38px]">
                <SelectItem value="date-desc">Terbaru</SelectItem>
                <SelectItem value="date-asc">Terlama</SelectItem>
                <SelectItem value="level-desc">Risk Level (High-Low)</SelectItem>
                <SelectItem value="level-asc">Risk Level (Low-High)</SelectItem>
                <SelectItem value="title-asc">Judul (A-Z)</SelectItem>
              </Select>
            </div>
          </div>

          {/* Kanan: Actions */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            {selectedRisks.length > 0 && (
              <Button icon={FiTrash2} color="rose" variant="secondary" onClick={handleBulkDeleteClick} size="sm">
                Hapus ({selectedRisks.length})
              </Button>
            )}
            <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>
            <Button variant="secondary" icon={FiUpload} disabled size="sm">
              Import
            </Button>
            <Button variant="secondary" icon={FiDownload} disabled size="sm">
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* --- MAIN TABLE CARD --- */}
      <div ref={tableCardRef} className={`transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-50 bg-slate-50 p-6 overflow-auto" : ""}`}>
        <Card className="border-t-4 border-rose-500 shadow-md ring-1 ring-gray-100 h-full flex flex-col p-0 overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <div className="flex items-center gap-2">
              <FiList className="text-rose-500" />
              <Title className="text-base">Daftar Risiko</Title>
              <Badge size="xs" color="slate" className="ml-2">
                {sortedAndFilteredRisks.length} Item
              </Badge>
            </div>
            <Button size="xs" variant="light" icon={isFullscreen ? FiMinimize : FiMaximize} onClick={toggleFullscreen} title="Fullscreen" />
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto bg-white min-h-[500px]">
            {isLoading ? (
              <div className="flex justify-center items-center h-64 text-gray-500">Memuat data...</div>
            ) : (
              <MainRiskRegisterTable
                risks={sortedAndFilteredRisks}
                selectedRisks={selectedRisks}
                onSelectRow={handleSelectRow}
                onEdit={handleEdit}
                onDelete={handleDeleteClick} // Pass handler baru
                isAllSelected={isAllSelected}
                onSelectAll={handleSelectAll}
              />
            )}
          </div>
        </Card>
      </div>

      {/* --- MODALS & SIDEBAR --- */}
      <EditRiskItemSidebar isOpen={isEditSidebarOpen} onClose={() => setIsEditSidebarOpen(false)} risk={editingRisk} onSave={handleSave} />

      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={deleteConfirm.isBulk ? "Hapus Massal" : "Hapus Risiko"}
        message={deleteConfirm.isBulk ? `Yakin ingin menghapus ${selectedRisks.length} risiko terpilih?` : "Yakin ingin menghapus risiko ini dari register utama?"}
      />
    </div>
  );
}

export default RiskRegisterPage;
