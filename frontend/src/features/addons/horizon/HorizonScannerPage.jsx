// frontend/src/features/addons/horizon/HorizonScannerPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Card, Title, Text, SearchSelect, SearchSelectItem, Button, Grid, Badge, Dialog, DialogPanel, ProgressBar, Select, SelectItem, TextInput } from "@tremor/react";
import {
  FiGlobe,
  FiSearch,
  FiLoader,
  FiExternalLink,
  FiClock,
  FiCpu,
  FiTrash2,
  FiFileText,
  FiArrowRight,
  FiX,
  FiFilter,
  FiList,
  FiGrid,
  FiTarget,
  FiActivity,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiLayers,
  FiDollarSign,
  FiAlertOctagon,
  FiCalendar,
  FiBarChart2,
} from "react-icons/fi";
import apiClient from "../../../api/api";
import { toast } from "sonner";
import ConfirmationDialog from "../../../components/common/ConfirmationDialog";
import AppResourceTable from "../../../components/common/AppResourceTable";

// --- HELPER: FORMAT TANGGAL INDONESIA (WIB) ---
const formatDateTimeIndo = (dateInput) => {
  if (!dateInput) return "-";

  try {
    let date;
    // 1. Cek apakah input adalah string
    if (typeof dateInput === "string") {
      // Cek apakah string kosong atau invalid
      if (dateInput.trim() === "") return "-";

      // Jika string belum punya penanda timezone 'Z' (UTC), tambahkan manual
      const safeDateString = !dateInput.endsWith("Z") ? dateInput + "Z" : dateInput;
      date = new Date(safeDateString);
    } else {
      // Jika input sudah berupa object Date
      date = dateInput;
    }

    // 2. Cek Validitas Tanggal (PENTING: Mencegah RangeError)
    if (isNaN(date.getTime())) {
      return "-"; // Kembalikan strip jika tanggal tidak valid
    }

    // 3. Format ke Bahasa Indonesia
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-"; // Fallback aman jika terjadi error apa pun
  }
};

// --- HELPER: SIMULASI RISK LEVEL BADGE ---
// Karena di database belum ada kolom risk_level, kita simulasikan visualnya
// agar terlihat profesional di UI. Nanti bisa diganti dengan real data.
const getRiskBadge = (title) => {
  const lowerTitle = title?.toLowerCase() || "";
  if (lowerTitle.includes("krisis") || lowerTitle.includes("ancaman") || lowerTitle.includes("anjlok")) {
    return (
      <Badge className="rounded-md px-2 py-1" color="rose" icon={FiActivity}>
        High Risk
      </Badge>
    );
  } else if (lowerTitle.includes("peluang") || lowerTitle.includes("tumbuh") || lowerTitle.includes("positif")) {
    return (
      <Badge className="rounded-md px-2 py-1" color="emerald" icon={FiTrendingUp}>
        Opportunity
      </Badge>
    );
  } else {
    return (
      <Badge className="rounded-md px-2 py-1" color="orange" icon={FiShield}>
        Medium Risk
      </Badge>
    );
  }
};

// --- 1. KOMPONEN UTILITIES & RENDERER ---

// Helper Component untuk Card Pilihan (Multi Select Replacement)
const SelectableCard = ({ label, icon: Icon, colorClass, selected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
                relative p-4 rounded-xl border cursor-pointer transition-all duration-200 group
                flex items-center gap-3
                ${selected ? `bg-white border-${colorClass}-500 shadow-md ring-1 ring-${colorClass}-500` : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
            `}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${selected ? `bg-${colorClass}-500` : `bg-${colorClass}-200`}`}></div>
      <div className={`p-2 rounded-lg ${selected ? `bg-${colorClass}-100 text-${colorClass}-700` : "bg-gray-100 text-gray-500"}`}>
        <Icon size={18} />
      </div>
      <span className={`text-sm font-medium ${selected ? "text-slate-800" : "text-slate-600"}`}>{label}</span>
      {selected && <div className={`ml-auto w-5 h-5 rounded-full bg-${colorClass}-500 flex items-center justify-center text-white text-xs`}>✓</div>}
    </div>
  );
};

