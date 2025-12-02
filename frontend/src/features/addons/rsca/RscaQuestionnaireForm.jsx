import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../api/api";
import { Title, Text, Button, Textarea, Select, SelectItem, Card, Badge, Flex, Icon, Grid, Subtitle, Dialog, DialogPanel } from "@tremor/react";
import { toast } from "sonner";
import { FiCalendar, FiAlertTriangle, FiFileText, FiCheckCircle, FiClock, FiMinusCircle, FiPlus, FiSend, FiArrowLeft } from "react-icons/fi";

// --- KOMPONEN BARU UNTUK PERTANYAAN TIPE KONTROL ---
const ControlAssessmentQuestion = ({ question, answerData, onChange }) => {
  const effectivenessOptions = [
    { value: "Sangat Efektif", text: "Sangat Efektif - Kontrol berjalan sangat baik." },
    { value: "Efektif", text: "Efektif - Kontrol berjalan baik sesuai desain." },
    { value: "Perlu Perbaikan", text: "Perlu Perbaikan - Kontrol ada tapi tidak konsisten." },
    { value: "Tidak Efektif", text: "Tidak Efektif - Kontrol gagal atau tidak ada." },
  ];

  const handleSelectChange = (value) => {
    onChange(question.id, "control_effectiveness_rating", value);
  };

  const handleNotesChange = (e) => {
    onChange(question.id, "catatan", e.target.value);
  };

  const selectedOption = effectivenessOptions.find((opt) => opt.value === (answerData?.control_effectiveness_rating || ""));
  const selectedColor = selectedOption ? selectedOption.color : "gray";

  return (
    <Card className="mb-4 bg-white shadow-sm border-l-4" decorationColor="blue">
      <label className="block font-semibold text-gray-800">{question.pertanyaan}</label>
      <Text className="text-sm text-gray-500 mb-2">Kategori: {question.kategori} (Penilaian Kontrol)</Text>
      <div className="mt-2">
        <Text className="font-medium">Penilaian Efektivitas Kontrol:</Text>
        <Select value={answerData?.control_effectiveness_rating || ""} onValueChange={handleSelectChange} placeholder="Pilih Efektivitas..." className="mt-1" color={selectedColor}>
          {effectivenessOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.text}
            </SelectItem>
          ))}
        </Select>
      </div>
      <div className="mt-2">
        <Text className="font-medium">Catatan / Bukti:</Text>
        <Textarea placeholder="Jelaskan temuan Anda atau bukti pendukung..." className="w-full p-2 border rounded mt-1" rows="2" value={answerData?.catatan || ""} onChange={handleNotesChange} />
      </div>
    </Card>
  );
};

const TextQuestion = ({ question, answerData, onChange }) => {
  return (
    <Card className="mb-4 bg-white shadow-sm border-l-4" decorationColor="blue">
      <label className="block font-semibold text-gray-800">{question.pertanyaan}</label>
      <Text className="text-sm text-gray-500 mb-2">Kategori: {question.kategori} (Pertanyaan Teks)</Text>
      <Textarea placeholder="Jawaban Anda..." className="w-full p-2 border rounded mt-1" rows="3" value={answerData?.jawaban || ""} onChange={(e) => onChange(question.id, "jawaban", e.target.value)} />
      <Textarea placeholder="Catatan (opsional)..." className="w-full p-2 border rounded mt-2" rows="2" value={answerData?.catatan || ""} onChange={(e) => onChange(question.id, "catatan", e.target.value)} />
    </Card>
  );
};

const mapAnswersToState = (answersList) => {
  const answerMap = {};
  if (answersList) {
    for (const ans of answersList) {
      answerMap[ans.questionnaire.id] = {
        jawaban: ans.jawaban,
        catatan: ans.catatan,
        control_effectiveness_rating: ans.control_effectiveness_rating,
        risk_register_id: ans.risk_register_id,
      };
    }
  }
  return answerMap;
};

// Fungsi helper untuk memformat tanggal
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString + "T00:00:00");
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

