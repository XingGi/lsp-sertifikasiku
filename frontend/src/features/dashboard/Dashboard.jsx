// frontend/src/features/dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Grid, Title, Text, Flex, Metric, Card, Button } from "@tremor/react";
import { FiActivity, FiAlertCircle, FiCheckCircle, FiLayers, FiSearch, FiLock, FiClock, FiZap, FiUnlock, FiBriefcase, FiBarChart2 } from "react-icons/fi";
import apiClient from "../../api/api";
import { useAuth } from "../../context/AuthContext";

// Widget Components
import AssessmentListWidget from "./components/AssessmentListWidget";
import HorizonScanWidget from "./components/HorizonScanWidget";
import QuickActionsWidget from "./components/QuickActionsWidget";
import TopRisksWidget from "./components/TopRisksWidget";
import RiskMatrixWidget from "./components/RiskMatrixWidget";

// --- RESTRICTED WIDGET (Hover Lock Effect) ---
const RestrictedWidget = ({ title, description, icon: Icon, color }) => (
  <Card className="relative h-full overflow-hidden group cursor-not-allowed border border-gray-200 shadow-sm bg-white">
    {/* Layer 1: Konten Normal (Blur saat Hover) */}
    <div className="h-full flex flex-col items-center justify-center text-center p-6 transition-all duration-300 group-hover:blur-md group-hover:opacity-30 group-hover:scale-95">
      <div className={`p-4 rounded-full bg-${color}-50 text-${color}-400 mb-4`}>{Icon ? <Icon size={28} /> : <FiLock size={28} />}</div>
      <Title className="text-gray-600">{title}</Title>
      <Text className="text-sm text-gray-400 mt-2 line-clamp-2">{description}</Text>
    </div>

    {/* Layer 2: Overlay Lock (Muncul saat Hover) */}
    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 bg-white/40">
      <div className="bg-slate-800 text-white p-3 rounded-full shadow-xl mb-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
        <FiLock size={24} />
      </div>
      <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-gray-200 shadow-lg">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Akses Terbatas</span>
      </div>
      <button className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
        <FiUnlock size={12} /> Upgrade Paket
      </button>
    </div>
  </Card>
);

