// frontend/src/features/admin/RscaAdminPage.jsx

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Title, Text, Button, Badge, Flex, Icon, TextInput, Select, SelectItem } from "@tremor/react";
import { FiPlus, FiEdit, FiSettings, FiEye, FiFileText, FiGrid, FiList, FiSearch, FiFilter, FiCalendar, FiCheckCircle, FiLoader } from "react-icons/fi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api/api";

// Components
import CreateCycleModal from "./components/rsca/CreateCycleModal";
import QuestionnaireEditor from "./components/rsca/QuestionnaireEditor";
import EditCycleModal from "./components/rsca/EditCycleModal";
import CycleCard from "./components/rsca/CycleCard";
import AppResourceTable from "../../components/common/AppResourceTable";
import { formatDate } from "../../utils/formatters";

// Fungsi fetcher
const fetchRscaCycles = async () => {
  const { data } = await apiClient.get("/admin/rsca-cycles");
  return data;
};

const getStatusBadgeColor = (status) => {
  switch (status) {
    case "Draft":
      return "slate";
    case "Berjalan":
      return "blue";
    case "Selesai":
      return "emerald";
    default:
      return "gray";
  }
};

function RscaAdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State UI
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // State Data Selection
  const [cycleToEdit, setCycleToEdit] = useState(null);
  const [cycleForQuestions, setCycleForQuestions] = useState(null);

  // State Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch Data
  const {
    data: cycles,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["rscaCyclesAdmin"],
    queryFn: fetchRscaCycles,
  });

  // --- LOGIC FILTERING (Client Side) ---
  const filteredCycles = useMemo(() => {
    if (!cycles) return [];
    return cycles.filter((cycle) => {
      const matchesSearch = cycle.nama_siklus.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || cycle.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [cycles, searchTerm, filterStatus]);

  // --- HANDLERS ---
  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setCycleToEdit(null);
  };

  const handleOpenEditModal = (cycle) => {
    setCycleToEdit(cycle);
    setIsEditModalOpen(true);
  };

  const handleEditSaveSuccess = (updatedCycle) => {
    queryClient.setQueryData(["rscaCyclesAdmin"], (oldData) => oldData.map((cycle) => (cycle.id === updatedCycle.id ? updatedCycle : cycle)));
  };

  const handleEditQuestions = (cycle) => {
    setCycleForQuestions(cycle);
  };

  const handleViewResults = (cycle) => {
    navigate(`/admin/rsca/results/${cycle.id}`);
  };

  // Jika sedang mode edit pertanyaan, render editor full page
  if (cycleForQuestions) {
    return <QuestionnaireEditor cycle={cycleForQuestions} onBack={() => setCycleForQuestions(null)} />;
  }

  // --- DEFINISI KOLOM TABEL (LIST VIEW MODERN) ---
  const columns = [
    {
      key: "nama_siklus",
      header: "Nama Siklus",
      cell: (item) => (
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => handleViewResults(item)}>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
            <FiFileText size={16} />
          </div>
          <Text className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{item.nama_siklus}</Text>
        </div>
      ),
    },
    {
      key: "periode",
      header: "Periode Pelaksanaan",
      cell: (item) => (
        <div className="text-xs text-gray-500">
          <div className="flex items-center gap-1.5 mb-1">
            <FiCalendar size={12} /> {formatDate(item.tanggal_mulai)}
          </div>
          <div className={`flex items-center gap-1.5 ${new Date(item.tanggal_selesai) < new Date() ? "text-red-500 font-medium" : ""}`}>
            <FiCalendar size={12} /> {formatDate(item.tanggal_selesai)}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item) => (
        <Badge size="xs" className="rounded-md px-2.5" color={getStatusBadgeColor(item.status)}>
          {item.status}
        </Badge>
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
            color="indigo"
            className="rounded-md"
            icon={FiSettings}
            onClick={(e) => {
              e.stopPropagation();
              handleEditQuestions(item);
            }}
            disabled={item.status !== "Draft"}
            title="Atur Kuesioner"
          />
          <Button
            size="xs"
            variant="secondary"
            color="orange"
            className="rounded-md"
            icon={FiEdit}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditModal(item);
            }}
            disabled={item.status !== "Draft"}
            title="Edit Info"
          />
          <Button
            size="xs"
            variant="secondary"
            color="blue"
            className="rounded-md"
            icon={FiEye}
            onClick={(e) => {
              e.stopPropagation();
              handleViewResults(item);
            }}
            title="Lihat Hasil"
          >
            Hasil
          </Button>
        </div>
      ),
      className: "text-right w-48",
    },
  ];

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
            <FiFileText size={28} />
          </div>
          <div>
            <Title className="text-2xl text-slate-800">Manajemen Siklus RSCA</Title>
            <Text className="text-slate-500">Buat, edit, dan pantau siklus penilaian risiko mandiri (RCSA).</Text>
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
          <Button size="lg" icon={FiPlus} onClick={() => setIsCreateModalOpen(true)} className="shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all rounded-xl">
            Buat Siklus Baru
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
              placeholder="Cari nama siklus..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-56 flex-shrink-0">
            <Select value={filterStatus} onValueChange={setFilterStatus} icon={FiFilter} placeholder="Filter Status..." className="h-[42px]">
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Berjalan">Berjalan</SelectItem>
              <SelectItem value="Selesai">Selesai</SelectItem>
            </Select>
          </div>
        </div>
      </Card>

      {/* --- CONTENT AREA --- */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="text-center py-20">
            <FiLoader className="animate-spin h-8 w-8 mx-auto text-gray-400" />
            <Text className="mt-2">Memuat siklus...</Text>
          </div>
        ) : filteredCycles.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-xl bg-white">
            <Text>Tidak ada siklus RSCA yang ditemukan.</Text>
            <Button variant="light" onClick={() => setIsCreateModalOpen(true)} className="mt-2">
              Buat Baru
            </Button>
          </div>
        ) : viewMode === "list" ? (
          // TAMPILAN LIST (TABLE)
          <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl">
            <AppResourceTable data={filteredCycles} isLoading={isLoading} columns={columns} emptyMessage="Tidak ada data." />
          </Card>
        ) : (
          // TAMPILAN GRID (CARDS)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCycles.map((cycle) => (
              <CycleCard key={cycle.id} cycle={cycle} onViewResults={handleViewResults} onEdit={handleOpenEditModal} onEditQuestions={handleEditQuestions} />
            ))}
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      <CreateCycleModal isOpen={isCreateModalOpen} onClose={handleCreateModalClose} />
      <EditCycleModal isOpen={isEditModalOpen} onClose={handleEditModalClose} cycleData={cycleToEdit} onSaveSuccess={handleEditSaveSuccess} />
    </div>
  );
}

export default RscaAdminPage;
