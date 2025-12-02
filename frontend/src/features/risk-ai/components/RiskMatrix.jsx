// frontend/src/features/risk-ai/components/RiskMatrix.jsx

import React, { useState, useEffect } from "react";
import { Card, Title, Text } from "@tremor/react";
import { FiGrid, FiLoader } from "react-icons/fi";
import apiClient from "../../../api/api";

// Helper warna sel berdasarkan skor
const getCellColor = (score) => {
  if (score >= 20) return "bg-red-600";
  if (score >= 16) return "bg-orange-500";
  if (score >= 12) return "bg-yellow-400";
  if (score >= 6) return "bg-lime-400";
  return "bg-green-500";
};

// Helper tema warna tooltip
const getTooltipTheme = (score) => {
  if (score >= 20) return { border: "border-red-500", text: "text-red-600", bg: "bg-red-50" };
  if (score >= 16) return { border: "border-orange-500", text: "text-orange-600", bg: "bg-orange-50" };
  if (score >= 12) return { border: "border-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50" };
  if (score >= 6) return { border: "border-lime-500", text: "text-lime-700", bg: "bg-lime-50" };
  return { border: "border-green-500", text: "text-green-600", bg: "bg-green-50" };
};

const legendItems = [
  { level: "5 - High", color: "bg-red-600" },
  { level: "4 - Moderate to High", color: "bg-orange-500" },
  { level: "3 - Moderate", color: "bg-yellow-400" },
  { level: "2 - Low to Moderate", color: "bg-lime-400" },
  { level: "1 - Low", color: "bg-green-500" },
];

