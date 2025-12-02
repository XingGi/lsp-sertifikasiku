// frontend/src/features/risk-ai/AssessmentDetailPage.jsx

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Title, Text, Button, Grid, Col, Badge, Switch } from "@tremor/react";
import {
  FiDownload,
  FiFileText,
  FiMaximize,
  FiMinimize,
  FiAlertTriangle,
  FiInfo,
  FiZap,
  FiArrowLeft,
  FiCpu,
  FiDatabase,
  FiBriefcase,
  FiList,
  FiGrid,
  FiBarChart2,
  FiTarget,
  FiUsers,
  FiBookOpen,
  FiClipboard,
  FiCheckCircle,
  FiBookmark,
  FiHash,
  FiCalendar,
  FiUser,
  FiShield,
  FiDollarSign,
} from "react-icons/fi";
import apiClient from "../../api/api";
import { toast } from "sonner";

// Components
import RiskCriteriaReference from "./components/RiskCriteriaReference";
import RiskResultsTable from "./components/RiskResultsTable";
import EditRiskItemSidebar from "./components/EditRiskItemSidebar";
import RiskMatrix from "./components/RiskMatrix";
import RiskSummary from "./components/RiskSummary";
import AIGeneratedAnalysis from "./components/AIGeneratedAnalysis";

const formatCurrency = (value, currency = "IDR") => {
  if (!value) return "0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDateLocal = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (e) {
    return dateString;
  }
};

