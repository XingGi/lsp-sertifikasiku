// frontend/src/features/admin/monitoring/AssessmentMonitoringPage.jsx
import React, { useEffect, useState } from "react";
import { Card, Title, Text, Button, Badge } from "@tremor/react";
import { FiMonitor, FiSettings, FiEye, FiActivity } from "react-icons/fi";
import apiClient from "../../../api/api";
import AppResourceTable from "../../../components/common/AppResourceTable";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AssessmentMonitoringPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Pastikan endpoint ini sudah ada di backend (competency.py)
    apiClient
      .get("/competency-tests/monitoring")
      .then((res) => setData(res.data))
      .catch((err) => toast.error("Gagal memuat data monitoring."))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: "asesi_name",
      header: "Nama Asesi",
      cell: (i) => <span className="font-bold text-slate-700">{i.asesi_name}</span>,
    },
    {
      key: "scheme_name",
      header: "Skema Sertifikasi",
      cell: (i) => i.scheme_name,
    },
    {
      key: "position",
      header: "Posisi Terkini",
      cell: (i) => (
        <div className="flex items-center gap-2">
          <Badge size="xs" color="indigo" icon={FiActivity}>
            {i.stage_name}
          </Badge>
          <span className="text-xs text-gray-500 hidden sm:inline">({i.current_task})</span>
        </div>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      cell: (i) => (
        <div className="flex gap-2 justify-end">
          <Button size="xs" variant="secondary" icon={FiEye} onClick={() => navigate(`/uji-kompetensi/studio/${i.id}`)} tooltip="Intip Studio">
            Lihat
          </Button>
          <Button size="xs" color="orange" icon={FiSettings} onClick={() => alert("Fitur Override akan dipasang disini nanti")} tooltip="Paksa Pindah Tahap">
            Atur
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600 shadow-sm border border-indigo-200">
          <FiMonitor size={28} />
        </div>
        <div>
          <Title className="text-2xl text-slate-800">Monitoring Asesmen</Title>
          <Text className="text-slate-500">Pantau progress seluruh asesi secara real-time.</Text>
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl">
        <AppResourceTable data={data} isLoading={loading} columns={columns} emptyMessage="Belum ada sesi asesmen yang berjalan." />
      </Card>
    </div>
  );
}
