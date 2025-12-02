// frontend/src/features/risk-management/templates/components/TemplateViewModal.jsx
import React from "react";
import { Card, Title, Text, Button, Badge, Dialog, DialogPanel } from "@tremor/react";
import { FiX, FiInfo, FiTag, FiGrid, FiList, FiShield, FiLayout } from "react-icons/fi";

const MatrixCell = ({ score, color, name }) => (
  <div
    className="h-14 w-full rounded-md flex flex-col items-center justify-center text-center p-1 shadow-sm border border-gray-200 transition-transform hover:scale-105 cursor-default"
    style={{ backgroundColor: color || "#f3f4f6" }}
    title={`${name} (Skor: ${score})`}
  >
    <span className="font-bold text-gray-800 text-lg leading-none">{score}</span>
    <span className="text-[10px] font-medium text-gray-600 truncate w-full px-1 mt-1">{name}</span>
  </div>
);

function TemplateViewModal({ isOpen, onClose, templateData }) {
  if (!isOpen || !templateData) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} static={true}>
      <DialogPanel className="w-full max-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header Section */}
        <div className="bg-white p-6 border-b border-gray-200 flex justify-between items-start shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 hidden sm:block">
              <FiLayout size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Title className="text-xl text-slate-800">{templateData.name}</Title>
                {templateData.is_default && (
                  <Badge icon={FiShield} color="blue" size="xs">
                    Default Sistem
                  </Badge>
                )}
              </div>
              <Text className="text-slate-500 text-sm mt-1">Detail konfigurasi matriks dan level risiko.</Text>
            </div>
          </div>
          <Button icon={FiX} variant="light" onClick={onClose} color="slate" className="hover:bg-slate-100 rounded-full p-2" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kolom Kiri: Info & Label */}
            <div className="lg:col-span-1 space-y-6">
              {/* Deskripsi */}
              <Card className="border-l-4 border-indigo-500 shadow-md ring-1 ring-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <FiInfo size={18} />
                  </div>
                  <Title as="h3" className="text-base">
                    Deskripsi
                  </Title>
                </div>
                <Text className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{templateData.description || "Tidak ada deskripsi."}</Text>
              </Card>

              {/* Label Sumbu */}
              <Card className="border-l-4 border-purple-500 shadow-md ring-1 ring-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <FiTag size={18} />
                  </div>
                  <Title as="h3" className="text-base">
                    Label Sumbu
                  </Title>
                </div>

                <div className="space-y-6">
                  <div>
                    <Text className="font-medium text-purple-700 text-xs uppercase tracking-wider mb-2">Sumbu Y (Probabilitas)</Text>
                    <div className="space-y-1 pl-2 border-l-2 border-purple-100">
                      {templateData.likelihood_labels
                        .sort((a, b) => b.level - a.level)
                        .map((item) => (
                          <div key={item.level} className="flex justify-between text-sm py-0.5">
                            <span className="font-bold text-gray-400 text-xs w-6">L{item.level}</span>
                            <span className="text-gray-700 truncate" title={item.label}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <Text className="font-medium text-purple-700 text-xs uppercase tracking-wider mb-2">Sumbu X (Dampak)</Text>
                    <div className="space-y-1 pl-2 border-l-2 border-purple-100">
                      {templateData.impact_labels
                        .sort((a, b) => a.level - b.level)
                        .map((item) => (
                          <div key={item.level} className="flex justify-between text-sm py-0.5">
                            <span className="font-bold text-gray-400 text-xs w-6">L{item.level}</span>
                            <span className="text-gray-700 truncate" title={item.label}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Kolom Kanan: Matriks & Legend */}
            <div className="lg:col-span-2 space-y-6">
              {/* Peta Risiko */}
              <Card className="border-l-4 border-teal-500 shadow-md ring-1 ring-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                    <FiGrid size={20} />
                  </div>
                  <div>
                    <Title as="h3">Peta Risiko</Title>
                    <Text className="text-xs text-slate-500">Visualisasi matriks skor 5x5.</Text>
                  </div>
                </div>

                <div className="flex items-stretch mt-4 bg-gray-50/50 p-4 rounded-xl border border-gray-200 overflow-x-auto">
                  <div className="min-w-[500px] w-full">
                    {/* Main Layout */}
                    <div className="flex">
                      {/* Vertical Label */}
                      <div className="flex items-center justify-center mr-4 w-8">
                        <span className="font-bold text-gray-400 tracking-widest text-[10px]" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                          PROBABILITAS
                        </span>
                      </div>

                      <div className="flex-1">
                        {/* Top Labels (Impact) */}
                        <div className="grid grid-cols-5 gap-2 ml-24 mb-2">
                          {templateData.impact_labels
                            .sort((a, b) => a.level - b.level)
                            .map((l) => (
                              <div key={l.level} className="text-[10px] font-medium text-center text-gray-500 truncate px-1" title={l.label}>
                                {l.label}
                              </div>
                            ))}
                        </div>

                        <div className="flex">
                          {/* Left Labels (Likelihood) */}
                          <div className="flex flex-col justify-around w-24 mr-2 space-y-2">
                            {templateData.likelihood_labels
                              .sort((a, b) => b.level - a.level)
                              .map((l) => (
                                <div key={l.level} className="h-14 flex items-center justify-end text-[10px] font-medium text-gray-500 text-right leading-tight line-clamp-2" title={l.label}>
                                  {l.label}
                                </div>
                              ))}
                          </div>

                          {/* Matrix Grid */}
                          <div className="flex-1 grid grid-cols-5 gap-2">
                            {Array.from({ length: 5 }, (_, i) => 5 - i).flatMap((l_level) =>
                              Array.from({ length: 5 }, (_, j) => j + 1).map((i_level) => {
                                const cell = templateData.scores?.find((s) => s.likelihood_level === l_level && s.impact_level === i_level);
                                const def = templateData.level_definitions.find((d) => cell?.score >= d.min_score && cell?.score <= d.max_score);
                                return <MatrixCell key={`${l_level}-${i_level}`} score={cell?.score || 0} color={def?.color_hex} name={def?.level_name} />;
                              })
                            )}
                          </div>
                        </div>
                        {/* Bottom Label */}
                        <div className="mt-3 text-center font-bold text-gray-400 tracking-widest text-[10px] ml-24">DAMPAK</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Legend / Definisi Level */}
              <Card className="border-l-4 border-orange-500 shadow-md ring-1 ring-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                    <FiList size={18} />
                  </div>
                  <Title as="h3" className="text-base">
                    Definisi Level Risiko
                  </Title>
                </div>
                <div className="flex flex-wrap gap-3">
                  {templateData.level_definitions.map((def, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm min-w-[140px]">
                      <span className="w-4 h-4 rounded shadow-sm border border-black/10 shrink-0" style={{ backgroundColor: def.color_hex }}></span>
                      <div>
                        <Text className="font-bold text-slate-700 text-xs">{def.level_name}</Text>
                        <Text className="text-[10px] text-slate-500">
                          Skor: {def.min_score} - {def.max_score}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-end shrink-0 z-10">
          <Button onClick={onClose} variant="secondary" color="slate">
            Tutup
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default TemplateViewModal;
