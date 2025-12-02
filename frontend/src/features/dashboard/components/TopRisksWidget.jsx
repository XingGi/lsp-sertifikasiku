// frontend/src/features/dashboard/components/TopRisksWidget.jsx
import React, { useEffect, useState } from "react";
import { Card, Title, Text, ProgressBar, Badge } from "@tremor/react";
import { FiAlertTriangle, FiLoader, FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/api";

function TopRisksWidget() {
  const [risks, setRisks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopRisks = async () => {
      try {
        const response = await apiClient.get("/risk-inputs");
        const allRisks = Array.isArray(response.data) ? response.data : [];
        // Sort & Limit 10
        setRisks(allRisks.sort((a, b) => (b.residual_skor || 0) - (a.residual_skor || 0)).slice(0, 10));
      } catch (error) {
        setRisks([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopRisks();
  }, []);

  const getRiskColor = (score) => {
    if (score >= 20) return "red";
    if (score >= 16) return "orange";
    if (score >= 12) return "yellow";
    return "blue";
  };

  return (
    <Card className="border-t-4 border-rose-500 shadow-md h-full flex flex-col bg-white max-h-[600px]">
      {" "}
      {/* Batasi tinggi */}
      <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
            <FiAlertTriangle size={18} />
          </div>
          <div>
            <Title className="text-lg">Top 10 Risiko</Title>
            <Text className="text-xs text-gray-500">Skor Residual Tertinggi</Text>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <FiLoader className="animate-spin text-rose-500" />
          </div>
        ) : risks.length > 0 ? (
          risks.map((risk, idx) => {
            const color = getRiskColor(risk.residual_skor || 0);
            const percentage = Math.min(((risk.residual_skor || 0) / 25) * 100, 100);
            return (
              <div
                key={idx}
                className="group p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm hover:border-rose-200 transition-all cursor-pointer"
                onClick={() => navigate(risk.madya_assessment_id ? `/risk-management/madya/form/${risk.madya_assessment_id}` : `/risk-management/dasar`)}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="pr-2 flex-1">
                    <Text className="font-bold text-slate-700 text-xs line-clamp-1 group-hover:text-rose-600 transition-colors" title={risk.deskripsi_risiko}>
                      {risk.kode_risiko ? `${risk.kode_risiko} - ` : ""}
                      {risk.deskripsi_risiko}
                    </Text>
                    <Text className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold truncate">{risk.unit_kerja || "Unit Kerja"}</Text>
                  </div>
                  <Badge size="xs" color={color} className="rounded px-2 py-1 shrink-0 scale-90 origin-right">
                    Skor: {risk.residual_skor || 0}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <ProgressBar value={percentage} color={color} className="h-1 rounded-full" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-100 rounded-xl text-center">
            <FiAlertCircle className="text-gray-300 mb-2" size={24} />
            <Text className="text-gray-400 text-sm">Aman terkendali.</Text>
          </div>
        )}
      </div>
    </Card>
  );
}
export default TopRisksWidget;