const AIContentRenderer = ({ htmlContent, createdAt, title, topics }) => {
  if (!htmlContent) return null;

  const displayTitle = title || "Laporan Horizon Scan";
  const displayDate = createdAt ? formatDateTimeIndo(createdAt) : "-";
  const displaySubject = topics || displayTitle;

  return (
    <div className="space-y-8">
      <article
        className="prose prose-slate prose-lg max-w-none 
                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-sm
                prose-li:text-sm prose-li:text-slate-600 prose-li:mb-2 prose-li:pl-1
                prose-strong:text-slate-800 prose-strong:font-bold
                prose-h3:text-lg prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4 prose-h3:flex prose-h3:items-center prose-h3:gap-2
                prose-h3:border-l-4 prose-h3:pl-3 prose-h3:rounded-r-lg prose-h3:py-1.5 prose-h3:bg-gray-50"
      >
        <div className="bg-white border-l-4 border-blue-600 rounded-r-xl shadow-sm mb-10 overflow-hidden font-sans border-y border-r border-slate-200">
          <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-snug">{displayTitle}</h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">DOKUMEN INTELIJEN STRATEGIS</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold tracking-widest uppercase border border-rose-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> CONFIDENTIAL
            </span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
            {/* Kolom 1: Tanggal */}
            <div className="group">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Tanggal Analisis</span>
              <div className="font-semibold text-slate-700 text-base border-b border-slate-100 pb-1 flex items-center gap-2">
                <span className="text-lg">📅</span>
                {displayDate}
              </div>
            </div>

            {/* Kolom 2: Perihal (Subject) - INI YANG HILANG */}
            <div className="group">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Perihal (Subject)</span>
              <div className="font-medium text-blue-700 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 text-sm leading-relaxed">{displaySubject}</div>
            </div>
          </div>
        </div>

        <div
          dangerouslySetInnerHTML={{
            __html: htmlContent
              .replace(
                /<h3>(.*?)Executive(.*?)Summary(.*?)<\/h3>([\s\S]*?)(?=<h3>|$)/g,
                `<div class="mb-8 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
                    <h3 class="text-blue-800 border-none bg-transparent p-0 mb-3 text-xl flex items-center gap-2 font-bold">
                        <span class="p-1.5 bg-blue-100 rounded-lg text-blue-600 shadow-sm">📊</span> $1Executive$2Summary$3
                    </h3>
                    <div class="text-slate-700 leading-relaxed text-sm">$4</div>
                </div>`
              )
              .replace(
                /<h3>(.*?)Competitor Landscape(.*?)<\/h3>([\s\S]*?)(?=<h3>|$)/g,
                `<div class="mb-8 p-6 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-100 shadow-sm">
                      <h3 class="text-cyan-800 border-none bg-transparent p-0 mb-3 text-xl flex items-center gap-2 font-bold">
                          <span class="p-1.5 bg-cyan-100 rounded-lg text-cyan-600 shadow-sm">🏢</span> $1Competitor Landscape & Market Dynamics$2
                      </h3>
                      <div class="text-slate-700 leading-relaxed text-sm">$3</div>
                  </div>`
              )
              .replace(
                /<h3>(.*?)Impact on Strategic Objectives(.*?)<\/h3>([\s\S]*?)(?=<h3>|$)/g,
                `<div class="mb-8 p-6 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 shadow-sm">
                    <h3 class="text-violet-800 border-none bg-transparent p-0 mb-3 text-lg flex items-center gap-2 font-bold">
                        <span class="p-1.5 bg-violet-100 rounded-lg text-violet-600 shadow-sm">🎯</span> $1Impact on Strategic Objectives$2
                    </h3>
                    <div class="text-slate-700 leading-relaxed text-sm">$3</div>
                </div>`
              )
              .replace(
                /<h3>(.*?)Key Risks Analysis(.*?)<\/h3>([\s\S]*?)(?=<h3>|$)/g,
                `<div class="mb-8 p-6 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 shadow-sm">
                    <h3 class="text-rose-800 border-none bg-transparent p-0 mb-3 text-lg flex items-center gap-2 font-bold">
                        <span class="p-1.5 bg-rose-100 rounded-lg text-rose-600 shadow-sm">⚠️</span> $1Key Risks Analysis$2
                    </h3>
                    <div class="text-slate-700 leading-relaxed text-sm">$3</div>
                </div>`
              )
              .replace(
                /<h3>(.*?)Value Chain Vulnerabilities(.*?)<\/h3>([\s\S]*?)(?=<h3>|$)/g,
                `<div class="mb-8 p-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 shadow-sm">
                    <h3 class="text-amber-800 border-none bg-transparent p-0 mb-3 text-lg flex items-center gap-2 font-bold">
                        <span class="p-1.5 bg-amber-100 rounded-lg text-amber-600 shadow-sm">🔗</span> $1Value Chain Vulnerabilities$2
                    </h3>
                    <div class="text-slate-700 leading-relaxed text-sm">$3</div>
                </div>`
              )
              .replace(
                /<h3>(.*?)Strategic Opportunities(.*?)<\/h3>([\s\S]*?)(?=<h3>|$)/g,
                `<div class="mb-8 p-6 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 shadow-sm">
                    <h3 class="text-sky-800 border-none bg-transparent p-0 mb-3 text-lg flex items-center gap-2 font-bold">
                        <span class="p-1.5 bg-sky-100 rounded-lg text-sky-600 shadow-sm">🚀</span> $1Strategic Opportunities$2
                    </h3>
                    <div class="text-slate-700 leading-relaxed text-sm">$3</div>
                </div>`
              )
              .replace(
                /<h3>(.*?)Priority Mitigation(.*?)<\/h3>([\s\S]*?)(?=<h3>|$)/g,
                `<div class="mb-8 p-6 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 shadow-sm">
                    <h3 class="text-emerald-800 border-none bg-transparent p-0 mb-3 text-lg flex items-center gap-2 font-bold">
                        <span class="p-1.5 bg-emerald-100 rounded-lg text-emerald-600 shadow-sm">🛡️</span> $1Priority Mitigation & Action Plan$2
                    </h3>
                    <div class="text-slate-700 leading-relaxed text-sm">$3</div>
                </div>`
              ),
          }}
        />
      </article>
    </div>
  );
};

