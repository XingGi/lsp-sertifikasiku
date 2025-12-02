import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight, FiChevronLeft, FiSave, FiShield, FiActivity, FiServer, FiTrendingUp, FiCheckCircle } from "react-icons/fi";
import { qrcService } from "./api/qrcService";
import { toast } from "sonner";
import QrcPreviewModal from "./components/QrcPreviewModal";
import QrcSubmissionSuccessModal from "./components/QrcSubmissionSuccessModal";

const QrcWizardPage = () => {
  const navigate = useNavigate();

  // Tambahkan State untuk Pertanyaan
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeDimIndex, setActiveDimIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // FETCH DATA SAAT MOUNT
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await qrcService.getActiveQuestions("standard");
        setQuestions(data);
      } catch (error) {
        console.error("Gagal memuat pertanyaan:", error);
        toast.error("Gagal memuat pertanyaan dari server.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Gunakan 'questions' dari state, bukan file statis
  const dimensions = useMemo(() => {
    if (questions.length === 0) return [];

    const uniqueCats = [...new Set(questions.map((q) => q.category))];
    const icons = [FiShield, FiActivity, FiServer, FiTrendingUp];

    return uniqueCats.map((cat, idx) => ({
      name: cat,
      icon: icons[idx] || FiShield,
      questions: questions.filter((q) => q.category === cat),
    }));
  }, [questions]);

  const currentDimension = dimensions[activeDimIndex];

  if (loading) return <div className="p-10 text-center text-gray-500">Memuat formulir asesmen...</div>;
  if (!currentDimension) return <div className="p-10 text-center text-red-500">Data pertanyaan tidak ditemukan.</div>;

  const isDimComplete = (dimQuestions) => {
    return dimQuestions.every((q) => answers[q.id] !== undefined);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    if (activeDimIndex < dimensions.length - 1) {
      setActiveDimIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setShowPreview(true);
    }
  };

  const handlePrev = () => {
    if (activeDimIndex > 0) {
      setActiveDimIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await qrcService.submitAssessment(answers, "standard");
      setShowPreview(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Submit failed:", error);
      toast.error("Terjadi kesalahan saat mengirim data.");
    } finally {
      setIsSubmitting(false);
      setShowPreview(false);
    }
  };

  return (
    <div className="p-4 md:p-6 min-h-full bg-gray-50">
      <div className="max-w-full mx-auto">
        <div className="mb-6 text-center max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold tracking-wider mb-2 border border-red-100 uppercase">QRC - Quick Risk Check</span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Diagnosa Kesehatan Risiko</h1>
          <p className="mt-2 text-gray-500 text-sm md:text-base">Jawab {questions.length} pertanyaan singkat untuk deteksi dini profil risiko perusahaan.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SIDEBAR */}
          <div className="lg:col-span-3 space-y-3">
            {dimensions.map((dim, idx) => {
              const isActive = idx === activeDimIndex;
              const isDone = isDimComplete(dim.questions);
              const Icon = dim.icon;

              return (
                <div
                  key={idx}
                  onClick={() => setActiveDimIndex(idx)}
                  className={`
                    group relative overflow-hidden rounded-xl p-3 cursor-pointer transition-all duration-200 border-l-4
                    ${isActive ? "bg-white shadow-md border-red-600 ring-1 ring-gray-100" : "bg-white/50 hover:bg-white border-transparent hover:shadow-sm"}
                  `}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-400 group-hover:text-gray-600"}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className={`font-bold text-xs uppercase tracking-wide ${isActive ? "text-red-700" : "text-gray-500"}`}>{dim.name}</h3>
                        <p className="text-[10px] text-gray-400 mt-0.5">{dim.questions.length} Pertanyaan</p>
                      </div>
                    </div>
                    {isDone && <FiCheckCircle size={16} className="text-emerald-500" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* FORM CONTENT */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/40 border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">{currentDimension.name}</h2>
                  <p className="text-xs text-gray-500">Lengkapi data di bawah ini sesuai kondisi aktual.</p>
                </div>
                <div className="text-xs font-semibold px-3 py-1 bg-white rounded-md border border-gray-200 text-gray-600">
                  Step {activeDimIndex + 1} / {dimensions.length}
                </div>
              </div>

              <div className="p-6 space-y-8">
                {currentDimension.questions.map((q, qIdx) => (
                  <div key={q.id} className="animate-fadeIn">
                    <div className="flex gap-3 mb-3">
                      {/* Cari global index dari pertanyaan */}
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs mt-0.5">{questions.findIndex((x) => x.id === q.id) + 1}</span>
                      <h3 className="text-base font-medium text-gray-800 leading-snug">{q.text}</h3>
                    </div>

                    <div className="pl-9 grid grid-cols-1 md:grid-cols-3 gap-3">
                      {q.options?.map((opt) => {
                        const isSelected = answers[q.id] === opt.value;
                        return (
                          <div
                            key={opt.label}
                            onClick={() => handleAnswerChange(q.id, opt.value)}
                            className={`
                              cursor-pointer rounded-lg p-3 border transition-all duration-200 relative flex flex-col justify-center
                              ${isSelected ? "border-red-500 bg-red-50/40 shadow-sm" : "border-gray-200 bg-gray-50 hover:border-red-200 hover:bg-white"}
                            `}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-red-600 bg-red-600" : "border-gray-300 bg-white"}`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-red-700" : "text-gray-400"}`}>{opt.value === 10 ? "Baik" : opt.value === 5 ? "Cukup" : "Kurang"}</span>
                            </div>
                            <p className={`text-xs ${isSelected ? "text-gray-900 font-medium" : "text-gray-600"}`}>{opt.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={handlePrev}
                  disabled={activeDimIndex === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeDimIndex === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200 bg-white shadow-sm border border-gray-200"
                  }`}
                >
                  <FiChevronLeft size={16} /> Sebelumnya
                </button>

                <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-sm font-bold shadow-md shadow-red-900/10 hover:shadow-lg transition-all">
                  {activeDimIndex === dimensions.length - 1 ? (
                    <>
                      Review & Submit <FiSave size={16} />
                    </>
                  ) : (
                    <>
                      Selanjutnya <FiChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KIRIM PROP QUESTIONS KE MODAL */}
      <QrcPreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} answers={answers} onSubmit={handleSubmit} isSubmitting={isSubmitting} questions={questions} />
      <QrcSubmissionSuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} onToDashboard={() => navigate("/qrc/assessments")} type="standard" />
    </div>
  );
};

export default QrcWizardPage;
