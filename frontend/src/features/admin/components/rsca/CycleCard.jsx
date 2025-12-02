// frontend/src/features/admin/components/rsca/CycleCard.jsx

import React from "react";
import { Card, Title, Badge, Button, Text } from "@tremor/react";
import { FiCalendar, FiBriefcase, FiEye, FiEdit, FiSettings, FiFileText } from "react-icons/fi";
import { formatDate } from "../../../../utils/formatters";

const getStatusColor = (status) => {
  switch (status) {
    case "Draft":
      return "slate";
    case "Berjalan":
      return "blue";
    case "Selesai":
      return "emerald";
    default:
      return "gray";
  }
};

const CycleCard = ({ cycle, onViewResults, onEdit, onEditQuestions }) => {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-all border-t-4 border-t-blue-500 p-0 overflow-hidden group cursor-default">
      {/* Bagian Konten Utama */}
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
              <FiFileText />
            </div>
            <Text className="text-xs font-bold text-blue-600 uppercase tracking-wider">Kuesioner</Text>
          </div>
          <Badge size="xs" className="rounded-md px-2.5" color={getStatusColor(cycle.status)}>
            {cycle.status}
          </Badge>
        </div>

        <Title className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{cycle.nama_siklus}</Title>

        {/* Metadata */}
        <div className="space-y-3 mt-4">
          <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <FiCalendar className="text-slate-400 shrink-0" />
            <div className="flex flex-col text-xs">
              <span className="text-gray-400">Periode</span>
              <span className="font-medium">
                {formatDate(cycle.tanggal_mulai)} - {formatDate(cycle.tanggal_selesai)}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm text-slate-600 px-1">
            <FiBriefcase className="text-slate-400 shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {cycle.departments && cycle.departments.length > 0 ? (
                cycle.departments.slice(0, 3).map((dep, idx) => (
                  <span key={idx} className="text-xs font-bold bg-white border border-gray-200 px-1.5 py-0.5 rounded-md text-gray-600">
                    {dep.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic">Belum ada departemen</span>
              )}
              {cycle.departments && cycle.departments.length > 3 && <span className="text-xs text-gray-400">+{cycle.departments.length - 3} more</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Footer Aksi */}
      <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
        {/* Tombol Edit Soal (Settings) */}
        <Button size="xs" variant="secondary" color="indigo" className="rounded-md" icon={FiSettings} onClick={() => onEditQuestions(cycle)} disabled={cycle.status !== "Draft"} title="Atur Pertanyaan" />

        {/* Tombol Edit Info */}
        <Button size="xs" variant="secondary" color="orange" className="rounded-md" icon={FiEdit} onClick={() => onEdit(cycle)} disabled={cycle.status !== "Draft"} title="Edit Informasi Siklus" />

        {/* Tombol Lihat Hasil (Main Action) */}
        <Button size="xs" variant="primary" color="blue" className="rounded-md" icon={FiEye} onClick={() => onViewResults(cycle)}>
          Hasil
        </Button>
      </div>
    </Card>
  );
};

export default CycleCard;