// --- 2. MAIN PAGE COMPONENT ---

function HorizonScannerPage() {
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [sectorOptions, setSectorOptions] = useState([]);
  const [isSectorsLoading, setIsSectorsLoading] = useState(true);

  // State Scanning & Modal
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // State Detail
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // State Config & Utils
  const [limitConfig, setLimitConfig] = useState({ count: 0, limit: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [filterIndustry, setFilterIndustry] = useState("all");

  // --- STATE FORM CONFIGURATION ---
  const [formData, setFormData] = useState({
    company_name: "",
    company_website: "",
    industry: "",
    geo_scope: "Nasional",
    time_horizon: "Medium Term (1-3 Tahun)",
    risk_appetite: "Moderate",
    strategic_driver: "Business as Usual (BAU)",
    risk_categories: ["Strategic", "Operational"],
    value_chain: [],
    input_competitors: "",
    input_topics: "",
    report_perspective: "Board of Directors",
    sentiment_mode: "Balanced",
  });

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSelection = (key, itemValue) => {
    setFormData((prev) => {
      const currentList = prev[key] || [];
      if (currentList.includes(itemValue)) {
        return { ...prev, [key]: currentList.filter((i) => i !== itemValue) };
      } else {
        return { ...prev, [key]: [...currentList, itemValue] };
      }
    });
  };

  // --- CONFIG DATA FOR CARDS ---
  const RISK_CATEGORIES = [
    { id: "Strategic", label: "Strategis", icon: FiTarget, color: "indigo" },
    { id: "Operational", label: "Operasional", icon: FiActivity, color: "blue" },
    { id: "Financial", label: "Finansial", icon: FiDollarSign, color: "emerald" },
    { id: "Compliance", label: "Kepatuhan", icon: FiShield, color: "rose" },
    { id: "Cyber Security", label: "Cyber Sec", icon: FiCpu, color: "lime" },
    { id: "Reputational", label: "Reputasi", icon: FiAlertOctagon, color: "orange" },
    { id: "ESG", label: "ESG / Sustainability", icon: FiGlobe, color: "green" },
  ];

  const VALUE_CHAINS = [
    { id: "Supply Chain", label: "Supply Chain (Hulu)", icon: FiLayers, color: "amber" },
    { id: "Operations", label: "Operasional / Produksi", icon: FiActivity, color: "blue" },
    { id: "Sales Marketing", label: "Sales & Marketing", icon: FiTrendingUp, color: "indigo" },
    { id: "Human Capital", label: "SDM / Human Capital", icon: FiUsers, color: "rose" },
    { id: "IT Infrastructure", label: "IT & Digital", icon: FiCpu, color: "lime" },
    { id: "Finance", label: "Finance & Treasury", icon: FiDollarSign, color: "emerald" },
  ];

  const remainingQuota = limitConfig.limit !== null ? Math.max(0, limitConfig.limit - limitConfig.count) : "Unlimited";
  const isLimitReached = limitConfig.limit !== null && limitConfig.count >= limitConfig.limit;

  const getSectorLabel = (key) => {
    const option = sectorOptions.find((opt) => opt.key === key);
    return option ? option.value : key;
  };

  useEffect(() => {
    const initData = async () => {
      setIsLoadingHistory(true);
      try {
        const industryRes = await apiClient.get("/master-data?category=INDUSTRY");
        setSectorOptions(industryRes.data);
        await fetchHistory();

        const userRes = await apiClient.get("/account/details");
        const horizonData = userRes.data.assessment_limits?.horizon || { count: 0, limit: null };
        setLimitConfig(horizonData);

        setFormData((prev) => ({
          ...prev,
          company_name: userRes.data.institution || "",
          company_website: "",
        }));
      } catch (error) {
        toast.error("Gagal memuat data.");
      } finally {
        setIsLoadingHistory(false);
        setIsSectorsLoading(false);
      }
    };
    initData();
  }, []);

  const fetchHistory = async () => {
    try {
      const historyRes = await apiClient.get("/horizon/history");
      setHistory(historyRes.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const filteredHistory = useMemo(() => {
    let result = [...history];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((item) => item.title?.toLowerCase().includes(lower) || item.summary_preview?.toLowerCase().includes(lower));
    }
    if (filterIndustry !== "all") {
      result = result.filter((item) => item.sector === filterIndustry);
    }
    result.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOption === "newest" ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [history, searchTerm, filterIndustry, sortOption]);

  const handleStartScan = async () => {
    if (!formData.industry) {
      toast.error("Mohon pilih Industri Utama.");
      return;
    }

    setIsScanModalOpen(false);
    setIsScanning(true);
    setScanProgress(10);
    const interval = setInterval(() => {
      setScanProgress((prev) => (prev < 90 ? prev + Math.random() * 10 : prev));
    }, 800);

    try {
      const payload = {
        ...formData,
        input_competitors: formData.input_competitors,
        input_topics: formData.input_topics,
        specific_topics: formData.input_topics,
      };

      const response = await apiClient.post("/horizon/scan", payload);
      clearInterval(interval);
      setScanProgress(100);
      toast.success("Analisis Strategis Selesai!");
      await fetchHistory();
      handleViewDetail(response.data.scan_id);
      setLimitConfig((prev) => ({ ...prev, count: prev.count + 1 }));
    } catch (error) {
      clearInterval(interval);
      toast.error(error.response?.data?.msg || "Gagal melakukan scanning.");
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(0);
      }, 500);
    }
  };

  const handleViewDetail = async (scanId) => {
    setIsDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const response = await apiClient.get(`/horizon/history/${scanId}`);
      setSelectedScan(response.data);
    } catch (error) {
      toast.error("Gagal memuat detail laporan.");
      setIsDetailOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const openDeleteConfirm = (e, id) => {
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, id });
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await apiClient.delete(`/horizon/history/${deleteConfirm.id}`);
      toast.success("Laporan berhasil dihapus.");
      setDeleteConfirm({ isOpen: false, id: null });
      fetchHistory();
      setLimitConfig((prev) => ({ ...prev, count: Math.max(0, prev.count - 1) }));
    } catch (error) {
      toast.error("Gagal menghapus laporan.");
    }
  };

  const listColumns = [
    {
      key: "title",
      header: "Judul Laporan",
      cell: (item) => (
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => handleViewDetail(item.id)}>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
            <FiFileText />
          </div>
          <Text className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{item.title || "Laporan Tanpa Judul"}</Text>
        </div>
      ),
    },
    {
      key: "sector",
      header: "Industri",
      cell: (item) => (
        <Badge size="xs" color="blue" icon={FiGlobe} className="rounded-md px-2 py-1">
          {getSectorLabel(item.sector)}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Tanggal Scan",
      cell: (item) => (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <FiClock size={12} /> {formatDateTimeIndo(item.created_at)}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (item) => (
        <div className="flex justify-end gap-2">
          <Button size="xs" variant="secondary" className="rounded-md" color="blue" icon={FiArrowRight} onClick={() => handleViewDetail(item.id)}>
            Buka
          </Button>
          <Button size="xs" variant="light" color="rose" icon={FiTrash2} onClick={(e) => openDeleteConfirm(e, item.id)} />
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm shrink-0">
            <FiGlobe size={28} />
          </div>
          <div>
            <Title className="text-2xl text-slate-800">Horizon Scanner</Title>
            <Text className="text-slate-500 text-sm mt-1">Market Intelligence & Strategic Risk Foresight</Text>
          </div>
        </div>

        <Button size="lg" icon={FiSearch} onClick={() => setIsScanModalOpen(true)} disabled={isScanning || isLimitReached || isSectorsLoading} className="shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all rounded-xl">
          Mulai Analisis Baru
        </Button>
      </div>

      {limitConfig.limit !== null && (
        <div className="flex justify-end -mt-4 px-2">
          <Text className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md border border-blue-100">Sisa Kuota Scan: {remainingQuota}</Text>
        </div>
      )}

      {/* FILTER BAR */}
      <Card className="p-4 shadow-sm border border-gray-100 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          <div className="relative flex-grow w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari laporan..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48 flex-shrink-0">
            <Select value={filterIndustry} onValueChange={setFilterIndustry} icon={FiFilter} placeholder="Filter Industri..." className="h-[42px]">
              <SelectItem value="all">Semua Industri</SelectItem>
              {sectorOptions.map((s) => (
                <SelectItem key={s.key} value={s.key}>
                  {s.value}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="w-full md:w-40 flex-shrink-0">
            <Select value={sortOption} onValueChange={setSortOption} icon={FiClock} placeholder="Urutkan..." className="h-[42px]">
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="oldest">Terlama</SelectItem>
            </Select>
          </div>
          <div className="w-full md:w-auto flex-shrink-0">
            <Button
              size="lg"
              variant="secondary"
              icon={viewMode === "list" ? FiGrid : FiList}
              onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
              className="shadow-sm border-gray-200 bg-white hover:bg-gray-50 rounded-xl h-[42px]"
            />
          </div>
        </div>
      </Card>

      {/* HISTORY LIST/GRID */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
          <Title className="text-lg text-slate-700">Riwayat Laporan Intelijen</Title>
        </div>

        {isLoadingHistory ? (
          <div className="text-center py-20">
            <FiLoader className="animate-spin h-8 w-8 mx-auto text-gray-400 mb-2" />
            <Text>Memuat riwayat...</Text>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-white">
            <FiGlobe className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <Text className="font-bold text-slate-700">Belum ada riwayat scanning.</Text>
          </div>
        ) : viewMode === "list" ? (
          <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl">
            <AppResourceTable data={filteredHistory} isLoading={isLoadingHistory} columns={listColumns} emptyMessage="Tidak ada data." />
          </Card>
        ) : (
          <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6">
            {filteredHistory.map((item) => (
              <Card
                key={item.id}
                className="flex flex-col h-full hover:shadow-lg transition-all duration-200 border-t-4 border-t-blue-500 group cursor-pointer relative p-0 overflow-hidden bg-white border border-gray-200 rounded-xl"
                onClick={() => handleViewDetail(item.id)}
              >
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <Badge size="xs" color="blue" icon={FiGlobe} className="rounded-md px-2 py-1">
                      {getSectorLabel(item.sector)}
                    </Badge>
                    {getRiskBadge(item.title)}
                  </div>

                  <Title className="text-lg font-bold text-slate-800 mb-4 line-clamp-3 leading-snug">{item.title || "Laporan Tanpa Judul"}</Title>

                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FiCalendar className="text-slate-400" />
                      <span>Analisis pada:</span>
                      <span className="font-medium text-slate-700">{formatDateTimeIndo(item.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FiBarChart2 className="text-slate-400" />
                      <span>Sumber Data:</span>
                      <span className="font-medium text-slate-700">Multi-Source AI</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center mt-auto">
                  <Text className="text-xs font-medium text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Baca Laporan <FiArrowRight size={12} />
                  </Text>
                  <button onClick={(e) => openDeleteConfirm(e, item.id)} className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors z-10">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </Card>
            ))}
          </Grid>
        )}
      </div>

      {/* MODAL FORM KONFIGURASI */}
      <Dialog open={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} static={true} className="z-50">
        <DialogPanel className="max-w-6xl w-full bg-white rounded-xl shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="bg-slate-50 px-8 py-6 border-b border-gray-200 flex justify-between items-center shrink-0">
            <div>
              <Title className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                  <FiSearch size={20} />
                </span>
                Konfigurasi Horizon Scan
              </Title>
              <Text className="text-sm text-slate-500 mt-1">Sesuaikan parameter scan agar relevan dengan strategi Anda.</Text>
            </div>
            <button onClick={() => setIsScanModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
              <FiX size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
            {/* SECTION 1: TARGET & SCOPE */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</span>
                <h3 className="font-bold text-slate-800 text-lg">Target & Ruang Lingkup</h3>
              </div>
              <div className="pl-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nama Perusahaan</label>
                  <TextInput value={formData.company_name} disabled placeholder="Memuat data institusi..." className="bg-slate-50 opacity-90 border-slate-200 text-slate-700" />
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Website Perusahaan</label>
                  <TextInput value={formData.company_website} onChange={(e) => handleFormChange("company_website", e.target.value)} placeholder="https://www.perusahaan.com" icon={FiExternalLink} />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Industri Utama <span className="text-red-500">*</span>
                  </label>
                  <SearchSelect value={formData.industry || ""} onValueChange={(v) => handleFormChange("industry", v)} placeholder="Pilih Industri...">
                    {sectorOptions.map((s) => (
                      <SearchSelectItem key={s.key} value={s.key}>
                        {s.value}
                      </SearchSelectItem>
                    ))}
                  </SearchSelect>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Lingkup Geografis</label>
                  <Select value={formData.geo_scope} onValueChange={(v) => handleFormChange("geo_scope", v)}>
                    <SelectItem value="Global">Global (Worldwide)</SelectItem>
                    <SelectItem value="Regional Asia">Regional (Asia Pasifik)</SelectItem>
                    <SelectItem value="Nasional">Nasional (Indonesia)</SelectItem>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Horizon Waktu</label>
                  <Select value={formData.time_horizon} onValueChange={(v) => handleFormChange("time_horizon", v)}>
                    <SelectItem value="Short Term">Jangka Pendek ( &lt; 1 Tahun)</SelectItem>
                    <SelectItem value="Medium Term">Jangka Menengah (1-3 Tahun)</SelectItem>
                    <SelectItem value="Long Term">Jangka Panjang / Foresight</SelectItem>
                  </Select>
                </div>
              </div>
            </section>

            {/* SECTION 2: STRATEGIC CONTEXT */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">2</span>
                <h3 className="font-bold text-slate-800 text-lg">Konteks Strategis</h3>
              </div>
              <div className="pl-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Selera Risiko</label>
                  <Select value={formData.risk_appetite} onValueChange={(v) => handleFormChange("risk_appetite", v)}>
                    <SelectItem value="Risk Averse">Risk Averse (Konservatif)</SelectItem>
                    <SelectItem value="Moderate">Moderate (Seimbang)</SelectItem>
                    <SelectItem value="Aggressive">Risk Aggressive (Berani)</SelectItem>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Pemicu Strategis</label>
                  <Select value={formData.strategic_driver} onValueChange={(v) => handleFormChange("strategic_driver", v)}>
                    <SelectItem value="BAU">Business as Usual</SelectItem>
                    <SelectItem value="Expansion">Ekspansi Bisnis</SelectItem>
                    <SelectItem value="Digital Transformation">Transformasi Digital</SelectItem>
                    <SelectItem value="IPO/M&A">IPO / M&A</SelectItem>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Sudut Pandang</label>
                  <Select value={formData.report_perspective} onValueChange={(v) => handleFormChange("report_perspective", v)}>
                    <SelectItem value="Board of Directors">Board of Directors</SelectItem>
                    <SelectItem value="Operational Manager">Operational Manager</SelectItem>
                    <SelectItem value="Investor">Investor / Shareholder</SelectItem>
                  </Select>
                </div>
              </div>
            </section>

            {/* SECTION 3: INTELLIGENCE FOCUS (CARDS) */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">3</span>
                <h3 className="font-bold text-slate-800 text-lg">Fokus Analisis</h3>
              </div>
              <div className="pl-0 md:pl-10 space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-3 block">Fokus Kategori Risiko (Multi-select)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {RISK_CATEGORIES.map((cat) => (
                      <SelectableCard key={cat.id} label={cat.label} icon={cat.icon} colorClass={cat.color} selected={formData.risk_categories.includes(cat.id)} onClick={() => toggleSelection("risk_categories", cat.id)} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-3 block">Area Terdampak / Value Chain (Multi-select)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {VALUE_CHAINS.map((vc) => (
                      <SelectableCard key={vc.id} label={vc.label} icon={vc.icon} colorClass={vc.color} selected={formData.value_chain.includes(vc.id)} onClick={() => toggleSelection("value_chain", vc.id)} />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: SPECIFIC KEYWORDS (SPLIT) */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">4</span>
                <h3 className="font-bold text-slate-800 text-lg">Keyword & Isu Spesifik</h3>
              </div>
              <div className="pl-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Kompetitor Utama</label>
                  <TextInput value={formData.input_competitors} onChange={(e) => handleFormChange("input_competitors", e.target.value)} placeholder="Contoh: Bank Mandiri, BCA, BNI (Pisahkan dengan koma)" />
                  <p className="text-xs text-slate-500 mt-1">Sebutkan 3-5 nama pesaing langsung untuk analisis perbandingan.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Isu / Topik Spesifik</label>
                  <TextInput value={formData.input_topics} onChange={(e) => handleFormChange("input_topics", e.target.value)} placeholder="Contoh: Pilkada 2024, Kebocoran Data..." />
                  <p className="text-xs text-slate-500 mt-1">Isu yang sedang dipantau manajemen.</p>
                </div>
              </div>
            </section>
          </div>

          <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end gap-3 shrink-0">
            <Button variant="secondary" className="rounded-md" color="rose" onClick={() => setIsScanModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" color="blue" icon={FiCpu} onClick={handleStartScan} className="rounded-md shadow-lg shadow-blue-500/20 hover:bg-blue-600">
              Mulai Analisis AI
            </Button>
          </div>
        </DialogPanel>
      </Dialog>

      {/* MODAL PROGRESS SCANNING */}
      <Dialog open={isScanning} onClose={() => {}} static={true} className="z-[100]">
        <DialogPanel className="text-center max-w-md p-8 bg-white rounded-2xl shadow-2xl">
          <div className="mx-auto w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping opacity-75"></div>
            <FiCpu className="h-10 w-10 text-blue-600 animate-pulse relative z-10" />
          </div>
          <Title className="text-xl font-bold text-slate-800">AI Sedang Bekerja...</Title>
          <Text className="mt-2 text-sm text-slate-600">
            Menganalisis profil risiko & strategi: <br />
            <span className="font-bold text-blue-600">{getSectorLabel(formData.industry)}</span>
          </Text>
          <div className="mt-8">
            <ProgressBar value={scanProgress} color="blue" />
          </div>
        </DialogPanel>
      </Dialog>

      {/* MODAL DETAIL LAPORAN */}
      <Dialog open={isDetailOpen} onClose={() => setIsDetailOpen(false)} static={true} className="z-50">
        <DialogPanel className="w-full max-w-7xl h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="bg-white px-8 py-5 border-b border-gray-200 flex justify-between items-start shadow-sm z-10">
            <div>
              {isDetailLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-8 w-96 bg-gray-200 animate-pulse rounded"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge size="xs" color="blue" className="rounded-md px-2 py-1">
                      {selectedScan && getSectorLabel(selectedScan.sector)}
                    </Badge>
                    <span className="text-xs text-gray-400 border-l border-gray-300 pl-3">{selectedScan && formatDateTimeIndo(selectedScan.created_at)}</span>
                  </div>
                  <Title className="text-2xl font-bold text-slate-800 leading-snug">{selectedScan?.title}</Title>
                </>
              )}
            </div>
            <Button variant="secondary" color="slate" icon={FiX} onClick={() => setIsDetailOpen(false)} className="rounded-full p-2 hover:bg-slate-100" />
          </div>

          <div className="flex-grow overflow-y-auto bg-slate-50 p-8">
            {isDetailLoading ? (
              <div className="text-center py-20">Loading...</div>
            ) : selectedScan ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto">
                <div className="lg:col-span-8">
                  <Card className="shadow-sm border border-gray-100 p-8 min-h-[500px] bg-white">
                    <AIContentRenderer htmlContent={selectedScan.report_html} createdAt={selectedScan.created_at} />
                  </Card>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-0">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <FiGlobe size={20} />
                      </div>
                      <div>
                        <Title className="text-lg text-slate-800">Intelligence Source</Title>
                        <Text className="text-xs text-slate-500">Live feed dari {selectedScan.news_data?.length || 0} sumber</Text>
                      </div>
                    </div>

                    <div className="relative border-l-2 border-slate-100 ml-3 space-y-6 py-2">
                      {selectedScan.news_data?.map((news, idx) => (
                        <div key={idx} className="relative pl-6 group">
                          {/* Dot Timeline */}
                          <div className="absolute -left-[5px] top-1 w-3 h-3 bg-slate-200 rounded-full border-2 border-white group-hover:bg-blue-500 transition-colors"></div>

                          <a href={news.url} target="_blank" rel="noopener noreferrer" className="block transition-all hover:-translate-y-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${news.source.includes("Reuters") ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                                {news.source}
                              </span>
                              <span className="text-[10px] text-gray-400">{formatDateTimeIndo(news.published_at || new Date())}</span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-700 leading-snug group-hover:text-blue-600 transition-colors">{news.title}</h4>
                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-400 group-hover:text-blue-400">
                              <span>Buka Artikel</span>
                              <FiExternalLink size={10} />
                            </div>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">Data laporan tidak ditemukan.</div>
            )}
          </div>
        </DialogPanel>
      </Dialog>

      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Hapus Laporan"
        message="Apakah Anda yakin ingin menghapus laporan intelijen ini?"
        confirmButtonText="Hapus"
      />
    </div>
  );
}

export default HorizonScannerPage;
