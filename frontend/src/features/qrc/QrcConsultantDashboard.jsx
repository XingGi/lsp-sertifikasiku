// frontend/src/features/qrc/QrcConsultantDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiEye, FiEdit3, FiCheckCircle, FiClock, FiInbox, FiPieChart, FiArchive, FiRotateCcw, FiTrash2 } from "react-icons/fi";
import { qrcService } from "./api/qrcService";
// 1. Import Komponen ConfirmationDialog
import ConfirmationDialog from "../../components/common/ConfirmationDialog";

const QrcConsultantDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total_assessments: 0, pending_review: 0, in_progress: 0, completed: 0 });
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // 2. State untuk Dialog Konfirmasi Arsip
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [activeTab, statusFilter]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsData = await qrcService.getConsultantStats();
      setStats(statsData);

      const params = {
        status: statusFilter,
        search: searchQuery,
        archived: activeTab === "archive",
      };

      const listData = await qrcService.getAssessmentList(params);
      setAssessments(listData);
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadDashboardData();
  };

  const handleReview = (id) => {
    navigate(`/qrc/consultant/review/${id}`);
  };

  // 3a. Handler Tombol Arsip (Buka Dialog)
  const onArchiveClick = (id) => {
    setSelectedAssessmentId(id);
    setIsArchiveDialogOpen(true);
  };

  // 3b. Handler Konfirmasi (Eksekusi API)
  const handleConfirmArchive = async () => {
    if (!selectedAssessmentId) return;

    try {
      await qrcService.archiveAssessment(selectedAssessmentId);

      // Refresh data & tutup dialog
      loadDashboardData();
      setIsArchiveDialogOpen(false);
      setSelectedAssessmentId(null);
    } catch (error) {
      console.error("Gagal mengarsipkan:", error);
      alert("Terjadi kesalahan saat mengarsipkan data.");
    }
  };

  const handleRestore = async (id) => {
    try {
      await qrcService.restoreAssessment(id);
      loadDashboardData();
    } catch (error) {
      alert("Gagal mengembalikan data.");
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3.5 rounded-xl ${color === "red" ? "bg-red-50 text-red-600" : color === "blue" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="p-6 min-h-full bg-gray-50/50">
      <div className="max-w-full mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
            <FiPieChart size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Consultant Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Kelola antrean asesmen yang masuk.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Masuk" value={stats.total_assessments} icon={FiInbox} color="blue" />
          <StatCard title="Perlu Review" value={stats.pending_review} icon={FiClock} color="red" />
          <StatCard title="Sedang Proses" value={stats.in_progress} icon={FiEdit3} color="blue" />
          <StatCard title="Selesai" value={stats.completed} icon={FiCheckCircle} color="emerald" />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 bg-gray-50/30">
            <div className="flex space-x-1 bg-gray-200/60 p-1 rounded-xl self-start">
              <button
                onClick={() => setActiveTab("inbox")}
                className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "inbox" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"}`}
              >
                <FiInbox /> Inbox (Aktif)
              </button>
              <button
                onClick={() => setActiveTab("archive")}
                className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "archive" ? "bg-white text-gray-700 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"}`}
              >
                <FiArchive /> Arsip
              </button>
            </div>

            <form onSubmit={handleSearch} className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari Client / Institusi..."
                className="pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none w-full md:w-64 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Client / User</th>
                  <th className="px-6 py-4">Tipe & Skor</th>
                  <th className="px-6 py-4 text-center">Status Sistem</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                      Memuat data...
                    </td>
                  </tr>
                ) : assessments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">
                      {activeTab === "inbox" ? "Tidak ada asesmen baru di Inbox." : "Arsip kosong."}
                    </td>
                  </tr>
                ) : (
                  assessments.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{item.client_name}</div>
                        <div className="text-xs text-gray-500">{item.institution}</div>
                        <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                          <FiClock size={10} />
                          {new Date(item.submission_date + "Z").toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${item.assessment_type === "essay" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                            {item.assessment_type === "essay" ? "Essay" : "Standard"}
                          </span>
                        </div>

                        {/* PERBAIKAN: Tampilkan jika Standard ATAU jika Skor > 0 (Essay yang sudah dinilai) */}
                        {(item.assessment_type === "standard" || item.risk_score > 0) && (
                          <div className="text-xs font-bold text-gray-700">
                            Skor: {item.risk_score} <span className="font-normal text-gray-500">({item.risk_level})</span>
                          </div>
                        )}

                        {/* Opsional: Jika Essay belum dinilai */}
                        {item.assessment_type === "essay" && item.risk_score === 0 && <div className="text-[10px] text-gray-400 italic mt-1">Belum dinilai</div>}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {item.assessment_type === "standard" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Auto Selesai
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              item.status === "submitted"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : item.status === "in_review"
                                ? "bg-blue-50 text-blue-700 border border-blue-100"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === "submitted" ? "bg-amber-500 animate-pulse" : "bg-blue-500"}`}></span>
                            {item.status === "submitted" ? "Perlu Review" : item.status === "in_review" ? "Sedang Review" : "Selesai"}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleReview(item.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-bold transition-all shadow-sm"
                            title="Buka Workspace Review"
                          >
                            <FiEdit3 /> Review
                          </button>

                          {activeTab === "inbox" ? (
                            <button
                              onClick={() => onArchiveClick(item.id)} // <-- Menggunakan handler baru
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Pindahkan ke Arsip"
                            >
                              <FiArchive size={16} />
                            </button>
                          ) : (
                            <button onClick={() => handleRestore(item.id)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Kembalikan ke Inbox">
                              <FiRotateCcw size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Render Dialog Konfirmasi */}
      <ConfirmationDialog
        isOpen={isArchiveDialogOpen}
        onClose={() => setIsArchiveDialogOpen(false)}
        onConfirm={handleConfirmArchive}
        title="Arsipkan Asesmen?"
        message="Data ini akan dipindahkan dari Inbox utama ke tab Arsip. Anda masih bisa melihatnya kapan saja."
        confirmText="Ya, Arsipkan"
        cancelText="Batal"
        variant="warning" // Menggunakan style warning/danger agar user aware
      />
    </div>
  );
};

export default QrcConsultantDashboard;
