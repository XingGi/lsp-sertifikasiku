// frontend/src/features/dashboard/components/KRICard.jsx
import React from "react";
import { Card, Text, Title, Badge, Flex, ProgressBar } from "@tremor/react";
import { FiActivity, FiAlertCircle } from "react-icons/fi";

function KRICard({ kri }) {
  // Default values prevent crash if props missing
  const { nama_kri = "Indikator Tanpa Nama", deskripsi, target_value = 0, current_value = 0, satuan = "", ambang_batas_kritis } = kri || {};

  // Hitung persentase pencapaian (contoh logika)
  const percentage = target_value > 0 ? Math.min((current_value / target_value) * 100, 100) : 0;

  // Tentukan warna status
  const isCritical = current_value >= (ambang_batas_kritis || target_value);
  const statusColor = isCritical ? "red" : "emerald";

  return (
    <Card className={`border-l-4 border-${statusColor}-500 shadow-sm hover:shadow-md transition-shadow`}>
      <Flex alignItems="start" className="mb-2">
        <div>
          <Title className="text-sm font-bold text-slate-700 line-clamp-1" title={nama_kri}>
            {nama_kri}
          </Title>
          <Text className="text-xs text-gray-500 line-clamp-2 h-8 mt-1">{deskripsi || "Tidak ada deskripsi."}</Text>
        </div>
        <Badge size="xs" color={statusColor} icon={isCritical ? FiAlertCircle : FiActivity}>
          {isCritical ? "Kritis" : "Aman"}
        </Badge>
      </Flex>

      <div className="mt-4">
        <Flex className="mb-1">
          <Text className="text-xs font-medium text-slate-600">
            Realisasi: <span className="font-bold">{current_value}</span> {satuan}
          </Text>
          <Text className="text-xs text-gray-400">Target: {target_value}</Text>
        </Flex>
        <ProgressBar value={percentage} color={statusColor} className="h-2" />
      </div>
    </Card>
  );
}

export default KRICard;
