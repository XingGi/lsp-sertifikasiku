// frontend/src/features/addons/bpr/BPRPage.jsx

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Title, Text, Button, Badge, Grid, Metric, Select, SelectItem } from "@tremor/react";
import { FiPlus, FiGitMerge, FiCopy, FiSearch, FiFilter, FiClock, FiCheckCircle, FiEdit3, FiFileText, FiActivity, FiGrid, FiList, FiArrowRight, FiBriefcase } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/api";
import CreateBPRModal from "./components/CreateBPRModal";
import { formatDate } from "../../../utils/formatters";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";
import { motion } from "framer-motion";
import AppResourceTable from "../../../components/common/AppResourceTable";
import { Dialog, DialogPanel, TextInput } from "@tremor/react";

// --- FETCHERS ---
const fetchBprList = async () => {
  const { data } = await apiClient.get("/bpr/documents");
  return data;
};

// --- HELPERS ---
const getStatusColor = (status) => {
  switch (status) {
    case "Draft":
      return "slate";
    case "In Review":
      return "orange";
    case "Final":
      return "emerald";
    case "Archived":
      return "stone";
    default:
      return "gray";
  }
};

// --- MODAL RE-EVALUATE (TETAP) ---
const ReevaluateModal = ({ isOpen, onClose, sourceDoc, onConfirm }) => {
  const [newPeriod, setNewPeriod] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newPeriod) return;
    setIsLoading(true);
    try {
      await onConfirm(sourceDoc.id, newPeriod);
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => !isLoading && onClose()} static={true}>
      <DialogPanel>
        <Title>Re-evaluate Proses: {sourceDoc?.name}</Title>
        <Text className="mt-2">Duplikasi proses (Versi {sourceDoc?.version}) untuk periode baru.</Text>
        <div className="mt-4">
          <label className="text-sm font-medium">Periode Baru</label>
          <TextInput placeholder="Contoh: 2025-Q2" value={newPeriod} onValueChange={setNewPeriod} className="mt-1" />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button icon={FiCopy} onClick={handleSubmit} loading={isLoading}>
            Kloning
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

function BPRPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State UI
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // Default Grid

  // State Filter
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // State Re-evaluate
  const [isReevaluateModalOpen, setIsReevaluateModalOpen] = useState(false);
  const [selectedDocForClone, setSelectedDocForClone] = useState(null);

  const canCreate = user?.permissions?.includes("approve_bpr") || user?.role === "admin";

  const {
    data: bprList = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["bprDocuments"],
    queryFn: fetchBprList,
  });

  // Logic Filter
  const filteredList = useMemo(() => {
    return bprList.filter((doc) => {
      const matchPeriod = filterPeriod === "all" || doc.period === filterPeriod;
      const matchStatus = filterStatus === "all" || doc.status === filterStatus;
      const matchSearch = searchQuery ? doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || doc.department_name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      return matchPeriod && matchStatus && matchSearch;
    });
  }, [bprList, filterPeriod, filterStatus, searchQuery]);

  const uniquePeriods = useMemo(() => [...new Set(bprList.map((d) => d.period))], [bprList]);

  const handleReevaluateClick = (e, doc) => {
    e?.stopPropagation();
    setSelectedDocForClone(doc);
    setIsReevaluateModalOpen(true);
  };

  const processReevaluate = async (docId, newPeriod) => {
    try {
      const res = await apiClient.post(`/bpr/documents/${docId}/clone`, { period: newPeriod });
      toast.success("Proses berhasil dikloning!");
      refetch();
      navigate(`/addons/bpr/${res.data.new_id}`);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengkloning proses.");
    }
  };

  // Stats
  const stats = {
    total: filteredList.length,
    final: filteredList.filter((d) => d.status === "Final").length,
    review: filteredList.filter((d) => d.status === "In Review").length,
  };

  // Definisi Kolom Tabel (List View)
  const columns = [
    {
      key: "name",
      header: "Nama Proses",
      cell: (item) => (
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate(`/addons/bpr/${item.id}`)}>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
            <FiFileText />
          </div>
          <div>
            <Text className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{item.name}</Text>
            <Text className="text-xs text-gray-400">Versi {item.version}</Text>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      header: "Departemen",
      cell: (item) => <Text>{item.department_name}</Text>,
    },
    {
      key: "period",
      header: "Periode",
      cell: (item) => (
        <Badge size="xs" className="rounded-md" color="slate">
          {item.period}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item) => (
        <Badge size="xs" className="rounded-md px-2.5" color={getStatusColor(item.status)}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: "updated_at",
      header: "Terakhir Update",
      cell: (item) => (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <FiClock size={12} /> {formatDate(item.updated_at)}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (item) => (
        <div className="flex justify-end gap-2">
          {item.status === "Final" && <Button size="xs" variant="secondary" className="rounded-md" color="amber" icon={FiCopy} onClick={(e) => handleReevaluateClick(e, item)} title="Re-evaluate" />}
          <Button size="xs" variant="light" icon={FiEdit3} onClick={() => navigate(`/addons/bpr/${item.id}`)} title="Buka Editor" />
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
            <FiGitMerge size={28} />
          </div>
          <div>
            <Title className="text-2xl text-slate-800">Business Process Review</Title>
            <Text className="text-slate-500">Pusat kendali pemetaan proses dan manajemen risiko operasional.</Text>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            size="lg"
            variant="secondary"
            icon={viewMode === "list" ? FiGrid : FiList}
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            title={viewMode === "list" ? "Tampilan Grid" : "Tampilan List"}
            className="shadow-sm border-gray-200 bg-white hover:bg-gray-50 rounded-xl"
          />
          {canCreate && (
            <Button size="lg" icon={FiPlus} onClick={() => setIsCreateModalOpen(true)} className="shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all rounded-xl">
              Buat Proses Baru
            </Button>
          )}
        </div>
      </div>

      {/* --- STATS CARDS --- */}
      <Grid numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="left" decorationColor="blue" className="p-4 border-l-4">
          <Text>Total Proses</Text>
          <Metric>{stats.total}</Metric>
        </Card>
        <Card decoration="left" decorationColor="emerald" className="p-4 border-l-4">
          <Text>Selesai (Final)</Text>
          <Metric>{stats.final}</Metric>
        </Card>
        <Card decoration="left" decorationColor="orange" className="p-4 border-l-4">
          <Text>Perlu Review</Text>
          <Metric>{stats.review}</Metric>
        </Card>
      </Grid>

      {/* --- FILTER BAR --- */}
      <Card className="p-4 shadow-sm border border-gray-100 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          <div className="relative flex-grow w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama proses atau departemen..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48 flex-shrink-0">
            <Select value={filterPeriod} onValueChange={setFilterPeriod} icon={FiClock} placeholder="Periode..." className="h-[42px]">
              <SelectItem value="all">Semua Periode</SelectItem>
              {uniquePeriods.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="w-full md:w-48 flex-shrink-0">
            <Select value={filterStatus} onValueChange={setFilterStatus} icon={FiFilter} placeholder="Status..." className="h-[42px]">
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="In Review">In Review</SelectItem>
              <SelectItem value="Final">Final</SelectItem>
            </Select>
          </div>
        </div>
      </Card>

      {/* --- CONTENT --- */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="text-center py-20">
            <Text>Memuat data...</Text>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-xl bg-white">
            <Text>Tidak ada dokumen proses bisnis ditemukan.</Text>
          </div>
        ) : viewMode === "list" ? (
          // LIST VIEW
          <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl">
            <AppResourceTable data={filteredList} isLoading={isLoading} columns={columns} emptyMessage="Tidak ada data." />
          </Card>
        ) : (
          // GRID VIEW
          <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6">
            {filteredList.map((item) => (
              <motion.div key={item.id} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                <Card className="h-full flex flex-col justify-between border-t-4 border-t-blue-500 hover:shadow-lg cursor-pointer group p-5" onClick={() => navigate(`/addons/bpr/${item.id}`)}>
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <Badge size="xs" className="rounded-md" color="slate">
                        {item.period}
                      </Badge>
                      <Badge size="xs" className="rounded-md px-2.5" color={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>

                    <Title className="text-lg font-bold text-slate-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">{item.name}</Title>
                    <Text className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                      <FiBriefcase size={12} /> {item.department_name}
                    </Text>

                    <div className="text-xs text-gray-400 flex items-center gap-1 mb-4 bg-gray-50 p-2 rounded border border-gray-100 w-fit">
                      <FiClock size={12} /> Update: {formatDate(item.updated_at)}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <Text className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">v{item.version || 1}</Text>
                    <div className="flex gap-2">
                      {item.status === "Final" && (
                        <Button size="xs" variant="secondary" className="rounded-md" color="amber" icon={FiCopy} onClick={(e) => handleReevaluateClick(e, item)}>
                          Re-evaluate
                        </Button>
                      )}
                      <Button size="xs" variant="light" icon={FiArrowRight}>
                        Buka
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </Grid>
        )}
      </div>

      <CreateBPRModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSaveSuccess={refetch} />
      <ReevaluateModal isOpen={isReevaluateModalOpen} onClose={() => setIsReevaluateModalOpen(false)} sourceDoc={selectedDocForClone} onConfirm={processReevaluate} />
    </div>
  );
}

export default BPRPage;
