import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight, FiChevronLeft, FiSave, FiShield, FiActivity, FiServer, FiTrendingUp, FiCheckCircle, FiFileText, FiX } from "react-icons/fi";
import { toast } from "sonner";
import QrcSubmissionSuccessModal from "./components/QrcSubmissionSuccessModal";
import { qrcService } from "./api/qrcService";

const QrcEssayWizardPage = () => {
  const navigate = useNavigate();
  // State pertanyaan
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeDimIndex, setActiveDimIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // FETCH DATA
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await qrcService.getActiveQuestions("essay");
        setQuestions(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

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

  if (loading) return <div className="p-10 text-center">Memuat soal essay...</div>;
  if (!currentDimension) return <div className="p-10 text-center">Data tidak ditemukan.</div>;

  const isDimComplete = (dimQuestions) => {
    return dimQuestions.every((q) => answers[q.id] && answers[q.id].trim().length > 0);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
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
    if (activeDimIndex > 0) setActiveDimIndex((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await qrcService.submitAssessment(answers, "essay");
      setShowPreview(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Submit failed:", error);
      alert("Gagal mengirim.");
    } finally {
      setIsSubmitting(false);
      setShowPreview(false);
    }
  };

  // --- INTERNAL PREVIEW MODAL ---
  const EssayPreviewModal = () => {
    if (!showPreview) return null;
    const totalAnswered = Object.keys(answers).filter((k) => answers[k]?.trim()).length;
    const isComplete = totalAnswered === questions.length;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800">Review Jawaban Essay</h3>
            <button onClick={() => setShowPreview(false)}>
              <FiX size={20} className="text-gray-400 hover:text-red-600" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!isComplete && (
              <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm mb-4 border border-amber-200">
                Perhatian: Anda baru menjawab {totalAnswered} dari {questions.length} pertanyaan.
              </div>
            )}
            {questions.map((q, idx) => (
              <div key={q.id} className="border-b border-gray-100 pb-4 last:border-0">
                <p className="text-xs font-bold text-gray-500 mb-1">Pertanyaan {idx + 1}</p>
                <p className="text-sm font-medium text-gray-800 mb-2">{q.text}</p>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic whitespace-pre-wrap border border-gray-100">{answers[q.id] || <span className="text-red-400">Belum dijawab</span>}</div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
            <button onClick={() => setShowPreview(false)} className="px-4 py-2 text-gray-600 font-medium text-sm">
              Kembali Edit
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md flex items-center gap-2">
              {isSubmitting ? (
                "Processing..."
              ) : (
                <>
                  <FiCheckCircle /> Kirim Jawaban
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render utama mirip kode sebelumnya, tapi mapping pakai 'questions' state
  return (
    <div className="p-4 md:p-6 min-h-full bg-gray-50">
      <div className="max-w-full mx-auto">
        {/* ... Header (tetap sama) ... */}
        <div className="mb-6 text-center max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-wider mb-2 border border-blue-100 uppercase">QRC - Deep Analysis</span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analisis Risiko Mendalam</h1>
          <p className="mt-2 text-gray-500 text-sm">Jawab {questions.length} pertanyaan deskriptif untuk analisis kualitatif.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-3">
            {dimensions.map((dim, idx) => {
              const isActive = idx === activeDimIndex;
              const isDone = isDimComplete(dim.questions);
              const Icon = dim.icon;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveDimIndex(idx)}
                  className={`group relative overflow-hidden rounded-xl p-3 cursor-pointer transition-all border-l-4 ${isActive ? "bg-white shadow-md border-blue-600" : "bg-white/50 border-transparent"}`}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className={`font-bold text-xs uppercase ${isActive ? "text-blue-700" : "text-gray-500"}`}>{dim.name}</h3>
                        <p className="text-[10px] text-gray-400">{dim.questions.length} Soal</p>
                      </div>
                    </div>
                    {isDone && <FiCheckCircle size={16} className="text-emerald-500" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">{currentDimension.name}</h2>
                <div className="text-xs font-semibold px-3 py-1 bg-white border border-gray-200 rounded text-gray-600">
                  Step {activeDimIndex + 1}/{dimensions.length}
                </div>
              </div>

              <div className="p-6 space-y-8">
                {currentDimension.questions.map((q, idx) => (
                  <div key={q.id} className="animate-fadeIn">
                    <div className="mb-2">
                      {/* Global index */}
                      <label className="text-sm font-bold text-gray-800 block mb-1">
                        {questions.findIndex((x) => x.id === q.id) + 1}. {q.text}
                      </label>
                    </div>
                    <textarea
                      rows={4}
                      className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400 bg-gray-50 focus:bg-white"
                      placeholder={q.placeholder}
                      value={answers[q.id] || ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between">
                <button
                  onClick={handlePrev}
                  disabled={activeDimIndex === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${activeDimIndex === 0 ? "text-gray-300" : "text-gray-600 hover:bg-white border border-transparent hover:border-gray-200"}`}
                >
                  <FiChevronLeft /> Sebelumnya
                </button>
                <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md">
                  {activeDimIndex === dimensions.length - 1 ? (
                    <>
                      Review <FiSave />
                    </>
                  ) : (
                    <>
                      Selanjutnya <FiChevronRight />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EssayPreviewModal />
      <QrcSubmissionSuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} onToDashboard={() => navigate("/qrc/assessments")} type="essay" />
    </div>
  );
};

export default QrcEssayWizardPage;
