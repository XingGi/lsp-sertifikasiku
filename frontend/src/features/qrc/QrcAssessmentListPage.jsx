// frontend/src/features/qrc/QrcAssessmentListPage.jsx
import React, { useState, useEffect } from "react";
import { FiPlus, FiClock, FiEye, FiZap, FiFileText, FiCheckSquare, FiActivity, FiAlertCircle } from "react-icons/fi";
import { qrcService } from "./api/qrcService";
import QrcTypeSelectionModal from "./components/QrcTypeSelectionModal";
import QrcDetailModal from "./components/QrcDetailModal";
import QrcLimitReachedModal from "./components/QrcLimitReachedModal";

const QrcAssessmentListPage = () => {
  const [history, setHistory] = useState([]);
  const [limits, setLimits] = useState(null); // State untuk limit
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState("standard");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch history & limits secara paralel
      const [historyData, limitsData] = await Promise.all([qrcService.getMyHistory(), qrcService.getMyLimits()]);

      setHistory(historyData);
      setLimits(limitsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (id) => {
    setSelectedId(id);
    setIsDetailOpen(true);
  };

  // Helper Card Limit
  const LimitCard = ({ type, data, icon: Icon, color }) => {
    if (!data) return null;
    const isFull = data.remaining === 0;

    return (
      <div className={`flex-1 bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4 transition-all ${isFull ? "border-red-200 bg-red-50/50" : "border-gray-200"}`}>
        <div className={`p-3 rounded-xl ${isFull ? "bg-red-100 text-red-600" : `bg-${color}-50 text-${color}-600`}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-0.5">{type}</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${isFull ? "text-red-600" : "text-gray-900"}`}>{data.remaining}</span>
            <span className="text-xs text-gray-400">/ {data.limit} Tersedia</span>
          </div>
        </div>
      </div>
    );
  };

  const handleNewAssessmentClick = () => {
    if (!limits) return;

    const stdEmpty = limits.standard.remaining === 0;
    const essayEmpty = limits.essay.remaining === 0;

    // Jika SEMUA kuota habis -> Tampilkan Modal Limit tipe 'all'
    if (stdEmpty && essayEmpty) {
      setLimitModalType("all");
      setShowLimitModal(true);
    } else {
      // Jika masih ada sisa, buka modal pilihan tipe
      setIsModalOpen(true);
    }
  };

  return (
    <div className="p-6 min-h-full bg-gray-50/50">
      <div className="max-w-full mx-auto space-y-8">
        {/* Header & Stats Row */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          {/* Title Section */}
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
              <FiCheckSquare size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">QRC Asesmen</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Kelola dan tinjau riwayat pemeriksaan risiko Anda.</p>
            </div>
          </div>

          {/* Limit Stats Cards */}
          {limits && (
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <LimitCard type="Standard QRC" data={limits.standard} icon={FiZap} color="red" />
              <LimitCard type="Deep Analysis" data={limits.essay} icon={FiFileText} color="blue" />
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex justify-end">
          <button
            onClick={handleNewAssessmentClick}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 bg-red-700 hover:bg-red-800 text-white shadow-red-900/10 hover:scale-105"
          >
            <FiPlus size={20} /> Asesmen Baru
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-bold text-sm text-gray-700 flex items-center gap-2">
              <FiClock className="text-gray-400" /> Daftar Riwayat
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">No</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4 text-center">Skor</th>
                  <th className="px-6 py-4 text-center">Level</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                      Memuat data...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400 italic">
                      Belum ada data asesmen.
                    </td>
                  </tr>
                ) : (
                  history.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-center text-gray-400">{index + 1}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {new Date(item.submission_date + "Z").toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {item.assessment_type === "essay" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                            <FiFileText size={12} /> Essay
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-100">
                            <FiZap size={12} /> Standard
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-gray-800">{item.risk_score > 0 ? item.risk_score : "-"}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            item.risk_score === 0 ? "bg-gray-100 text-gray-600" : item.risk_score >= 80 ? "bg-emerald-100 text-emerald-700" : item.risk_score >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.risk_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${item.status === "completed" ? "text-emerald-700 bg-emerald-50 border border-emerald-100" : "text-gray-600 bg-gray-100 border border-gray-200"}`}>
                          {item.status === "completed" ? "Selesai" : "Pending Review"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleViewDetail(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Lihat Detail">
                          <FiEye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <QrcTypeSelectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} limits={limits} />
      <QrcDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} assessmentId={selectedId} />
      <QrcLimitReachedModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} type={limitModalType} />
    </div>
  );
};

export default QrcAssessmentListPage;
