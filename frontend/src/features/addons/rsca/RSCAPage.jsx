// frontend/src/features/addons/rsca/RSCAPage.jsx

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/api";
import { Card, Title, Text, Badge, Button, Tab, TabGroup, TabList, TabPanel, TabPanels, Grid, TextInput, Select, SelectItem } from "@tremor/react";
import { FiFileText, FiEye, FiCheckCircle, FiLoader, FiGrid, FiList, FiCalendar, FiArchive, FiActivity, FiClock, FiCheckSquare, FiZap, FiSearch, FiFilter, FiArrowRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "../../../utils/formatters";
import AppResourceTable from "../../../components/common/AppResourceTable";

// --- API FETCHERS ---
const fetchMyTasks = async () => {
  const { data } = await apiClient.get("/my-rsca-tasks");
  return data;
};

const fetchMySubmissions = async () => {
  const { data } = await apiClient.get("/my-submitted-risks");
  return data;
};

const fetchMyActionPlans = async () => {
  const { data } = await apiClient.get("/my-action-plan-tasks");
  return data;
};

// --- HELPERS WARNA & STYLE ---
const getCycleStatusColor = (status) => {
  if (status === "Selesai") return "emerald";
  if (status === "Draft") return "slate";
  if (status === "Berjalan") return "blue";
  return "gray";
};

const getStatusBadgeColor = (status) => {
  switch (status) {
    case "Draft":
      return "slate";
    case "Submitted":
      return "blue";
    case "Approved":
      return "emerald";
    case "Rejected":
      return "rose";
    case "Done":
      return "emerald";
    case "In Progress":
      return "blue";
    case "Open":
      return "gray";
    default:
      return "gray";
  }
};

function RSCAPage() {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // Filter Status Global
  const navigate = useNavigate();

  // --- DATA QUERIES ---
  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["myRscaTasks"],
    queryFn: fetchMyTasks,
  });

  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ["mySubmittedRisks"],
    queryFn: fetchMySubmissions,
  });

  const { data: actionPlans, isLoading: isLoadingActionPlans } = useQuery({
    queryKey: ["myActionPlanTasks"],
    queryFn: fetchMyActionPlans,
  });

  const handleViewTask = (taskId) => {
    navigate(`/addons/rsca/cycle/${taskId}`);
  };

  // --- FILTER LOGIC ---
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((item) => item.nama_siklus.toLowerCase().includes(searchTerm.toLowerCase()) && (filterStatus === "all" || item.status === filterStatus));
  }, [tasks, searchTerm, filterStatus]);

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    return submissions.filter((item) => (item.risk_description || "").toLowerCase().includes(searchTerm.toLowerCase()) && (filterStatus === "all" || item.status === filterStatus));
  }, [submissions, searchTerm, filterStatus]);

  const filteredActionPlans = useMemo(() => {
    if (!actionPlans) return [];
    return actionPlans.filter((item) => (item.action_description || "").toLowerCase().includes(searchTerm.toLowerCase()) && (filterStatus === "all" || item.status === filterStatus));
  }, [actionPlans, searchTerm, filterStatus]);

  // --- DEFINISI KOLOM TABEL (LIST VIEW) ---

  // 1. Kolom Tugas Kuesioner
  const taskColumns = [
    {
      key: "nama_siklus",
      header: "Nama Siklus",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FiFileText />
          </div>
          <div>
            <Text className="font-semibold text-slate-700">{item.nama_siklus}</Text>
            <Text className="text-xs text-gray-400">
              {formatDate(item.tanggal_mulai)} - {formatDate(item.tanggal_selesai)}
            </Text>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item) => (
        <Badge size="xs" className="rounded-md px-2" color={getCycleStatusColor(item.status)}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      cell: (item) => (
        <div className="flex justify-end">
          <Button size="xs" variant="secondary" icon={FiArrowRight} iconPosition="right" onClick={() => handleViewTask(item.id)}>
            Buka
          </Button>
        </div>
      ),
      className: "text-right w-32", // Sejajarkan Header ke Kanan
    },
  ];

  // 2. Kolom Ajuan Risiko
  const submissionColumns = [
    {
      key: "description",
      header: "Detail Risiko",
      cell: (risk) => (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg mt-1">
            <FiArchive size={14} />
          </div>
          <div className="max-w-md">
            <Text className="font-semibold text-slate-800 mb-1 line-clamp-2">{risk.risk_description}</Text>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="font-medium">Penyebab:</span> {risk.potential_cause || "-"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "cycle",
      header: "Siklus",
      cell: (risk) => <Text className="text-sm text-gray-600">{risk.cycle_name}</Text>,
    },
    {
      key: "status",
      header: "Status",
      cell: (risk) => (
        <Badge size="xs" className="rounded-md px-2" color={getStatusBadgeColor(risk.status)}>
          {risk.status}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Tanggal",
      cell: (risk) => <Text className="text-xs text-gray-500 text-right">{formatDate(risk.created_at)}</Text>,
      className: "text-right w-32",
    },
  ];

  // 3. Kolom Tugas Mitigasi
  const actionPlanColumns = [
    {
      key: "description",
      header: "Deskripsi Tugas",
      cell: (plan) => (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg mt-1">
            <FiActivity size={14} />
          </div>
          <div className="max-w-md">
            <Text className="font-semibold text-slate-800 mb-1 line-clamp-2">{plan.action_description}</Text>
            <Text className="text-xs text-gray-500 line-clamp-1">Sumber: {plan.source_text}</Text>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (plan) => (
        <Badge size="xs" className="rounded-full px-2" color={getStatusBadgeColor(plan.status)}>
          {plan.status}
        </Badge>
      ),
    },
    {
      key: "due_date",
      header: "Tenggat Waktu",
      cell: (plan) => {
        const isOverdue = plan.due_date && new Date(plan.due_date) < new Date();
        return <div className={`text-right text-xs ${isOverdue ? "text-red-600 font-bold" : "text-gray-600"}`}>{formatDate(plan.due_date)}</div>;
      },
      className: "text-right w-32",
    },
  ];

  // --- RENDER CONTENT HELPERS ---

  const renderTasksGrid = () => {
    if (isLoadingTasks) return <LoadingState text="Memuat tugas kuesioner..." />;
    if (!filteredTasks?.length) return <EmptyState title="Tidak ada tugas" desc="Tidak ada tugas kuesioner yang cocok dengan filter." />;

    return (
      <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="flex flex-col h-full hover:shadow-lg transition-all border-t-4 border-t-blue-500 p-0 overflow-hidden group cursor-pointer" onClick={() => handleViewTask(task.id)}>
            <div className="p-5 flex-grow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                    <FiFileText />
                  </div>
                  <Text className="text-xs font-bold text-blue-600 uppercase tracking-wider">Kuesioner</Text>
                </div>
                <Badge size="xs" className="rounded-md px-2" color={getCycleStatusColor(task.status)}>
                  {task.status}
                </Badge>
              </div>
              <Title className="text-lg font-bold text-slate-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">{task.nama_siklus}</Title>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs border-b border-gray-50 pb-1">
                  <span className="text-gray-500">Mulai</span>
                  <span className="font-medium text-slate-700">{formatDate(task.tanggal_mulai)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Selesai</span>
                  <span className={`font-medium ${new Date(task.tanggal_selesai) < new Date() ? "text-red-600" : "text-slate-700"}`}>{formatDate(task.tanggal_selesai)}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
              <Button
                size="xs"
                variant="light"
                icon={FiArrowRight}
                iconPosition="right"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewTask(task.id);
                }}
              >
                Buka
              </Button>
            </div>
          </Card>
        ))}
      </Grid>
    );
  };

  const renderSubmissionsGrid = () => {
    if (isLoadingSubmissions) return <LoadingState text="Memuat ajuan risiko..." />;
    if (!filteredSubmissions?.length) return <EmptyState title="Tidak ada ajuan" desc="Belum ada risiko yang diajukan." />;

    return (
      <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6">
        {filteredSubmissions.map((risk, idx) => (
          <Card key={idx} className="flex flex-col h-full hover:shadow-md transition-all border-t-4 border-t-purple-500 p-5">
            <div className="flex justify-between items-start mb-3">
              <Badge size="xs" className="rounded-md px-2" color={getStatusBadgeColor(risk.status)}>
                {risk.status}
              </Badge>
              <Text className="text-xs text-gray-400">{formatDate(risk.created_at)}</Text>
            </div>
            <div className="mb-4 flex-grow">
              <div className="flex items-start gap-2 mb-2">
                <FiArchive className="text-purple-500 mt-1 shrink-0" size={16} />
                <Text className="font-bold text-slate-700 line-clamp-2">{risk.risk_description}</Text>
              </div>
              <Text className="text-xs text-gray-500 bg-purple-50 p-2 rounded border border-purple-100 line-clamp-2">Penyebab: {risk.potential_cause || "-"}</Text>
            </div>
            <div className="pt-3 border-t border-gray-100 mt-auto">
              <Text className="text-xs text-gray-400 flex items-center gap-1">
                <FiZap size={12} /> Siklus: {risk.cycle_name}
              </Text>
            </div>
          </Card>
        ))}
      </Grid>
    );
  };

  const renderActionPlansGrid = () => {
    if (isLoadingActionPlans) return <LoadingState text="Memuat tugas mitigasi..." />;
    if (!filteredActionPlans?.length) return <EmptyState title="Tidak ada mitigasi" desc="Tidak ada tugas mitigasi aktif." />;

    return (
      <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6">
        {filteredActionPlans.map((plan, idx) => {
          const isOverdue = plan.due_date && new Date(plan.due_date) < new Date();
          return (
            <Card key={idx} className="flex flex-col h-full hover:shadow-md transition-all border-t-4 border-t-emerald-500 p-5">
              <div className="flex justify-between items-start mb-3">
                <Badge size="xs" className="rounded-md px-2" color={getStatusBadgeColor(plan.status)}>
                  {plan.status}
                </Badge>
                <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-600 font-bold" : "text-gray-400"}`}>
                  <FiClock size={12} /> {formatDate(plan.due_date)}
                </div>
              </div>
              <div className="mb-4 flex-grow">
                <Text className="font-bold text-slate-700 mb-2 line-clamp-3">{plan.action_description}</Text>
                <Text className="text-xs text-gray-500">Sumber Masalah:</Text>
                <Text className="text-xs text-slate-600 bg-gray-50 p-1.5 rounded border border-gray-100 mt-1 line-clamp-2">{plan.source_text}</Text>
              </div>
              <Button size="xs" variant="secondary" color="blue" className="w-full mt-auto rounded-md">
                Update Status
              </Button>
            </Card>
          );
        })}
      </Grid>
    );
  };

  // --- COMPONENTS ---
  const LoadingState = ({ text }) => (
    <div className="text-center py-20">
      <FiLoader className="animate-spin h-8 w-8 mx-auto text-gray-400 mb-3" />
      <Text>{text}</Text>
    </div>
  );

  const EmptyState = ({ title, desc }) => (
    <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      <div className="mx-auto w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-3 text-gray-400 shadow-sm">
        <FiCheckCircle size={24} />
      </div>
      <Text className="font-bold text-slate-700">{title}</Text>
      <Text className="text-sm text-gray-500">{desc}</Text>
    </div>
  );

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-xl text-orange-600 shadow-sm">
            <FiCheckSquare size={28} />
          </div>
          <div>
            <Title className="text-2xl text-slate-800">Control Self-Assessment</Title>
            <Text className="text-slate-500">Kelola kuesioner, ajuan risiko, dan mitigasi mandiri (RCSA).</Text>
          </div>
        </div>
        {/* Global View Toggle */}
        <Button
          size="lg"
          variant="secondary"
          icon={viewMode === "list" ? FiGrid : FiList}
          onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
          title={viewMode === "list" ? "Tampilan Grid" : "Tampilan List"}
          className="shadow-sm border-gray-200 bg-white hover:bg-gray-50 rounded-xl"
        />
      </div>

      {/* --- FILTER BAR (BARU) --- */}
      <Card className="p-4 shadow-sm border border-gray-100 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          <div className="relative flex-grow w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari tugas, risiko, atau mitigasi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-56 flex-shrink-0">
            <Select value={filterStatus} onValueChange={setFilterStatus} icon={FiFilter} placeholder="Filter Status..." className="h-[42px]">
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Berjalan">Berjalan / In Progress</SelectItem>
              <SelectItem value="Draft">Draft / Open</SelectItem>
              <SelectItem value="Selesai">Selesai / Done</SelectItem>
            </Select>
          </div>
        </div>
      </Card>

      {/* --- TABS UTAMA --- */}
      <TabGroup>
        <TabList variant="line" defaultValue="1" className="mb-6 border-b border-gray-200">
          <Tab value="1" icon={FiFileText}>
            Tugas Kuesioner ({tasks?.length || 0})
          </Tab>
          <Tab value="2" icon={FiArchive}>
            Ajuan Risiko Saya ({submissions?.length || 0})
          </Tab>
          <Tab value="3" icon={FiActivity}>
            Tugas Mitigasi ({actionPlans?.length || 0})
          </Tab>
        </TabList>

        <TabPanels>
          {/* PANEL 1: TUGAS KUESIONER */}
          <TabPanel>
            {viewMode === "list" ? (
              <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl">
                <AppResourceTable data={filteredTasks} isLoading={isLoadingTasks} columns={taskColumns} emptyMessage="Tidak ada tugas kuesioner yang cocok." />
              </Card>
            ) : (
              renderTasksGrid()
            )}
          </TabPanel>

          {/* PANEL 2: AJUAN RISIKO */}
          <TabPanel>
            {viewMode === "list" ? (
              <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl">
                <AppResourceTable data={filteredSubmissions} isLoading={isLoadingSubmissions} columns={submissionColumns} emptyMessage="Tidak ada ajuan risiko yang cocok." />
              </Card>
            ) : (
              renderSubmissionsGrid()
            )}
          </TabPanel>

          {/* PANEL 3: TUGAS MITIGASI */}
          <TabPanel>
            {viewMode === "list" ? (
              <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl">
                <AppResourceTable data={filteredActionPlans} isLoading={isLoadingActionPlans} columns={actionPlanColumns} emptyMessage="Tidak ada tugas mitigasi yang cocok." />
              </Card>
            ) : (
              renderActionPlansGrid()
            )}
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}

export default RSCAPage;
