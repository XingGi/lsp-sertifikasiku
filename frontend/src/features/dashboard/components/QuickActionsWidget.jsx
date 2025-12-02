// frontend/src/features/dashboard/components/QuickActionsWidget.jsx
import React from "react";
import { Card, Title, Text } from "@tremor/react";
import { FiBriefcase, FiShield, FiSearch, FiZap, FiLock, FiUnlock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ActionButton = ({ icon: Icon, title, desc, color, onClick, disabled }) => {
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick && onClick(e);
  };
  return (
    <div
      onClick={handleClick}
      className={`relative w-full p-3 rounded-lg border transition-all duration-200 group overflow-hidden select-none ${
        disabled ? "bg-gray-50 border-gray-200 cursor-not-allowed" : `bg-white border-gray-100 hover:border-${color}-300 hover:shadow-sm hover:bg-${color}-50/30 cursor-pointer`
      }`}
    >
      <div className={`flex items-center gap-3 transition-all duration-300 ${disabled ? "group-hover:blur-sm group-hover:opacity-40 grayscale" : ""}`}>
        <div className={`p-2 rounded-lg shadow-sm ${disabled ? "bg-gray-200 text-gray-400" : `bg-${color}-100 text-${color}-600 group-hover:scale-105`}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1">
          <div className={`font-bold text-sm ${disabled ? "text-gray-500" : "text-slate-700 group-hover:text-slate-900"}`}>{title}</div>
          <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{desc}</div>
        </div>
        {!disabled && (
          <div className={`text-${color}-400 opacity-0 group-hover:opacity-100 transition-opacity`}>
            <FiZap size={14} />
          </div>
        )}
      </div>
      {disabled && (
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 bg-white/60 backdrop-blur-[1px]">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 text-white rounded shadow transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <FiLock size={10} />
            <span className="text-[9px] font-bold uppercase">Terkunci</span>
          </div>
        </div>
      )}
    </div>
  );
};

function QuickActionsWidget({ canBasic, canMadya, canHorizon }) {
  const navigate = useNavigate();
  return (
    <Card className="border-t-4 border-blue-500 shadow-md h-auto flex flex-col bg-white">
      {" "}
      {/* h-auto agar tidak stretch */}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
          <FiZap size={18} />
        </div>
        <div>
          <Title className="text-lg">Aksi Cepat</Title>
          <Text className="text-xs text-gray-500">Pintasan menu</Text>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <ActionButton icon={FiBriefcase} title="Asesmen Dasar" desc="Unit kerja & operasional" color="blue" onClick={() => navigate("/risk-management/dasar/new")} disabled={!canBasic} />
        <ActionButton icon={FiShield} title="Asesmen Madya" desc="Proyek & strategis" color="orange" onClick={() => navigate("/risk-management/madya")} disabled={!canMadya} />
        <ActionButton icon={FiSearch} title="Horizon Scanning" desc="Analisis tren masa depan" color="indigo" onClick={() => navigate("/addons/horizon-scanner")} disabled={!canHorizon} />
      </div>
    </Card>
  );
}
export default QuickActionsWidget;
