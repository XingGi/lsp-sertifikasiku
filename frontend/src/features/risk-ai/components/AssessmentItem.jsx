// frontend/src/features/risk-ai/components/AssessmentItem.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Title, Text, Badge, Button } from "@tremor/react";
import { FiCpu, FiBriefcase, FiCalendar, FiArrowRight, FiTrash2, FiCheckSquare, FiSquare } from "react-icons/fi";
import { formatDate } from "../../../utils/formatters";

// Helper warna badge berdasarkan level risiko
const getRiskLevelColor = (level) => {
  switch (level) {
    case "High":
      return "rose";
    case "Moderate to High":
      return "orange";
    case "Moderate":
      return "yellow";
    case "Low to Moderate":
      return "lime";
    case "Low":
      return "emerald";
    default:
      return "slate";
  }
};

const AssessmentItem = ({ assessment, isSelected, onSelect, industryName, onDelete, isDeleting, viewMode }) => {
  const navigate = useNavigate();

  // Hitung Level Risiko Tertinggi
  const getHighestRiskLevel = () => {
    if (!assessment.risks || assessment.risks.length === 0) return "Not Assessed";
    const maxScore = Math.max(...assessment.risks.map((r) => (r.inherent_likelihood || 0) * (r.inherent_impact || 0)));
    if (maxScore >= 15) return "High";
    if (maxScore >= 8) return "Moderate to High";
    if (maxScore >= 4) return "Moderate";
    if (maxScore >= 2) return "Low to Moderate";
    if (maxScore > 0) return "Low";
    return "Not Assessed";
  };

  const riskLevel = getHighestRiskLevel();
  const riskColor = getRiskLevelColor(riskLevel);

  const handleCardClick = (e) => {
    // Jangan navigasi jika yang diklik adalah checkbox atau tombol hapus
    if (e.target.closest(".no-navigate")) return;
    navigate(`/risk-ai/assessments/${assessment.id}`);
  };

  // --- TAMPILAN LIST (TABEL) ---
  // (Bagian ini sebenarnya tidak terpakai jika menggunakan AppResourceTable di parent,
  // tapi disiapkan jika suatu saat ingin custom list view sendiri)
  if (viewMode === "list") {
    return (
      <div className={`group flex items-center justify-between p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${isSelected ? "bg-indigo-50/50" : ""}`} onClick={handleCardClick}>
        {/* ... (Kode list view sederhana jika diperlukan) ... */}
        <Text>List View Item (Gunakan Grid View untuk melihat perubahan)</Text>
      </div>
    );
  }

  // --- TAMPILAN GRID (KARTU MODERN) ---
  return (
    <Card
      className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-200 cursor-pointer flex flex-col ${
        isSelected ? "ring-2 ring-indigo-500 border-transparent" : ""
      }`}
      onClick={handleCardClick}
    >
      {/* Checkbox Absolut di Pojok Kanan Atas */}
      <div className="absolute top-4 right-4 z-10 no-navigate">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(assessment.id);
          }}
          className="text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
        >
          {isSelected ? <FiCheckSquare size={22} className="text-indigo-600" /> : <FiSquare size={22} />}
        </button>
      </div>

      {/* --- Header Kartu --- */}
      <div className="flex justify-between items-start mb-4 pr-8">
        {" "}
        {/* pr-8 memberi ruang untuk checkbox */}
        <div className="flex items-start gap-3">
          {/* Ikon Aksen */}
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
            <FiCpu size={20} />
          </div>
          <div>
            <Title className="text-base font-bold text-slate-800 line-clamp-2 group-hover:text-indigo-700 transition-colors">{assessment.nama_asesmen}</Title>
            {/* Badge Level Risiko dipindah ke bawah judul */}
            <Badge size="xs" color={riskColor} className="mt-2 rounded-md">
              {riskLevel}
            </Badge>
          </div>
        </div>
      </div>

      {/* --- Body: Metadata (Industri & Tanggal) --- */}
      <div className="flex-1 space-y-3 py-3 border-t border-b border-gray-100 text-sm">
        <div className="flex items-center gap-2.5 text-slate-600">
          <FiBriefcase className="text-slate-400 shrink-0" size={16} />
          <Text className="truncate">{industryName}</Text>
        </div>
        <div className="flex items-center gap-2.5 text-slate-600">
          <FiCalendar className="text-slate-400 shrink-0" size={16} />
          <div className="flex flex-col sm:flex-row sm:gap-1">
            <Text>
              Mulai: <span className="font-medium">{formatDate(assessment.tanggal_mulai) || "-"}</span>
            </Text>
          </div>
        </div>
      </div>

      {/* --- Footer: Aksi Modern --- */}
      <div className="mt-4 flex items-center justify-between gap-3">
        {/* Tombol View Modern */}
        <Button
          size="sm"
          variant="secondary"
          icon={FiArrowRight}
          iconPosition="right"
          className="bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 transition-all flex-1 sm:flex-none font-semibold rounded-md"
        >
          Lihat Detail
        </Button>

        {/* Tombol Hapus */}
        <div className="no-navigate">
          <Button
            size="sm"
            variant="light"
            icon={FiTrash2}
            color="rose"
            className="hover:bg-rose-50 p-2 rounded-lg transition-colors opacity-70 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            loading={isDeleting}
            disabled={isDeleting}
            title="Hapus Asesmen"
          />
        </div>
      </div>
    </Card>
  );
};

export default AssessmentItem;
