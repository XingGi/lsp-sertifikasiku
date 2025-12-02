// frontend/src/features/admin/RscaResultPage.jsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api/api";
import { Title, Text, Card, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge, Button, Flex, Icon, Divider, Dialog, DialogPanel, Grid } from "@tremor/react";
import { FiArrowLeft, FiCpu, FiLoader, FiAlertTriangle, FiCheckCircle, FiCheck, FiX, FiArchive, FiPlusSquare, FiList, FiZap, FiActivity } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import { toast } from "sonner";

// Components
import NotificationModal from "../../components/common/NotificationModal";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import ActionPlanModal from "./components/rsca/ActionPlanModal";
import { formatDate } from "../../utils/formatters";

// --- HELPERS ---
const getEffectivenessColor = (rating) => {
  if (rating === "Tidak Efektif") return "red";
  if (rating === "Perlu Perbaikan") return "amber";
  if (rating === "Efektif" || rating === "Sangat Efektif") return "green";
  return "gray";
};

const getStatusBadgeColor = (status) => {
  if (status === "Disetujui") return "emerald";
  if (status === "Ditolak") return "rose";
  if (status === "Menunggu Persetujuan") return "amber";
  return "gray";
};

// --- MARKDOWN RENDERER (STYLED) ---
const ParseBold = ({ text }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-800">
          {part.substring(2, part.length - 2)}
        </strong>
      );
    }
    return part;
  });
};