const StatCard = ({ title, metric, icon: Icon, color, subtitle }) => (
  <Card className={`border-l-4 border-${color}-500 ring-1 ring-gray-100 shadow-md bg-white`}>
    <Flex alignItems="start">
      <div>
        <Text className="font-medium text-gray-500">{title}</Text>
        <Metric className="text-2xl font-bold text-slate-800 mt-1">{metric}</Metric>
      </div>
      <div className={`p-2.5 bg-${color}-50 rounded-xl text-${color}-600`}>
        <Icon size={24} />
      </div>
    </Flex>
    {subtitle && <Text className="mt-3 text-xs text-gray-400 flex items-center gap-1">{subtitle}</Text>}
  </Card>
);

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalRisks: 0, highRisks: 0, assessments: 0, actionPlans: 0 });
  const [loading, setLoading] = useState(true);

  // --- LOGIKA AKSES (SINKRON DENGAN SEEDS.PY) ---
  const hasAccess = (permissionName) => {
    // 1. Admin Bypass (Case Insensitive)
    const role = user?.role?.toLowerCase() || "";
    if (role === "admin" || role === "super admin" || role === "administrator") {
      return true;
    }

    // 2. Cek List Permission
    // Pastikan user.permissions adalah array.
    const userPermissions = Array.isArray(user?.permissions) ? user?.permissions : [];
    return userPermissions.includes(permissionName);
  };

  // --- DEFINISI AKSES (Sesuai seeds.py) ---
  // Basic Assessment
  const canAccessBasic = hasAccess("view_risk_dasar") || hasAccess("manage_risk_dasar");

  // Madya Assessment
  const canAccessMadya = hasAccess("view_risk_madya") || hasAccess("manage_risk_madya");

  // Horizon Scanning
  const canAccessHorizon = hasAccess("view_horizon_scanner");

  // BPR & RSCA (Ada beberapa permission terkait, kita cek salah satu atau kombinasi)
  const canAccessBPR = hasAccess("view_bpr") || hasAccess("manage_bpr") || hasAccess("view_rsca");

  // Core Access (Untuk Widget Utama: List, Matrix, TopRisk)
  // User bisa melihat ini jika punya akses ke Basic ATAU Madya
  const canAccessCore = canAccessBasic || canAccessMadya;

  const canAccessQRC = hasAccess("view_qrc_menu") || hasAccess("submit_qrc_assessment");

  useEffect(() => {
    // ... (Logic useEffect loadData tetap sama, TIDAK PERLU DIUBAH)
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch data hanya jika punya akses core, untuk efisiensi (opsional)
        // Tapi biar aman, fetch saja, kalau backend reject (403) kita catch errornya
        const [risksRes, basicRes, madyaRes, qrcRes] = await Promise.all([
          apiClient.get("/risk-inputs").catch(() => ({ data: [] })),
          apiClient.get("/basic-assessments").catch(() => ({ data: [] })),
          apiClient.get("/madya-assessments").catch(() => ({ data: [] })),
          apiClient.get("/qrc/my-history").catch(() => ({ data: [] })),
        ]);

        const allRisks = Array.isArray(risksRes.data) ? risksRes.data : [];
        const highRisks = allRisks.filter((r) => (r.residual_skor || 0) >= 12).length;

        const qrcCount = Array.isArray(qrcRes.data) ? qrcRes.data.length : 0;
        const totalAssessments = (basicRes.data?.length || 0) + (madyaRes.data?.length || 0);

        const plans = allRisks.filter((r) => r.rencana_penanganan && r.rencana_penanganan !== "-").length;

        setStats({
          totalRisks: allRisks.length,
          highRisks: highRisks,
          assessments: totalAssessments,
          actionPlans: plans,
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 gap-4">
        <FiActivity className="animate-bounce text-indigo-600" size={32} />
        <Text className="text-indigo-900 font-medium">Menyiapkan Dashboard...</Text>
      </div>
    );

  return (
    <div className="p-6 sm:p-10 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Title className="text-3xl font-bold text-slate-800">Dashboard</Title>
          <Text className="text-slate-500 mt-1">
            Selamat datang kembali, <span className="font-semibold text-indigo-600">{user?.nama_lengkap || user?.name || "User"}</span>.
          </Text>
        </div>
        <div className="hidden md:block">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-sm text-gray-600">
            <FiClock className="text-indigo-500" />
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Grid numItemsSm={2} numItemsLg={4} className="gap-6">
        <StatCard title="Total Risiko" metric={stats.totalRisks} icon={FiActivity} color="blue" subtitle="Teridentifikasi" />
        <StatCard title="Risiko Tinggi" metric={stats.highRisks} icon={FiAlertCircle} color="red" subtitle="Skor Residual ≥ 12" />
        <StatCard title="Total Asesmen" metric={stats.assessments} icon={FiLayers} color="purple" subtitle="Basic & Madya" />
        <StatCard title="Rencana Aksi" metric={stats.actionPlans} icon={FiCheckCircle} color="emerald" subtitle="Terdefinisi" />
      </Grid>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-10 items-start">
        {/* Kolom Kiri */}
        <div className="lg:col-span-1 space-y-6 h-full flex-col">
          <QuickActionsWidget
            canBasic={hasAccess("manage_risk_dasar")} // Khusus tombol "Buat Baru", cek permission 'manage'
            canMadya={hasAccess("manage_risk_madya")}
            canHorizon={canAccessHorizon}
          />

          {/* Top Risks */}
          <div className="flex-grow">
            {canAccessCore ? <TopRisksWidget /> : <RestrictedWidget title="Top Risiko Kritis" description="Analisis risiko tertinggi tidak tersedia tanpa akses Basic/Madya." icon={FiAlertCircle} color="rose" />}
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="lg:col-span-2 space-y-6">
          {/* Row 1: List & Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 lg:col-span-1 h-full">{canAccessCore ? <AssessmentListWidget /> : <RestrictedWidget title="Daftar Asesmen" description="Riwayat asesmen Anda terkunci." icon={FiBriefcase} color="purple" />}</div>
            <div className="md:col-span-2 lg:col-span-1 h-full">{canAccessCore ? <RiskMatrixWidget /> : <RestrictedWidget title="Peta Sebaran Risiko" description="Visualisasi matriks risiko terkunci." icon={FiLayers} color="teal" />}</div>
          </div>

          {/* Row 2: Add-ons */}
          <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6">
            {canAccessHorizon ? <HorizonScanWidget /> : <RestrictedWidget title="Horizon Scanning" description="Pemindaian risiko masa depan dengan AI terkunci." icon={FiSearch} color="indigo" />}

            {canAccessBPR ? (
              <Card className="border-t-4 border-orange-500 shadow-md flex flex-col justify-center items-center h-full min-h-[200px] text-center hover:shadow-lg transition-shadow cursor-pointer bg-white">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-full mb-3">
                  <FiZap size={24} />
                </div>
                <Title>BPR & RCSA</Title>
                <Text className="text-sm text-gray-500 mt-2 px-4">Akses modul Business Process Review & RCSA.</Text>
                <Button size="xs" variant="light" color="orange" className="mt-4" onClick={() => (window.location.href = "/addons/bpr")}>
                  Mulai BPR
                </Button>
              </Card>
            ) : (
              <RestrictedWidget title="BPR & RCSA" description="Modul Analisis Proses Bisnis & RCSA terkunci." icon={FiLayers} color="orange" />
            )}

            {canAccessQRC ? (
              <Card
                className="border-t-4 border-red-500 shadow-md flex flex-col justify-center items-center h-full min-h-[200px] text-center hover:shadow-lg transition-shadow cursor-pointer bg-white group"
                onClick={() => (window.location.href = "/qrc/assessments")}
              >
                <div className="p-3 bg-red-50 text-red-600 rounded-full mb-3 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <FiZap size={24} />
                </div>
                <Title>Quick Risk Check</Title>
                <Text className="text-sm text-gray-500 mt-2 px-4">Diagnosa kesehatan risiko cepat & analisis mendalam.</Text>
                <Button size="xs" variant="light" color="red" className="mt-4">
                  Mulai Scan
                </Button>
              </Card>
            ) : (
              <RestrictedWidget title="Quick Risk Scan" description="Fitur diagnosa cepat terkunci." icon={FiZap} color="red" />
            )}
          </Grid>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
