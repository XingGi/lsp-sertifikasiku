// frontend/src/features/risk-management/madya/components/RiskMapVisualization.jsx
import React from "react";
import { Badge, Text } from "@tremor/react";

// Komponen Cell Matriks Internal
const MatrixCell = ({ scoreValue, color, risks = [], riskLabels }) => (
  <div
    className="h-16 rounded-md flex flex-wrap items-center justify-center p-1 gap-1 content-start overflow-y-auto border border-gray-300 relative" // Pastikan ada 'relative'
    style={{ backgroundColor: color || "#F3F4F6" }}
  >
    {/* Skor Latar Belakang */}
    {scoreValue !== null && scoreValue !== undefined && (
      <span
        className="absolute top-1 right-1.5 text-xs font-semibold text-indigo-950" // Ganti text-gray-400 opacity-70 -> text-gray-500
        style={{ zIndex: 1 }}
      >
        {scoreValue}
      </span>
    )}

    {/* Badge Nomor Risk Input */}
    {risks.map((riskIndex) => (
      <span // Ganti <Badge> menjadi <span>
        key={riskIndex}
        className="w-7 h-7 rounded-full flex items-center justify-center font-bold font-mono text-xs text-gray-800 bg-white border-4 border-gray-500 shadow-sm relative" // Style baru untuk lingkaran
        style={{ zIndex: 2 }}
      >
        {riskLabels[riskIndex] || riskIndex + 1}
      </span>
    ))}
  </div>
);

function RiskMapVisualization({ risks = [], templateData, type = "inherent", riskLabels = {} }) {
  // Validasi data template
  if (!templateData || !templateData.scores || !templateData.level_definitions || !templateData.likelihood_labels || !templateData.impact_labels) {
    return <Text className="text-center text-red-500">Data template peta risiko tidak lengkap.</Text>;
  }

  const matrixCellsData = {}; // Format: { "likelihood-impact": [riskIndex1, riskIndex2, ...] }

  risks.forEach((risk, index) => {
    const likelihood = type === "inherent" ? risk.inherent_probabilitas : risk.residual_probabilitas;
    const impact = type === "inherent" ? risk.inherent_dampak : risk.residual_dampak;

    // Hanya plot jika P dan I valid (angka 1-5)
    if (likelihood >= 1 && likelihood <= 5 && impact >= 1 && impact <= 5) {
      const key = `${likelihood}-${impact}`;
      if (!matrixCellsData[key]) {
        matrixCellsData[key] = [];
      }
      matrixCellsData[key].push(index); // Simpan index asli (0-based)
    }
  });

  const sortedLikelihoodLabels = [...templateData.likelihood_labels].sort((a, b) => b.level - a.level);
  const sortedImpactLabels = [...templateData.impact_labels].sort((a, b) => a.level - b.level);

  return (
    <div className="flex items-stretch">
      {/* Label Sumbu Y (Probabilitas) */}
      <div className="flex flex-col justify-around w-24 text-right pr-2 shrink-0">
        {sortedLikelihoodLabels.map((l) => (
          <div key={l.level} className="h-16 flex items-center justify-end font-medium text-xs">
            {l.label} ({l.level})
          </div>
        ))}
      </div>

      {/* Grid Matriks 5x5 */}
      <div className="flex-1 grid grid-cols-5 gap-1">
        {sortedLikelihoodLabels.flatMap((l_label) =>
          sortedImpactLabels.map((i_label) => {
            const l_level = l_label.level;
            const i_level = i_label.level;
            const key = `${l_level}-${i_level}`;

            const scoreEntry = templateData.scores.find((s) => s.likelihood_level === l_level && s.impact_level === i_level);
            let scoreValue = scoreEntry ? scoreEntry.score : null;
            if (scoreValue === null || scoreValue === undefined) {
              scoreValue = l_level * i_level; // Fallback calculation
            }
            const definition = templateData.level_definitions.find((d) => scoreValue >= d.min_score && scoreValue <= d.max_score);

            return <MatrixCell key={key} scoreValue={scoreValue} color={definition?.color_hex} risks={matrixCellsData[key] || []} riskLabels={riskLabels} />;
          })
        )}
      </div>
    </div>
  );
}

export default RiskMapVisualization;
