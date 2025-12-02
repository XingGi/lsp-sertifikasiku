// frontend/src/features/dashboard/components/RiskMatrixWidget.jsx
import React, { useEffect, useState } from "react";
import { Card, Title, Text } from "@tremor/react";
import { FiGrid, FiLoader } from "react-icons/fi";
import apiClient from "../../../api/api";

// Helper warna background sel matriks
const getCellColor = (score) => {
  if (score >= 20) return "bg-red-600";
  if (score >= 16) return "bg-orange-500";
  if (score >= 12) return "bg-yellow-400";
  if (score >= 6) return "bg-lime-400";
  return "bg-green-500";
};

// Helper warna teks/border untuk tooltip agar kontras
const getTooltipTheme = (score) => {
  if (score >= 20) return { border: "border-red-500", text: "text-red-600", bg: "bg-red-50" };
  if (score >= 16) return { border: "border-orange-500", text: "text-orange-600", bg: "bg-orange-50" };
  if (score >= 12) return { border: "border-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50" }; // Yellow teks lebih gelap agar terbaca
  if (score >= 6) return { border: "border-lime-500", text: "text-lime-700", bg: "bg-lime-50" };
  return { border: "border-green-500", text: "text-green-600", bg: "bg-green-50" };
};

function RiskMatrixWidget() {
  const [matrixData, setMatrixData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        const response = await apiClient.get("/risk-inputs");
        const risks = response.data || [];

        const mapData = {};
        risks.forEach((risk) => {
          const p = parseInt(risk.residual_probabilitas) || 0;
          const i = parseInt(risk.residual_dampak) || 0;

          if (p > 0 && i > 0) {
            const key = `${p}-${i}`;
            if (!mapData[key]) mapData[key] = [];

            // Simpan objek data lengkap untuk tooltip
            mapData[key].push({
              code: risk.kode_risiko || "No Code",
              unit: risk.unit_kerja || "Unit Kerja",
              desc: risk.deskripsi_risiko, // Opsional, jika ingin ditampilkan
            });
          }
        });

        setMatrixData(mapData);
      } catch (error) {
        console.error("Gagal memuat matriks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiskData();
  }, []);

  const likelihoodLabels = [5, 4, 3, 2, 1];
  const impactLabels = [1, 2, 3, 4, 5];

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center min-h-[300px]">
        <FiLoader className="animate-spin h-8 w-8 text-teal-500" />
      </Card>
    );
  }

  return (
    <Card className="h-full border-t-4 border-teal-500 shadow-md bg-white flex flex-col overflow-visible">
      {/* overflow-visible penting agar tooltip tidak terpotong */}

      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
          <FiGrid size={20} />
        </div>
        <div>
          <Title>Peta Sebaran</Title>
          <Text className="text-xs text-gray-500">Distribusi Residual</Text>
        </div>
      </div>

      <div className="flex items-stretch mt-2 flex-1">
        <div className="flex flex-col justify-between mr-2 py-2 h-auto">
          {likelihoodLabels.map((l) => (
            <Text key={l} className="text-[10px] font-bold text-gray-400 h-full flex items-center">
              {l}
            </Text>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-5 gap-1 relative">
          {/* relative di grid container */}
          {likelihoodLabels.map((prob) =>
            impactLabels.map((impact) => {
              const score = prob * impact;
              const risksInCell = matrixData[`${prob}-${impact}`] || [];
              const count = risksInCell.length;
              const colorClass = getCellColor(score);
              const theme = getTooltipTheme(score); // Tema warna tooltip

              return (
                <div
                  key={`${prob}-${impact}`}
                  className={`relative group ${colorClass} rounded-sm flex items-center justify-center text-white font-bold text-sm transition-transform hover:scale-105 cursor-default shadow-sm aspect-square hover:z-20`}
                >
                  {count > 0 ? count : ""}

                  {/* --- TOOLTIP HOVER (Style Baru) --- */}
                  {count > 0 && (
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-50 w-48">
                      <div className={`bg-white rounded-lg shadow-xl border-l-4 ${theme.border} overflow-hidden text-left`}>
                        {/* Header Tooltip */}
                        <div className={`${theme.bg} px-3 py-1.5 border-b border-gray-100 flex justify-between items-center`}>
                          <span className={`text-xs font-bold ${theme.text}`}>Skor: {score}</span>
                          <span className="text-[10px] text-gray-500 font-medium">Total: {count}</span>
                        </div>

                        {/* List Risiko */}
                        <div className="p-2 max-h-32 overflow-y-auto custom-scrollbar">
                          {risksInCell.slice(0, 5).map((risk, idx) => (
                            <div key={idx} className="flex justify-between items-start mb-1.5 last:mb-0 border-b border-gray-50 pb-1 last:border-0 last:pb-0">
                              <span className="text-[10px] font-bold text-slate-700 mr-2 shrink-0">{risk.code}</span>
                              <span className="text-[9px] text-gray-500 leading-tight truncate w-24" title={risk.unit}>
                                {risk.unit}
                              </span>
                            </div>
                          ))}
                          {count > 5 && <div className="text-[9px] text-center text-indigo-500 font-medium pt-1 border-t border-gray-100 mt-1">+{count - 5} risiko lainnya</div>}
                        </div>
                      </div>
                      {/* Arrow Pointer */}
                      <div className="w-3 h-3 bg-white transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b border-gray-200 shadow-sm"></div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex ml-5 mt-1">
        <div className="flex-1 grid grid-cols-5 gap-1 text-center">
          {impactLabels.map((i) => (
            <Text key={i} className="text-[10px] font-bold text-gray-400">
              {i}
            </Text>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default RiskMatrixWidget;