function RiskMatrix({ risks = [] }) {
  // Struktur Data Matriks
  const matrixRisks = {};
  for (let i = 1; i <= 5; i++) {
    matrixRisks[i] = {};
    for (let l = 1; l <= 5; l++) {
      matrixRisks[i][l] = { inherent: [], residual: [] };
    }
  }

  // Kelompokkan Risiko
  risks.forEach((risk) => {
    const ii = risk.inherent_impact;
    const il = risk.inherent_likelihood;
    const ri = risk.residual_impact;
    const rl = risk.residual_likelihood;

    if (ii >= 1 && ii <= 5 && il >= 1 && il <= 5) matrixRisks[ii][il].inherent.push(risk);
    if (ri >= 1 && ri <= 5 && rl >= 1 && rl <= 5) matrixRisks[ri][rl].residual.push(risk);
  });

  // Generate Grid Cells
  const gridCells = [];
  for (let l = 5; l >= 1; l--) {
    for (let i = 1; i <= 5; i++) {
      const value = i * l;
      const cellData = matrixRisks[i][l];
      gridCells.push({ value, risks: cellData, key: `${i}-${l}`, impact: i, likelihood: l });
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row gap-6 h-full">
        {/* MATRIKS AREA */}
        <div className="flex-1 flex flex-col">
          <div className="flex flex-1">
            {/* Label Y (Likelihood) */}
            <div className="flex flex-col justify-between mr-2 py-4 h-auto w-6">
              <div className="flex-1 flex flex-col justify-between items-center font-bold text-xs text-gray-400">
                <span>5</span>
                <span>4</span>
                <span>3</span>
                <span>2</span>
                <span>1</span>
              </div>
              <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 -rotate-90 text-[10px] font-bold text-gray-400 tracking-widest hidden md:block">PROBABILITAS</div>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-5 gap-1.5 flex-1 relative">
              {gridCells.map((cell) => {
                const colorClass = getCellColor(cell.value);
                const totalRisks = cell.risks.inherent.length + cell.risks.residual.length;
                const theme = getTooltipTheme(cell.value);

                return (
                  <div
                    key={cell.key}
                    className={`relative group ${colorClass} rounded-md flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:z-20 cursor-default border border-white/20 h-24`}
                  >
                    <span className="text-white/60 font-bold text-3xl select-none absolute">{cell.value}</span>

                    {/* Indikator Jumlah Risiko */}
                    {totalRisks > 0 && (
                      <div className="z-10 flex gap-1 items-center">
                        {cell.risks.inherent.length > 0 && (
                          <span className="bg-white text-gray-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm border border-gray-300" title="Inherent">
                            {cell.risks.inherent.length}I
                          </span>
                        )}
                        {cell.risks.residual.length > 0 && (
                          <span className="bg-slate-900 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm border border-slate-700" title="Residual">
                            {cell.risks.residual.length}R
                          </span>
                        )}
                      </div>
                    )}

                    {/* TOOLTIP HOVER */}
                    {totalRisks > 0 && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2  hidden group-hover:block z-50 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className={`bg-white rounded-lg shadow-2xl border-l-4 ${theme.border} overflow-hidden text-left ring-1 ring-black/5`}>
                          <div className={`${theme.bg} px-3 py-2 border-b border-gray-100 flex justify-between items-center`}>
                            <span className={`text-xs font-bold ${theme.text}`}>
                              Skor: {cell.value} (P{cell.likelihood} x I{cell.impact})
                            </span>
                          </div>
                          <div className="p-2 max-h-48 overflow-y-auto custom-scrollbar space-y-2 bg-white">
                            {/* List Inherent */}
                            {cell.risks.inherent.length > 0 && (
                              <div>
                                <div className="text-[9px] font-bold text-gray-400 uppercase mb-1 bg-gray-50 p-1 rounded">Inherent Risks ({cell.risks.inherent.length})</div>
                                {cell.risks.inherent.map((r) => (
                                  <div key={r.id} className="text-[10px] text-gray-600 pl-2 border-l-2 border-gray-300 mb-1 py-0.5 hover:bg-gray-50 rounded-r">
                                    <span className="font-bold text-slate-800">{r.kode_risiko}</span> <span className="text-gray-500">- {r.deskripsi_risiko}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* List Residual */}
                            {cell.risks.residual.length > 0 && (
                              <div>
                                <div className="text-[9px] font-bold text-gray-400 uppercase mb-1 mt-2 bg-gray-50 p-1 rounded">Residual Risks ({cell.risks.residual.length})</div>
                                {cell.risks.residual.map((r) => (
                                  <div key={r.id} className="text-[10px] text-gray-600 pl-2 border-l-2 border-slate-800 mb-1 py-0.5 hover:bg-gray-50 rounded-r">
                                    <span className="font-bold text-slate-800">{r.kode_risiko}</span> <span className="text-gray-500">- {r.deskripsi_risiko}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Arrow */}
                        <div className="w-3 h-3 bg-white transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 shadow-sm border-b border-r border-gray-200"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Label X (Impact) */}
          <div className="flex ml-8 mt-2">
            <div className="flex-1 grid grid-cols-5 gap-1.5 text-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <Text key={i} className="text-xs font-bold text-gray-400">
                  {i}
                </Text>
              ))}
            </div>
          </div>
          <div className="text-center text-[10px] font-bold text-gray-400 mt-1 tracking-widest">DAMPAK</div>
        </div>

        {/* LEGENDA AREA */}
        <div className="w-full md:w-48 flex-shrink-0 border-l border-gray-100 pl-6 flex flex-col justify-center space-y-6">
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Level Risiko</h4>
            <div className="space-y-2">
              {legendItems.map((item) => (
                <div key={item.level} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${item.color} mr-2 shadow-sm ring-1 ring-black/5`}></div>
                  <span className="text-xs text-gray-600 font-medium">{item.level}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tipe Risiko</h4>
            <div className="space-y-2">
              <div className="flex items-center bg-white border border-gray-200 rounded-md px-2 py-1.5 shadow-sm">
                <span className="bg-white text-gray-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-gray-300 mr-2">I</span>
                <span className="text-xs text-gray-600">Inherent</span>
              </div>
              <div className="flex items-center bg-white border border-gray-200 rounded-md px-2 py-1.5 shadow-sm">
                <span className="bg-slate-900 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded mr-2 border border-slate-700">R</span>
                <span className="text-xs text-gray-600">Residual</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskMatrix;