const ParsedMarkdown = ({ text }) => {
  if (!text) return null;
  const sections = text
    .split("\n## ")
    .map((s) => s.trim())
    .filter(Boolean);
  if (sections.length > 0 && !text.startsWith("## ")) sections[0] = sections[0].replace("## ", "");

  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        const newlineIndex = section.indexOf("\n");
        const title = newlineIndex !== -1 ? section.substring(0, newlineIndex) : `Bagian ${index + 1}`;
        const content = newlineIndex !== -1 ? section.substring(newlineIndex + 1) : section;

        return (
          <div key={index} className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                <RiRobot2Line size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-800">{title.replace(/^\d+\.\s*/, "")}</h3>
            </div>
            <div className="pl-1 text-sm text-slate-600 leading-relaxed">
              {content
                .split("\n")
                .filter((l) => l.trim())
                .map((line, i) => {
                  const trimmed = line.trim();
                  if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
                    return (
                      <li key={i} className="ml-4 list-disc mb-1">
                        <ParseBold text={trimmed.substring(2)} />
                      </li>
                    );
                  }
                  return (
                    <p key={i} className="mb-2">
                      <ParseBold text={trimmed} />
                    </p>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- API FETCHERS ---
const fetchCycleResults = async (cycleId) => {
  const { data } = await apiClient.get(`/admin/rsca-cycles/${cycleId}/results`);
  return data;
};

const triggerAIAnalysis = async (cycleId) => {
  const { data } = await apiClient.post(`/rsca-cycles/${cycleId}/analyze`);
  return data;
};

const updateRiskStatus = async ({ riskId, status }) => {
  const { data } = await apiClient.put(`/admin/submitted-risks/${riskId}/status`, { status: status });
  return data;
};

function RscaResultPage() {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const queryKey = ["rscaResult", cycleId];

  // State UI
  const [confirmStatusModal, setConfirmStatusModal] = useState({ isOpen: false, risk: null, newStatus: "" });
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [notificationModal, setNotificationModal] = useState({ isOpen: false, title: "", message: "" });
  const [isActionPlanModalOpen, setIsActionPlanModalOpen] = useState(false);
  const [actionPlanSource, setActionPlanSource] = useState(null);

  // Fetch Data
  const { data, isLoading, error } = useQuery({
    queryKey: queryKey,
    queryFn: () => fetchCycleResults(cycleId),
  });

  // Mutation AI
  const aiMutation = useMutation({
    mutationFn: () => triggerAIAnalysis(cycleId),
    onSuccess: () => {
      toast.success("Analisis AI berhasil!");
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (err) => {
      toast.error(err.response?.data?.msg || "Analisis AI gagal.");
    },
  });

  const handleAnalyze = async () => {
    setIsAiModalOpen(true);
    setAiProgress(0);
    const progressInterval = setInterval(() => setAiProgress((prev) => Math.min(prev + Math.floor(Math.random() * 10) + 5, 95)), 800);

    try {
      await aiMutation.mutateAsync(cycleId);
      clearInterval(progressInterval);
      setAiProgress(100);
      setTimeout(() => setIsAiModalOpen(false), 1000);
    } catch (err) {
      clearInterval(progressInterval);
      setIsAiModalOpen(false);
      setNotificationModal({ isOpen: true, title: "Analisis AI Gagal", message: err.response?.data?.msg || "Error" });
    }
  };

  // Mutation Status
  const statusMutation = useMutation({
    mutationFn: updateRiskStatus,
    onSuccess: (res) => {
      toast.success(res.msg || "Status berhasil diupdate!");
      queryClient.invalidateQueries({ queryKey: queryKey });
      setConfirmStatusModal({ isOpen: false, risk: null, newStatus: "" });
    },
    onError: (err) => toast.error("Gagal update status."),
  });

  const handleConfirmStatusUpdate = () => {
    if (confirmStatusModal.risk && confirmStatusModal.newStatus) {
      statusMutation.mutate({ riskId: confirmStatusModal.risk.id, status: confirmStatusModal.newStatus });
    }
  };

  const openActionPlanModal = (source) => {
    setActionPlanSource(source);
    setIsActionPlanModalOpen(true);
  };

  const handleActionPlanSaveSuccess = () => {
    setIsActionPlanModalOpen(false);
    setActionPlanSource(null);
    queryClient.invalidateQueries({ queryKey: queryKey });
  };

  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 gap-4">
        <FiLoader className="animate-spin text-indigo-600" size={32} />
        <Text>Memuat hasil kuesioner...</Text>
      </div>
    );

  if (error) return <div className="p-10 text-center text-red-500">Gagal memuat data: {error.message}</div>;
  if (!data) return <div className="p-10 text-center">Tidak ada data.</div>;

  const { cycle = {}, answers = [], ai_summary, submitted_risks = [] } = data;

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4">
          <Button variant="light" icon={FiArrowLeft} onClick={() => navigate("/admin/rsca")} className="rounded-full p-2 hover:bg-slate-200" />
          <div>
            <div className="flex items-center gap-2">
              <Title className="text-2xl text-slate-800">Hasil Kuesioner</Title>
              <Badge color="blue" size="xs" className="rounded-md px-3">
                {cycle.nama_siklus}
              </Badge>
            </div>
            <Text className="text-slate-500 mt-1">Institusi: {cycle.institution}</Text>
          </div>
        </div>

        <Button
          icon={FiCpu}
          onClick={handleAnalyze}
          loading={aiMutation.isPending}
          disabled={answers.length === 0}
          className={`shadow-lg transition-all rounded-xl ${ai_summary ? "text-white bg-purple-600 hover:bg-purple-700 border-purple-600" : "text-white bg-indigo-600 hover:bg-indigo-700 border-indigo-600"}`}
        >
          {ai_summary ? "Analisis Ulang AI" : "Buat Analisis AI"}
        </Button>
      </div>

      {/* --- AI SUMMARY CARD --- */}
      <Card className="border-l-4 border-purple-500 shadow-md ring-1 ring-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
            <FiZap size={20} />
          </div>
          <div>
            <Title>Analisis Cerdas (AI)</Title>
            <Text className="text-xs text-gray-500">Ringkasan otomatis dari jawaban kuesioner.</Text>
          </div>
        </div>

        {aiMutation.isPending && !isAiModalOpen ? (
          <div className="flex justify-center py-10 text-gray-400 gap-2">
            <FiLoader className="animate-spin" /> Memproses...
          </div>
        ) : ai_summary ? (
          <ParsedMarkdown text={ai_summary} />
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <FiCpu className="mx-auto text-gray-300 mb-2" size={32} />
            <Text className="text-gray-400">Belum ada analisis. Klik tombol di pojok kanan atas.</Text>
          </div>
        )}
      </Card>

      {/* --- TABEL AJUAN RISIKO --- */}
      <Card className="border-t-4 border-orange-500 shadow-md ring-1 ring-gray-100 p-0 overflow-hidden">
        <div className="px-6 py-5 bg-white border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
            <FiArchive size={20} />
          </div>
          <div>
            <Title className="text-base">Ajuan Risiko Baru ({submitted_risks.length})</Title>
            <Text className="text-xs text-gray-500">Risiko bottom-up dari departemen.</Text>
          </div>
        </div>

        <Table className="mt-0">
          <TableHead>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHeaderCell>Diajukan Oleh</TableHeaderCell>
              <TableHeaderCell>Departemen</TableHeaderCell>
              <TableHeaderCell className="w-[40%]">Detail Risiko</TableHeaderCell>
              <TableHeaderCell>Tanggal</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submitted_risks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-400 italic">
                  Belum ada ajuan risiko.
                </TableCell>
              </TableRow>
            ) : (
              submitted_risks.map((risk) => (
                <TableRow key={risk.id} className="hover:bg-orange-200/30 transition-colors">
                  <TableCell className="align-top font-medium">{risk.submitter?.nama_lengkap || "N/A"}</TableCell>
                  <TableCell className="align-top">{risk.department?.name || "N/A"}</TableCell>
                  <TableCell className="align-top whitespace-normal">
                    <Text className="font-bold text-slate-700 text-sm mb-1">{risk.risk_description}</Text>
                    <div className="text-xs text-gray-500 bg-orange-50/30 p-2 rounded-md border border-gray-100">
                      <span className="font-semibold">Penyebab:</span> {risk.potential_cause || "-"} <br />
                      <span className="font-semibold">Dampak:</span> {risk.potential_impact || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="align-top text-xs text-gray-500">{formatDate(risk.created_at)}</TableCell>
                  <TableCell className="align-top">
                    <Badge size="xs" className="rounded-md" color={getStatusBadgeColor(risk.status)}>
                      {risk.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top text-right">
                    {risk.status === "Menunggu Persetujuan" ? (
                      <div className="flex justify-end gap-1">
                        <Button size="xs" color="emerald" icon={FiCheck} onClick={() => setConfirmStatusModal({ isOpen: true, risk, newStatus: "Disetujui" })}>
                          Setuju
                        </Button>
                        <Button size="xs" color="rose" variant="secondary" icon={FiX} onClick={() => setConfirmStatusModal({ isOpen: true, risk, newStatus: "Ditolak" })}>
                          Tolak
                        </Button>
                      </div>
                    ) : risk.status === "Disetujui" ? (
                      <Button size="xs" variant="light" color="blue" icon={FiPlusSquare} onClick={() => openActionPlanModal({ origin_submitted_risk_id: risk.id, context_text: `Ajuan Risiko: ${risk.risk_description}` })}>
                        Mitigasi
                      </Button>
                    ) : (
                      <Text className="text-xs text-gray-400 italic">Selesai</Text>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* --- TABEL JAWABAN KUESIONER --- */}
      <Card className="border-t-4 border-blue-500 shadow-md ring-1 ring-gray-100 p-0 overflow-hidden">
        <div className="px-6 py-5 bg-white border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FiList size={20} />
          </div>
          <div>
            <Title className="text-base">Jawaban Kuesioner ({answers.length})</Title>
            <Text className="text-xs text-gray-500">Detail respon dari setiap departemen.</Text>
          </div>
        </div>

        <Table className="mt-0">
          <TableHead>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHeaderCell>Departemen</TableHeaderCell>
              <TableHeaderCell className="w-[30%]">Pertanyaan</TableHeaderCell>
              <TableHeaderCell>Tipe</TableHeaderCell>
              <TableHeaderCell>Jawaban</TableHeaderCell>
              <TableHeaderCell>Catatan</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {answers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-400 italic">
                  Belum ada jawaban masuk.
                </TableCell>
              </TableRow>
            ) : (
              answers.map((ans) => {
                const isFinding = ans.questionnaire?.question_type === "control_assessment" && ["Tidak Efektif", "Perlu Perbaikan"].includes(ans.control_effectiveness_rating);
                return (
                  <TableRow key={ans.id} className="hover:bg-blue-50/30 transition-colors">
                    <TableCell className="align-top font-medium text-slate-700">{ans.department?.name || "N/A"}</TableCell>
                    <TableCell className="align-top whitespace-normal text-sm">{ans.questionnaire?.pertanyaan}</TableCell>
                    <TableCell className="align-top">
                      <Badge size="xs" color="slate" className="rounded-md">
                        {ans.questionnaire?.question_type === "text" ? "Teks" : "Kontrol"}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top">
                      {ans.questionnaire?.question_type === "control_assessment" ? (
                        <Badge size="xs" color={getEffectivenessColor(ans.control_effectiveness_rating)} className="rounded-md">
                          {ans.control_effectiveness_rating}
                        </Badge>
                      ) : (
                        <Text className="text-sm text-slate-600 line-clamp-3" title={ans.jawaban}>
                          {ans.jawaban || "-"}
                        </Text>
                      )}
                    </TableCell>
                    <TableCell className="align-top text-xs text-gray-500 italic">{ans.catatan || "-"}</TableCell>
                    <TableCell className="align-top text-right">
                      {isFinding && (
                        <Button size="xs" variant="light" icon={FiPlusSquare} onClick={() => openActionPlanModal({ origin_answer_id: ans.id, context_text: `Pertanyaan: ${ans.questionnaire?.pertanyaan}` })}>
                          Mitigasi
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* --- MODALS --- */}
      <Dialog open={isAiModalOpen} onClose={() => {}} static={true} className="z-[100]">
        <DialogPanel className="max-w-md p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 relative">
            {aiProgress === 100 ? <FiCheckCircle className="text-emerald-500 h-8 w-8" /> : <FiCpu className="text-indigo-600 h-8 w-8 animate-pulse" />}
          </div>
          <Title className="text-xl">{aiProgress === 100 ? "Selesai!" : "AI Sedang Menganalisis"}</Title>
          <Text className="mt-2 text-sm text-gray-500">{aiProgress === 100 ? "Laporan siap ditampilkan." : "Mengolah data jawaban..."}</Text>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-6 overflow-hidden">
            <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${aiProgress}%` }}></div>
          </div>
        </DialogPanel>
      </Dialog>

      <ConfirmationDialog
        isOpen={confirmStatusModal.isOpen}
        onClose={() => !statusMutation.isPending && setConfirmStatusModal({ isOpen: false, risk: null, newStatus: "" })}
        onConfirm={handleConfirmStatusUpdate}
        title={`Konfirmasi ${confirmStatusModal.newStatus}`}
        message={`Ubah status ajuan ini menjadi ${confirmStatusModal.newStatus}?`}
        isLoading={statusMutation.isPending}
        confirmButtonText={confirmStatusModal.newStatus === "Disetujui" ? "Setujui" : "Tolak"}
        confirmButtonColor={confirmStatusModal.newStatus === "Disetujui" ? "emerald" : "rose"}
      />

      <ActionPlanModal isOpen={isActionPlanModalOpen} onClose={() => setIsActionPlanModalOpen(false)} sourceData={actionPlanSource} onSaveSuccess={handleActionPlanSaveSuccess} institution={cycle?.institution} cycleId={cycleId} />
    </div>
  );
}

export default RscaResultPage;
