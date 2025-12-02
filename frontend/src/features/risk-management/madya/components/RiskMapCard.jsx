// frontend/src/features/risk-management/madya/components/RiskMapCard.jsx
import React, { useMemo } from "react";
import { Card, Title, Text, Grid } from "@tremor/react";
import RiskMapVisualization from "./RiskMapVisualization";
import { FiGrid } from "react-icons/fi";

function RiskMapCard({ risks = [], templateData }) {
  const hasTemplateData = templateData && templateData.likelihood_labels && templateData.impact_labels;

  const riskLabels = useMemo(() => {
    const labels = {};
    risks.forEach((risk, index) => {
      labels[index] = index + 1;
    });
    return labels;
  }, [risks]);

  return (
    <Card className="border-l-4 border-teal-500 shadow-md ring-1 ring-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
            <FiGrid size={24} />
          </div>
          <div>
            <Title>5. Peta Risiko</Title>
            <Text>Visualisasi pemetaan risiko inheren dan residual.</Text>
          </div>
        </div>
      </div>

      {!hasTemplateData ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Text className="text-gray-500">Data template belum tersedia atau tidak valid.</Text>
        </div>
      ) : (
        <Grid numItemsMd={1} numItemsLg={2} className="gap-8 mt-6 items-start">
          {/* Peta Risiko Inheren */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="text-center mb-4 pb-2 border-b border-gray-100">
              <Title order={5} className="text-teal-700">
                Peta Risiko Inheren
              </Title>
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[300px]">
                {" "}
                {/* Min-width agar tidak gepeng di HP */}
                <div className="text-center font-bold text-gray-400 tracking-widest text-[10px] mb-2">DAMPAK</div>
                <div className="flex">
                  <div className="flex items-center justify-center mr-2 w-6 flex-shrink-0">
                    <span className="font-bold text-gray-400 tracking-widest text-[10px]" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                      PROBABILITAS
                    </span>
                  </div>
                  <div className="flex-1">
                    <RiskMapVisualization risks={risks} templateData={templateData} type="inherent" riskLabels={riskLabels} />
                    <div className="grid grid-cols-5 gap-1 mt-2 ml-8">
                      {templateData.impact_labels
                        .sort((a, b) => a.level - b.level)
                        .map((l) => (
                          <div key={l.level} className="text-[10px] text-center text-gray-500 leading-tight break-words">
                            {l.label}
                            <br />({l.level})
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Peta Risiko Residual */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="text-center mb-4 pb-2 border-b border-gray-100">
              <Title order={5} className="text-blue-700">
                Peta Risiko Residual
              </Title>
            </div>

            {/* Scrollable Container untuk Mobile */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[300px]">
                <div className="text-center font-bold text-gray-400 tracking-widest text-[10px] mb-2">DAMPAK</div>
                <div className="flex">
                  <div className="flex items-center justify-center mr-2 w-6 flex-shrink-0">
                    <span className="font-bold text-gray-400 tracking-widest text-[10px]" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                      PROBABILITAS
                    </span>
                  </div>
                  <div className="flex-1">
                    <RiskMapVisualization risks={risks} templateData={templateData} type="residual" riskLabels={riskLabels} />
                    <div className="grid grid-cols-5 gap-1 mt-2 ml-8">
                      {templateData.impact_labels
                        .sort((a, b) => a.level - b.level)
                        .map((l) => (
                          <div key={l.level} className="text-[10px] text-center text-gray-500 leading-tight break-words">
                            {l.label}
                            <br />({l.level})
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Grid>
      )}

      {hasTemplateData && templateData.level_definitions && (
        <div className="mt-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <Text className="font-semibold mb-2 text-gray-600 text-xs uppercase tracking-wider">Catatan Level Risiko:</Text>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {templateData.level_definitions.map((def) => (
              <div key={def.level_name} className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full shadow-sm border border-black/10 flex-shrink-0" style={{ backgroundColor: def.color_hex }}></span>
                <Text className="text-xs text-gray-600 font-medium">
                  {def.level_name} ({def.min_score} - {def.max_score})
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default RiskMapCard;
