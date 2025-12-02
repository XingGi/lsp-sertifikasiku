// frontend/src/features/admin/ActionPlanMonitorPage.jsx

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api/api";
import { Card, Title, Text, Badge, Button, Flex, Icon, TextInput, Select, SelectItem, Grid } from "@tremor/react";
import { FiActivity, FiLoader, FiAlertTriangle, FiCheckCircle, FiSearch, FiFilter, FiEye, FiClock, FiArrowRight, FiGrid, FiList, FiUser, FiCalendar } from "react-icons/fi";
import ActionPlanDetailModal from "./components/rsca/ActionPlanDetailModal";
import { formatDate } from "../../utils/formatters";
import AppResourceTable from "../../components/common/AppResourceTable";

// Fetcher
const fetchActionPlans = async () => {
  const { data } = await apiClient.get("/admin/action-plans");
  return data;
};

// Helper Warna Status
const getStatusBadgeColor = (status) => {
  switch (status) {
    case "Belum Mulai":
      return "slate";
    case "Sedang Dikerjakan":
      return "blue";
    case "Selesai":
      return "emerald";
    default:
      return "gray";
  }
};

function ActionPlanMonitorPage() {
  const queryClient = useQueryClient();

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // State Toggle Grid/List

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOption, setSortOption] = useState("date-asc");

  const { data: plans, isLoading } = useQuery({
    queryKey: ["allActionPlans"],
    queryFn: fetchActionPlans,
  });

  // --- LOGIC SUMBER MASALAH ---
  const getSourceText = (plan) => {
    if (plan.source_text) return plan.source_text;
    if (plan.origin_answer?.questionnaire?.pertanyaan) {
      return `Pertanyaan: "${plan.origin_answer.questionnaire.pertanyaan}"`;
    }
    if (plan.origin_submitted_risk?.risk_description) {
      return `Ajuan Risiko: "${plan.origin_submitted_risk.risk_description}"`;
    }
    if (plan.origin_answer_id) return `Jawaban Kuesioner #${plan.origin_answer_id}`;
    if (plan.origin_submitted_risk_id) return `Ajuan Risiko #${plan.origin_submitted_risk_id}`;
    return "-";
  };

  // --- FILTERING & SORTING ---
  const filteredAndSortedPlans = useMemo(() => {
    if (!plans) return [];

    let result = plans.filter((plan) => {
      const term = searchTerm.toLowerCase();
      const descMatch = (plan.action_description || "").toLowerCase().includes(term);
      const deptMatch = (plan.assigned_department?.name || "").toLowerCase().includes(term);
      const sourceMatch = getSourceText(plan).toLowerCase().includes(term);

      const statusMatch = filterStatus === "all" || plan.status === filterStatus;

      return (descMatch || deptMatch || sourceMatch) && statusMatch;
    });

    result.sort((a, b) => {
      switch (sortOption) {
        case "date-asc":
          return new Date(a.due_date || "9999-12-31") - new Date(b.due_date || "9999-12-31");
        case "date-desc":
          return new Date(b.due_date || "9999-12-31") - new Date(a.due_date || "9999-12-31");
        case "status":
          return (a.status || "").localeCompare(b.status || "");
        default:
          return 0;
      }
    });
    return result;
  }, [plans, searchTerm, filterStatus, sortOption]);

  // Handlers
  const openModal = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedPlan(null);
    setIsModalOpen(false);
  };

  const handleSaveSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["allActionPlans"] });
  };

  // Definisi Kolom Tabel (List View)
  const columns = [
    {
      key: "description",
      header: "Rencana Aksi",
      cell: (plan) => (
        <div className="max-w-md">
          <Text className="font-bold text-slate-700 mb-1 line-clamp-2" title={plan.action_description}>
            {plan.action_description}
          </Text>
          <div className="text-xs text-gray-500 flex items-start gap-1 mt-1 bg-gray-50 p-1.5 rounded border border-gray-100">
            <FiAlertTriangle size={10} className="mt-0.5 shrink-0 text-amber-500" />
            <span className="line-clamp-2" title={getSourceText(plan)}>
              Sumber: {getSourceText(plan)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "assignee",
      header: "Penanggung Jawab",
      cell: (plan) => (
        <Badge size="xs" color="slate" className="rounded-md px-2.5">
          {plan.assigned_department?.name || "Unassigned"}
        </Badge>
      ),
    },
    {
      key: "due_date",
      header: "Tenggat",
      cell: (plan) => {
        const isOverdue = plan.due_date && new Date(plan.due_date) < new Date() && plan.status !== "Selesai";
        return (
          <div className={`flex items-center gap-2 text-xs ${isOverdue ? "text-red-600 font-bold" : "text-gray-600"}`}>
            <FiClock size={14} /> {formatDate(plan.due_date)}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (plan) => (
        <Badge size="xs" className="rounded-md px-2.5" color={getStatusBadgeColor(plan.status)}>
          {plan.status || "Belum Mulai"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (plan) => (
        <div className="flex justify-end">
          <Button variant="secondary" className="text-white bg-blue-300 hover:bg-blue-500 rounded-md" size="xs" icon={FiEye} onClick={() => openModal(plan)}>
            Detail
          </Button>
        </div>
      ),
      className: "text-right w-32",
    },
  ];

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 shadow-sm">
            <FiActivity size={28} />
          </div>
          <div>
            <Title className="text-2xl text-slate-800">Pemantauan Mitigasi</Title>
            <Text className="text-slate-500">Monitor progres rencana aksi dan perbaikan risiko.</Text>
          </div>
        </div>
        {/* View Toggle Button */}
        <Button
          size="lg"
          variant="secondary"
          icon={viewMode === "list" ? FiGrid : FiList}
          onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
          title={viewMode === "list" ? "Tampilan Grid" : "Tampilan List"}
          className="shadow-sm border-gray-200 bg-white hover:bg-gray-50 rounded-xl"
        />
      </div>

      {/* --- FILTER BAR --- */}
      <Card className="p-4 shadow-sm border border-gray-100 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          <div className="relative flex-grow w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari deskripsi, departemen, atau sumber masalah..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64 flex-shrink-0">
            <Select value={filterStatus} onValueChange={setFilterStatus} icon={FiFilter} placeholder="Filter Status..." className="h-[42px]">
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Belum Mulai">Belum Mulai</SelectItem>
              <SelectItem value="Sedang Dikerjakan">Sedang Dikerjakan</SelectItem>
              <SelectItem value="Selesai">Selesai</SelectItem>
            </Select>
          </div>
          <div className="w-full md:w-64 flex-shrink-0">
            <Select value={sortOption} onValueChange={setSortOption} icon={FiClock} placeholder="Urutkan..." className="h-[42px]">
              <SelectItem value="date-asc">Tenggat Terdekat</SelectItem>
              <SelectItem value="date-desc">Tenggat Terjauh</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </Select>
          </div>
        </div>
      </Card>

      {/* --- CONTENT --- */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="text-center py-20">
            <FiLoader className="animate-spin h-8 w-8 mx-auto text-gray-400" />
            <Text className="mt-2">Memuat rencana aksi...</Text>
          </div>
        ) : filteredAndSortedPlans.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-xl bg-white">
            <Text>Tidak ada rencana aksi yang cocok.</Text>
          </div>
        ) : viewMode === "list" ? (
          // LIST VIEW
          <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl">
            <AppResourceTable data={filteredAndSortedPlans} isLoading={isLoading} columns={columns} emptyMessage="Belum ada rencana aksi." />
          </Card>
        ) : (
          // GRID VIEW
          <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6">
            {filteredAndSortedPlans.map((plan) => {
              const isOverdue = plan.due_date && new Date(plan.due_date) < new Date() && plan.status !== "Selesai";
              return (
                <Card key={plan.id} className="flex flex-col h-full hover:shadow-lg transition-all border-l-4 border-l-emerald-500 p-0 overflow-hidden group cursor-default">
                  <div className="p-5 flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <Badge size="xs" className="rounded-full px-2.5" color={getStatusBadgeColor(plan.status)}>
                        {plan.status}
                      </Badge>
                      {plan.due_date && (
                        <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-600 font-bold" : "text-gray-400"}`}>
                          <FiClock size={12} /> {formatDate(plan.due_date)}
                        </div>
                      )}
                    </div>

                    <Text className="font-bold text-slate-800 line-clamp-3 mb-3" title={plan.action_description}>
                      {plan.action_description}
                    </Text>

                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 mb-3">
                      <div className="flex items-center gap-1 font-medium text-slate-600 mb-1">
                        <FiAlertTriangle size={10} /> Sumber Masalah:
                      </div>
                      <div className="line-clamp-2 italic">{getSourceText(plan)}</div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FiUser size={12} /> {plan.assigned_department?.name || "Unassigned"}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <Button size="xs" className="text-white rounded-md bg-blue-300 hover:bg-blue-500" variant="secondary" icon={FiEye} onClick={() => openModal(plan)}>
                      Detail / Update
                    </Button>
                  </div>
                </Card>
              );
            })}
          </Grid>
        )}
      </div>

      <ActionPlanDetailModal isOpen={isModalOpen} onClose={handleModalClose} plan={selectedPlan} onSaveSuccess={handleSaveSuccess} />
    </div>
  );
}

export default ActionPlanMonitorPage;
