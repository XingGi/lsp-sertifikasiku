// frontend/src/features/dashboard/components/AssessmentListWidget.jsx
import React, { useEffect, useState } from "react";
import { Card, Title, Text, Button, Badge } from "@tremor/react";
import { FiArrowRight, FiBriefcase, FiClock, FiLoader, FiFileText } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/api";
import { formatDate } from "../../../utils/formatters";

function AssessmentListWidget() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [basicRes, madyaRes] = await Promise.all([apiClient.get("/basic-assessments").catch(() => ({ data: [] })), apiClient.get("/madya-assessments").catch(() => ({ data: [] }))]);

        const basicData = (basicRes.data || []).map((item) => ({
          id: item.id,
          type: "Basic",
          name: item.nama_unit_kerja || `Basic #${item.id}`,
          status: "Active",
          date: item.updated_at || item.created_at,
          link: `/risk-management/dasar/edit/${item.id}`,
        }));

        const madyaData = (madyaRes.data || []).map((item) => ({
          id: item.id,
          type: "Madya",
          name: item.nama_asesmen || `Madya #${item.id}`,
          status: "Active",
          date: item.updated_at || item.created_at,
          link: `/risk-management/madya/form/${item.id}`,
        }));

        // Sort desc, LIMIT 10
        setAssessments([...basicData, ...madyaData].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10));
      } catch (error) {
        console.error("Err:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Card className="border-t-4 border-purple-500 shadow-md h-full flex flex-col bg-white max-h-[500px]">
      {" "}
      {/* Limit Height */}
      <div className="flex justify-between items-center mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
            <FiBriefcase size={18} />
          </div>
          <div>
            <Title className="text-lg">Asesmen Terbaru</Title>
            <Text className="text-xs text-gray-500">10 aktivitas terakhir</Text>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar rounded-lg border border-gray-100 bg-gray-50/50">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <FiLoader className="animate-spin text-purple-500" />
          </div>
        ) : assessments.length > 0 ? (
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2">Nama</th>
                <th className="px-3 py-2 text-center">Tipe</th>
                <th className="px-3 py-2 text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {assessments.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="hover:bg-purple-50/40 cursor-pointer transition-colors group" onClick={() => navigate(item.link)}>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-700 group-hover:text-purple-700 line-clamp-1" title={item.name}>
                      {item.name}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Badge size="xs" className="rounded-md px-2 py-1" color={item.type === "Madya" ? "indigo" : "blue"}>
                      {item.type}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right text-slate-400">
                    <div className="flex items-center justify-end gap-1">
                      <FiClock size={10} /> {formatDate(item.date)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <FiFileText size={24} className="mb-2 opacity-50" />
            <Text>Belum ada data.</Text>
          </div>
        )}
      </div>
      <div className="mt-3 pt-2 flex justify-end border-t border-gray-100 shrink-0">
        <Button size="xs" variant="light" icon={FiArrowRight} iconPosition="right" onClick={() => navigate("/risk-management/madya")}>
          Lihat Semua
        </Button>
      </div>
    </Card>
  );
}
export default AssessmentListWidget;