// Komponen Sub-Card untuk informasi detail
const InfoCard = ({ title, icon: Icon, color, children }) => {
  // PERBAIKAN: Gunakan 'bg-' (background) untuk strip warna, bukan 'border-'
  const stripeColors = {
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
  };

  const iconBgColors = {
    blue: "bg-blue-50",
    indigo: "bg-indigo-50",
    emerald: "bg-emerald-50",
    amber: "bg-amber-50",
  };

  const iconTextColors = {
    blue: "text-blue-600",
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all h-full relative overflow-hidden">
      {/* Strip Warna di Kiri (Gunakan stripeColors) */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${stripeColors[color] || "bg-gray-300"}`}></div>

      <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2 pl-2">
        {/* Tambah pl-2 agar tidak mepet strip */}
        <div className={`p-1.5 rounded-md ${iconBgColors[color]} ${iconTextColors[color]}`}>
          <Icon size={16} />
        </div>
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h4>
      </div>
      <div className="space-y-4 pl-2">{children}</div>
    </div>
  );
};

// Komponen Field Label-Value
const InfoField = ({ label, value, icon: Icon }) => (
  <div>
    <Text className="text-[10px] text-gray-400 font-bold uppercase mb-0.5 flex items-center gap-1">
      {Icon && <Icon size={10} />} {label}
    </Text>
    <div className="font-medium text-slate-700 text-sm break-words">{value}</div>
  </div>
);

function AssessmentDetailPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  // State
  const [assessment, setAssessment] = useState(null);
  const [assetOptions, setAssetOptions] = useState([]);
  const [industryOptions, setIndustryOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [selectedRisks, setSelectedRisks] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const tableCardRef = useRef(null);
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState(null);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [assessmentRes, assetsRes, industryRes] = await Promise.all([apiClient.get(`/assessments/${assessmentId}`), apiClient.get("/master-data?category=COMPANY_ASSETS"), apiClient.get("/master-data?category=INDUSTRY")]);
        setAssessment(assessmentRes.data);
        setAssetOptions(assetsRes.data);
        setIndustryOptions(industryRes.data);
      } catch (error) {
        console.error("Gagal memuat detail asesmen:", error);
        toast.error("Gagal memuat data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [assessmentId]);

  // Handlers
  const handleEditClick = (risk) => {
    setEditingRisk(risk);
    setIsEditSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsEditSidebarOpen(false);
    setEditingRisk(null);
  };

  const handleSaveRisk = (updatedRisk) => {
    setAssessment((prev) => ({
      ...prev,
      risks: prev.risks.map((r) => (r.id === updatedRisk.id ? updatedRisk : r)),
    }));
    setIsEditSidebarOpen(false);
    toast.success("Risiko berhasil diperbarui");
  };

  const handleSummaryLoaded = (newAnalysisData) => {
    setAssessment((prevData) => ({ ...prevData, ...newAnalysisData }));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRisks(assessment.risks.map((r) => r.id));
    } else {
      setSelectedRisks([]);
    }
  };

  const handleRowSelect = (riskId) => {
    setSelectedRisks((prev) => (prev.includes(riskId) ? prev.filter((id) => id !== riskId) : [...prev, riskId]));
  };

  const handleAddToRegister = async () => {
    if (selectedRisks.length === 0) return;
    try {
      await apiClient.post("/risk-register/import", { risk_ids: selectedRisks });
      toast.success(`${selectedRisks.length} risiko ditambahkan ke Risk Register.`);
      setSelectedRisks([]);
    } catch (error) {
      toast.error("Gagal import risiko.");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      tableCardRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        <Text className="text-indigo-900 font-medium">Memuat Laporan Asesmen...</Text>
      </div>
    );
  }

  if (!assessment) return <div className="p-10">Gagal memuat data asesmen.</div>;

  const assetValueDisplay = assetOptions.find((opt) => opt.key === assessment.company_assets)?.value || assessment.company_assets;
  const industryDisplay = industryOptions.find((opt) => opt.key === assessment.company_industry)?.value || assessment.company_industry || "-";
  const isAllSelected = assessment?.risks.length > 0 && selectedRisks.length === assessment.risks.length;

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <Button variant="light" icon={FiArrowLeft} onClick={() => navigate("/risk-ai/assessments")} className="rounded-full p-2 hover:bg-slate-200 transition-colors" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Title className="text-2xl text-slate-800 font-bold">Risk Assessment Results</Title>
              <Badge className="rounded-md px-2 py-1 font-medium" color="indigo" size="xs">
                AI Generated
              </Badge>
            </div>
            <Text className="text-slate-500 mt-1 text-sm">Laporan analisis risiko komprehensif.</Text>
          </div>
        </div>
      </div>

      {/* CARD 1: SUMMARY INFO (Blue Accent) */}
      <Card className="border-t-4 border-blue-500 shadow-md bg-slate-50/50 ring-1 ring-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
              <FiInfo size={24} />
            </div>
            <div>
              <Title className="text-lg font-bold text-slate-800">Ringkasan Proyek</Title>
              <Text className="text-xs text-slate-500">Overview informasi kunci asesmen.</Text>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="secondary" icon={FiDownload} disabled size="xs" className="rounded-md bg-white shadow-sm flex-1 sm:flex-none">
              Excel
            </Button>
            <Button variant="secondary" icon={FiFileText} disabled size="xs" className="rounded-md bg-white shadow-sm flex-1 sm:flex-none">
              PDF
            </Button>
          </div>
        </div>

        {/* GRID SUB-CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* SUB-CARD 1: INFO ASESMEN */}
          <InfoCard title="Assessment Info" icon={FiFileText} color="blue">
            <div className="space-y-4">
              <InfoField label="ID Asesmen" value={`RA-${assessment.id.toString().padStart(5, "0")}`} icon={FiHash} />
              <InfoField label="Tanggal Mulai" value={formatDateLocal(assessment.tanggal_mulai)} icon={FiCalendar} />

              <div>
                <Text className="text-[10px] text-gray-400 font-bold uppercase mb-0.5 flex items-center gap-1">
                  <FiUser size={10} /> Dibuat Oleh
                </Text>
                <div className="font-medium text-slate-700 text-sm">{assessment.created_by_user_name || "N/A"}</div>
                <div className="text-xs text-gray-400 truncate">{assessment.created_by_user_email}</div>
              </div>
            </div>
          </InfoCard>

          {/* SUB-CARD 2: PROFIL PERUSAHAAN */}
          <InfoCard title="Company Profile" icon={FiBriefcase} color="indigo">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 items-center mr-2">
                <InfoField
                  label="Tipe"
                  value={
                    <Badge size="xs" color="indigo" className="rounded-full px-2 py-1">
                      {assessment.company_type || "-"}
                    </Badge>
                  }
                />
                <InfoField
                  label="Industri"
                  value={
                    <Badge size="xs" color="indigo" className="rounded-full px-2 py-1">
                      {industryDisplay}
                    </Badge>
                  }
                />
              </div>
              <InfoField label="Aset Perusahaan" value={assetValueDisplay} icon={FiDollarSign} />
              <div>
                <Text className="text-[10px] text-gray-400 font-bold uppercase mb-0.5 flex items-center gap-1">
                  <FiShield size={10} /> Risk Limit
                </Text>
                <div className="text-lg font-bold text-indigo-600">{formatCurrency(assessment.risk_limit, assessment.currency)}</div>
              </div>
            </div>
          </InfoCard>

          {/* SUB-CARD 3: KONTEKS PROYEK */}
          <InfoCard title="Project Context" icon={FiTarget} color="emerald">
            <div className="space-y-4">
              <div>
                <Text className="text-[10px] text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                  <FiTarget size={10} /> Objective
                </Text>
                <div className="text-sm text-slate-700 bg-emerald-50/50 p-2 rounded border border-emerald-100 leading-snug">{assessment.project_objective || "-"}</div>
              </div>
              <div>
                <Text className="text-[10px] text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                  <FiUsers size={10} /> Involved Units
                </Text>
                <div className="flex flex-wrap gap-1.5">
                  {assessment.involved_departments?.split(",").map((u, i) => (
                    <Badge key={i} size="xs" color="emerald" icon={FiCheckCircle} className="rounded-full px-2 py-0.5">
                      {u.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </InfoCard>

          {/* SUB-CARD 4: KONTEKS TAMBAHAN */}
          <InfoCard title="Additional Context" icon={FiList} color="amber">
            <div className="space-y-4">
              <div>
                <Text className="text-[10px] text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                  <FiBookOpen size={10} /> Regulations
                </Text>
                <div className="flex flex-wrap gap-1.5">
                  {assessment.relevant_regulations ? (
                    assessment.relevant_regulations.split(",").map((r, i) => (
                      <Badge key={i} size="xs" color="amber" icon={FiBookmark} className="rounded-full px-2 py-1">
                        {r.trim()}
                      </Badge>
                    ))
                  ) : (
                    <Text className="text-xs text-gray-400 italic">No regulations.</Text>
                  )}
                </div>
              </div>
              <div>
                <Text className="text-[10px] text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                  <FiClipboard size={10} /> Actions Taken
                </Text>
                <Text className="text-sm text-slate-600 italic bg-amber-50/50 p-2 rounded border border-amber-100">"{assessment.completed_actions || "No actions yet."}"</Text>
              </div>
            </div>
          </InfoCard>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <FiAlertTriangle className="text-rose-500" /> Risk Types:
          </span>
          <div className="flex flex-wrap gap-2">
            {assessment.risk_categories?.split(",").map((cat, i) => (
              <Badge key={i} size="xs" color="rose" className="rounded-full px-3 py-1 shadow-sm border border-rose-200">
                {cat.trim()}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* CARD 2: RISK CRITERIA (Cyan Accent) */}
      <Card className="border-l-4 border-cyan-500 shadow-md ring-1 ring-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
            <FiDatabase size={20} />
          </div>
          <Title>Kriteria Referensi</Title>
        </div>
        <RiskCriteriaReference riskLimit={assessment.risk_limit} />
      </Card>

      {/* CARD 3: RISK REGISTER TABLE (Rose Accent - Fullscreenable) */}
      <div ref={tableCardRef} className={`transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-50 bg-slate-50 p-6 overflow-auto" : ""}`}>
        <Card className="border-t-4 border-rose-500 shadow-md ring-1 ring-gray-100 h-full flex flex-col">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                <FiList size={20} />
              </div>
              <div>
                <Title>Risk Register</Title>
                <Text className="text-xs text-gray-500">Total: {assessment.risks?.length} risiko teridentifikasi.</Text>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleSelectAll(!isAllSelected)}>
                <Switch id="select-all" checked={isAllSelected} onChange={handleSelectAll} />
                <label htmlFor="select-all" className="text-xs font-medium text-gray-600 cursor-pointer select-none">
                  Select All
                </label>
              </div>
              <Button size="xs" variant="secondary" onClick={handleAddToRegister} disabled={selectedRisks.length === 0} className="rounded-md flex-1 sm:flex-none whitespace-nowrap">
                Add to Register ({selectedRisks.length})
              </Button>
              <Button size="xs" variant="light" icon={isFullscreen ? FiMinimize : FiMaximize} onClick={toggleFullscreen} title="Toggle Fullscreen" className="hidden sm:flex" />
            </div>
          </div>

          <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
            <RiskResultsTable risks={assessment.risks} selectedRisks={selectedRisks} onRowSelect={handleRowSelect} onEditClick={handleEditClick} />
          </div>
        </Card>
      </div>

      {/* CARD 4: RISK MATRIX (Teal Accent) */}
      <Card className="border-t-4 border-teal-500 shadow-md ring-1 ring-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
            <FiGrid size={20} />
          </div>
          <Title>Peta Sebaran Risiko</Title>
        </div>
        <RiskMatrix risks={assessment.risks} />
      </Card>

      {/* CARD 5: RISK SUMMARY (Orange Accent) */}
      <Card className="border-t-4 border-orange-500 shadow-md ring-1 ring-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
            <FiBarChart2 size={20} />
          </div>
          <Title>Statistik Risiko</Title>
        </div>
        <RiskSummary risks={assessment.risks} />
      </Card>

      {/* CARD 6: AI GENERATED ANALYSIS (Purple Accent) */}
      <Card className="border-l-4 border-purple-500 shadow-md ring-1 ring-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
            <FiCpu size={20} />
          </div>
          <Title>Analisis AI Generatif</Title>
        </div>
        <AIGeneratedAnalysis analysisData={assessment} assessmentId={assessment.id} onSummaryLoaded={handleSummaryLoaded} />
      </Card>

      {/* CARD 7: DISCLAIMER (Yellow Accent) */}
      <Card className="border-l-4 border-yellow-400 bg-yellow-50/50 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-yellow-100 rounded-full text-yellow-600 shrink-0">
            <FiAlertTriangle size={24} />
          </div>
          <div>
            <Title className="text-yellow-800">Disclaimer & Rekomendasi</Title>
            <Text className="mt-1 text-sm text-yellow-900/80 leading-relaxed">
              Assessment ini memberikan gambaran awal profil risiko berdasarkan input AI. Konteks organisasi yang unik mungkin memerlukan penyesuaian manual. Pastikan review internal dilakukan sebelum finalisasi.
            </Text>
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-yellow-700 bg-white/60 p-2 rounded border border-yellow-200 w-fit">
              <FiZap /> Pro Tip: Update data secara berkala sesuai kondisi lapangan.
            </div>
          </div>
        </div>
      </Card>

      {/* Sidebar Edit */}
      <EditRiskItemSidebar risk={editingRisk} isOpen={isEditSidebarOpen} onClose={handleCloseSidebar} onSave={handleSaveRisk} />
    </div>
  );
}

export default AssessmentDetailPage;
