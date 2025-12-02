// frontend/src/components/AIGeneratedAnalysis.jsx

import React, { useState, useEffect } from "react";
import { Card, Title, Text, Accordion, AccordionHeader, AccordionBody, Flex, Icon } from "@tremor/react";
import { FiCpu, FiAlertOctagon, FiChevronsRight, FiZap, FiClipboard, FiTrendingUp, FiArrowRight, FiLoader, FiAlertCircle } from "react-icons/fi";
import apiClient from "../../../api/api";

// Komponen kecil untuk setiap seksi agar lebih rapi
const AnalysisSection = ({ icon, title, children }) => (
  <div className="py-4 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-3 mb-2">
      <div className="flex-shrink-0 text-blue-600 mt-1">{icon}</div>
      <h3 className="text-base md:text-lg font-semibold text-gray-800 leading-snug">{title}</h3>
    </div>
    <div className="pl-0 md:pl-8 text-sm text-gray-600 leading-relaxed break-words">{children}</div>
  </div>
);

function AIGeneratedAnalysis({ analysisData, assessmentId, onSummaryLoaded }) {
  // const [analysis, setAnalysis] = useState(analysisData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cek apakah data summary *belum* ada
    if (analysisData && !analysisData.ai_executive_summary) {
      console.log("Summary tidak ditemukan. Memulai fetch summary untuk Asesmen ID:", assessmentId);
      setIsLoading(true);
      setError(null);

      const fetchSummary = async () => {
        try {
          // Panggil API baru yang kita buat di backend
          const response = await apiClient.post(`/assessments/${assessmentId}/generate-summary`);
          // Update state lokal dengan data summary yang baru diterima
          onSummaryLoaded(response.data);
        } catch (err) {
          console.error("Gagal memuat AI Summary:", err);
          setError(err.response?.data?.msg || "AI gagal membuat ringkasan eksekutif.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchSummary();
    }
  }, [assessmentId, analysisData, onSummaryLoaded]);

  const { ai_executive_summary, ai_risk_profile_analysis, ai_immediate_priorities, ai_critical_risks_discussion, ai_implementation_plan, ai_next_steps } = analysisData || {};

  // --- Tampilan saat Loading (Panggilan AI ke-2) ---
  if (isLoading) {
    return (
      <Card className="mt-6 rounded-xl shadow-lg">
        <Flex justifyContent="center" alignItems="center" className="space-x-3 py-10">
          <Icon icon={FiLoader} className="animate-spin" size="lg" color="blue" />
          <div className="text-left">
            <Title className="text-tremor-content-strong">AI Sedang Bekerja</Title>
            <Text>Menulis ringkasan eksekutif dan rekomendasi... (Ini bisa memakan waktu hingga 30 detik)</Text>
          </div>
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-6 rounded-xl shadow-lg bg-rose-50 border-rose-200">
        <Flex justifyContent="center" alignItems="center" className="space-x-3 py-10">
          <Icon icon={FiAlertCircle} size="lg" color="rose" />
          <div className="text-left">
            <Title className="text-rose-800">Gagal Membuat Ringkasan</Title>
            <Text className="text-rose-700">{error}</Text>
          </div>
        </Flex>
      </Card>
    );
  }

  if (!ai_executive_summary) {
    return null;
  }

  return (
    <Card className="mt-6 rounded-xl shadow-lg border-l-4 border-purple-500 ring-1 ring-gray-100">
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-2">
        <div className="flex-shrink-0 p-3 rounded-xl bg-purple-50 text-purple-600">
          <FiCpu className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <Title className="text-xl text-slate-800">AI-Generated Analysis</Title>
          <Text className="text-sm text-slate-500">Intelligent risk assessment conclusions and recommendations.</Text>
        </div>
      </div>

      <Accordion className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
        <AccordionHeader className="bg-gray-50 hover:bg-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <FiAlertOctagon className="w-5 h-5 text-purple-600" />
            <span className="font-bold text-slate-700 text-sm md:text-base">AI Analysis & Conclusion</span>
          </div>
        </AccordionHeader>
        <AccordionBody className="px-4 py-2 bg-white">
          <div className="divide-y divide-gray-200">
            <AnalysisSection icon={<FiChevronsRight />} title="Kesimpulan Risk Assessment">
              <p className="whitespace-pre-line">{ai_executive_summary}</p>
            </AnalysisSection>

            <AnalysisSection icon={<FiClipboard />} title="Analisis Profil Risiko">
              <p className="mb-3 font-medium text-slate-700">{ai_risk_profile_analysis?.summary}</p>
              <ul className="list-disc list-outside ml-4 space-y-1 text-slate-600 marker:text-purple-400">
                {ai_risk_profile_analysis?.distribution &&
                  Object.entries(ai_risk_profile_analysis.distribution).map(([level, count]) => (
                    <li key={level}>
                      Risiko tingkat '{level}': <span className="font-bold text-slate-800 capitalize">{count} risiko</span>
                    </li>
                  ))}
              </ul>
            </AnalysisSection>

            <AnalysisSection icon={<FiZap />} title="Prioritas Tindakan Segera">
              <ul className="list-decimal list-outside ml-4 space-y-2 text-slate-700 marker:font-bold marker:text-purple-600">
                {ai_immediate_priorities?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </AnalysisSection>

            <AnalysisSection icon={<FiTrendingUp />} title="Risiko Kritis & Mitigasi">
              <div className="space-y-4 mt-2">
                {ai_critical_risks_discussion?.map((item, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="font-bold text-slate-800 flex flex-col sm:flex-row sm:gap-2 mb-1">
                      <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-xs w-fit">{item.risk_code}</span>
                      <span>{item.discussion}</span>
                    </div>
                    <div className="text-xs mt-2 flex gap-2 items-start">
                      <span className="font-bold text-slate-500 shrink-0">Target:</span>
                      <span className="text-slate-700">{item.mitigation_target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </AnalysisSection>

            <AnalysisSection icon={<FiArrowRight />} title="Rencana Implementasi">
              <ul className="list-disc list-outside ml-4 space-y-1 text-slate-600">
                {ai_implementation_plan?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </AnalysisSection>

            <AnalysisSection icon={<FiChevronsRight />} title="Langkah Selanjutnya">
              <p className="prose prose-sm max-w-none">{ai_next_steps}</p>
            </AnalysisSection>
          </div>
        </AccordionBody>
      </Accordion>
    </Card>
  );
}

export default AIGeneratedAnalysis;