function SubmitRiskModal({ isOpen, onClose, cycleId, onRiskSubmitted }) {
  const [description, setDescription] = useState("");
  const [cause, setCause] = useState("");
  const [impact, setImpact] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) {
      toast.error("Deskripsi risiko wajib diisi.");
      return;
    }
    setIsSaving(true);

    try {
      const payload = {
        risk_description: description,
        potential_cause: cause,
        potential_impact: impact,
      };
      const response = await apiClient.post(`/rsca-cycles/${cycleId}/submit-risk`, payload);

      toast.success(response.data.msg || "Ajuan risiko berhasil dikirim.");
      onRiskSubmitted(response.data.submitted_risk);
      handleClose();
    } catch (err) {
      console.error("Gagal mengirim ajuan risiko:", err);
      toast.error(err.response?.data?.msg || "Gagal mengirim ajuan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    setDescription("");
    setCause("");
    setImpact("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} static={true}>
      <DialogPanel>
        <Title className="mb-4">Ajukan Risiko Baru</Title>
        <Text className="mb-4">Temukan risiko yang belum ada di kuesioner? Ajukan di sini untuk ditinjau oleh Manajer Risiko.</Text>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-tremor-default font-medium text-tremor-content-strong">Deskripsi Risiko (Wajib)</label>
            <Textarea value={description} onValueChange={setDescription} placeholder="Jelaskan risiko yang Anda temukan..." rows={3} required disabled={isSaving} className="mt-1" />
          </div>
          <div>
            <label className="text-tremor-default font-medium text-tremor-content-strong">Akar Penyebab (Opsional)</label>
            <Textarea value={cause} onValueChange={setCause} placeholder="Menurut Anda, apa penyebab risiko ini?" rows={2} disabled={isSaving} className="mt-1" />
          </div>
          <div>
            <label className="text-tremor-default font-medium text-tremor-content-strong">Potensi Dampak (Opsional)</label>
            <Textarea value={impact} onValueChange={setImpact} placeholder="Apa dampak terburuk yang bisa terjadi?" rows={2} disabled={isSaving} className="mt-1" />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={handleClose} disabled={isSaving}>
              Batal
            </Button>
            <Button type="submit" icon={FiSend} loading={isSaving} disabled={isSaving}>
              Kirim Ajuan
            </Button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}

function RscaQuestionnaireForm() {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const [cycle, setCycle] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitRiskModalOpen, setIsSubmitRiskModalOpen] = useState(false);

  useEffect(() => {
    const fetchQuestionnaireAndAnswers = async () => {
      try {
        // 1. Ambil pertanyaan DAN jawaban yang sudah ada secara bersamaan
        const [questionRes, answerRes] = await Promise.all([apiClient.get(`/rsca-cycles/${cycleId}/questionnaire`), apiClient.get(`/rsca-cycles/${cycleId}/my-answers`)]);

        setQuestions(questionRes.data.questions || []);
        setCycle(questionRes.data.cycle || {});

        // 2. Isi state 'answers' dengan jawaban yang sudah ada
        setAnswers(mapAnswersToState(answerRes.data));
      } catch (error) {
        console.error("Gagal memuat kuesioner atau jawaban:", error);
        toast.error(error.response?.data?.msg || "Gagal memuat data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestionnaireAndAnswers();
  }, [cycleId]);

  const handleAnswerChange = (questionId, field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedAnswers = Object.entries(answers).map(([questionId, answerData]) => ({
      questionnaire_id: parseInt(questionId),
      jawaban: answerData.jawaban || null,
      catatan: answerData.catatan || null,
      control_effectiveness_rating: answerData.control_effectiveness_rating || null,
      risk_register_id: answerData.risk_register_id || null,
    }));

    apiClient
      .post(`/rsca-cycles/${cycleId}/answers`, { answers: formattedAnswers })
      .then(() => {
        toast.success("Jawaban berhasil dikirim!");
        navigate("/addons/rsca");
      })
      .catch((error) => toast.error("Gagal mengirim jawaban. " + error.message));
  };

  if (isLoading) return <p>Memuat pertanyaan...</p>;

  const isPastDueDate = cycle?.tanggal_selesai && new Date() > new Date(cycle.tanggal_selesai);

  const getCycleStatusDisplay = (status) => {
    if (!status) return { text: "N/A", color: "gray", icon: FiMinusCircle };
    switch (status) {
      case "Draft":
        return { text: "Draf", color: "gray", icon: FiMinusCircle };
      case "Berjalan":
        return { text: "Berjalan", color: "blue", icon: FiClock };
      case "Selesai":
        return { text: "Selesai", color: "emerald", icon: FiCheckCircle };
      default:
        return { text: status, color: "gray", icon: FiMinusCircle };
    }
  };
  const cycleStatus = getCycleStatusDisplay(cycle?.status);

  return (
    <>
      <div className="p-6 sm:p-10 bg-gray-50 min-h-screen">
        {/* 1. Header Halaman yang Konsisten */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="light"
              icon={FiArrowLeft}
              onClick={() => navigate("/addons/rsca")} // Pastikan navigate sudah diimport
              className="rounded-full p-2 hover:bg-slate-200 transition-colors"
              title="Kembali ke daftar"
            />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 hidden sm:block">
                <FiFileText size={28} />
              </div>
              <div>
                <Title className="text-2xl text-slate-800">Kuesioner RSCA</Title>
                <Text className="text-slate-500 mt-1">Isi pertanyaan di bawah ini untuk departemen Anda.</Text>
              </div>
            </div>
          </div>

          {/* Badge Status di Kanan (Opsional, agar seimbang) */}
          <Badge color={cycleStatus.color} icon={cycleStatus.icon} className="rounded-md px-2 py-1 self-start sm:self-center">
            {cycleStatus.text}
          </Badge>
        </div>
        {/* 2. Bungkus semua dengan <form> di luar <Grid> */}
        <Grid numItemsLg={3} className="gap-6 items-start">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
            {/* 3. Kolom Kiri (Utama) untuk Pertanyaan */}
            {questions.length === 0 ? (
              <Card>
                <Text>Tidak ada pertanyaan yang ditemukan untuk siklus ini. Hubungi Manajer Risiko Anda.</Text>
              </Card>
            ) : (
              questions.map((q, index) => (
                <div key={q.id}>
                  <Text className="font-bold text-lg mb-2 text-tremor-content-strong">Pertanyaan {index + 1}</Text>
                  {q.question_type === "control_assessment" ? (
                    <ControlAssessmentQuestion question={q} answerData={answers[q.id]} onChange={handleAnswerChange} />
                  ) : (
                    <TextQuestion question={q} answerData={answers[q.id]} onChange={handleAnswerChange} />
                  )}
                </div>
              ))
            )}
            {questions.length > 0 && (
              <Button
                type="submit"
                className="w-full mt-4"
                size="lg"
                disabled={isPastDueDate || questions.length === 0}
                title={isPastDueDate ? "Tenggat waktu sudah terlewat" : "Kirim atau perbarui jawaban Anda"}
                color={isPastDueDate ? "gray" : "blue"}
              >
                {isPastDueDate ? "Tenggat Waktu Terlewat" : "Kirim Jawaban"}
              </Button>
            )}
          </form>

          {/* 4. Kolom Kanan (Sidebar) untuk Info & Aksi */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <Card>
                <Subtitle>Detail Siklus</Subtitle>
                <Title className="mt-1 mb-3">{cycle?.nama_siklus || "Memuat..."}</Title>

                <Badge className="rounded-md px-2 py-1" color={cycleStatus.color} icon={cycleStatus.icon}>
                  {cycleStatus.text}
                </Badge>

                <Flex className="mt-4 space-x-2 text-tremor-content" alignItems="center">
                  <Icon className="rounded-md px-2 py1" icon={FiCalendar} size="sm" color="gray" variant="solid" />
                  <Text>Mulai: {formatDate(cycle?.tanggal_mulai)}</Text>
                </Flex>
                <Flex className="mt-2 space-x-2" alignItems="center">
                  <Icon className="rounded-md px-2 py1" icon={FiCalendar} size="sm" color={isPastDueDate ? "rose" : "gray"} variant="solid" />
                  <Text color={isPastDueDate ? "rose" : "inherit"}>Selesai: {formatDate(cycle?.tanggal_selesai)}</Text>
                </Flex>
              </Card>
              {/* Card Aksi (Tombol & Peringatan) */}
              <Card>
                <Subtitle>Aksi</Subtitle>

                <Button icon={FiPlus} variant="secondary" className="w-full mt-4" onClick={() => setIsSubmitRiskModalOpen(true)} disabled={isPastDueDate} title="Ajukan risiko baru yang tidak ada di daftar">
                  Ajukan Risiko Baru
                </Button>

                {/* Peringatan Tenggat Waktu (jika ada) */}
                {isPastDueDate && (
                  <div className="mt-4">
                    <Card decoration="left" decorationColor="rose" className="bg-red-50">
                      <Flex>
                        <Icon icon={FiAlertTriangle} color="rose" variant="light" />
                        <div className="ml-3">
                          <Text color="rose" className="font-semibold">
                            Tenggat Waktu Terlewat
                          </Text>
                          <Text className="text-xs">Jawaban tidak dapat diubah lagi.</Text>
                        </div>
                      </Flex>
                    </Card>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </Grid>
      </div>
      <SubmitRiskModal
        isOpen={isSubmitRiskModalOpen}
        onClose={() => setIsSubmitRiskModalOpen(false)}
        cycleId={cycleId}
        onRiskSubmitted={(newRisk) => {
          console.log("Ajuan baru diterima:", newRisk);
        }}
      />
    </>
  );
}

export default RscaQuestionnaireForm;
