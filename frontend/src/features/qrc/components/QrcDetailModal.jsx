// frontend/src/features/qrc/components/QrcDetailModal.jsx
import React, { useEffect, useState } from "react";
import { FiX, FiCheckCircle, FiZap, FiFileText, FiClock } from "react-icons/fi";
import { qrcService } from "../api/qrcService";

const QrcDetailModal = ({ isOpen, onClose, assessmentId }) => {
  const [data, setData] = useState(null);
  const [questionsMap, setQuestionsMap] = useState({}); // Store pertanyaan untuk mapping ID -> Text
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && assessmentId) {
      fetchDetail();
    } else {
      setData(null);
      setQuestionsMap({});
    }
  }, [isOpen, assessmentId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      // 1. Ambil Detail Jawaban
      const result = await qrcService.getAssessmentDetail(assessmentId);
      setData(result);

      // 2. Ambil Daftar Pertanyaan yang sesuai tipe untuk mapping teks
      // Note: Ini fetch active questions. Jika pertanyaan sudah dihapus admin,
      // mungkin tidak muncul teksnya. Idealnya ada endpoint 'getQuestionById' atau fetch all history.
      // Untuk sekarang kita fetch active dulu.
      const qData = await qrcService.getActiveQuestions(result.assessment_type);

      // Buat Map: { "1": { text: "...", options: [...] }, "2": ... }
      const map = {};
      qData.forEach((q) => {
        map[q.id] = q;
      });
      setQuestionsMap(map);
    } catch (error) {
      console.error("Failed to load detail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Helper
  const getQuestionText = (qId) => {
    return questionsMap[qId]?.text || `Pertanyaan ID: ${qId} (Mungkin sudah dihapus/diubah)`;
  };

  const getStandardAnswerLabel = (qId, val) => {
    const q = questionsMap[qId];
    if (!q || !q.options) return val;
    const opt = q.options.find((o) => o.value === val);
    return opt ? opt.label : val;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              {loading ? (
                "Memuat..."
              ) : (
                <>
                  {data?.assessment_type === "essay" ? <FiFileText className="text-blue-600" /> : <FiZap className="text-red-600" />}
                  Detail Asesmen
                </>
              )}
            </h3>
            {!loading && data && <p className="text-xs text-gray-500 mt-1">Disubmit pada: {new Date(data.submission_date + "Z").toLocaleString("id-ID")}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-gray-400">Loading data...</div>
          ) : !data ? (
            <div className="text-center text-red-500">Gagal memuat data.</div>
          ) : (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className={`p-4 rounded-xl border ${data.assessment_type === "essay" ? "bg-blue-50 border-blue-100" : "bg-red-50 border-red-100"}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Status Review</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${data.status === "completed" ? "bg-emerald-200 text-emerald-800" : "bg-gray-200 text-gray-700"}`}>
                        {data.status === "completed" ? "Selesai" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {data.assessment_type === "standard" && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Skor Risiko</p>
                      <p className="text-2xl font-bold text-red-700">{data.risk_score}</p>
                      <p className="text-xs font-medium text-red-600">{data.risk_level}</p>
                    </div>
                  )}
                </div>

                {/* Catatan Konsultan */}
                {data.consultant_notes && (
                  <div className="mt-4 pt-3 border-t border-gray-200/50">
                    <p className="text-xs font-bold text-gray-600 mb-1">Catatan Konsultan:</p>
                    <p className="text-sm text-gray-800 italic">"{data.consultant_notes}"</p>
                  </div>
                )}
              </div>

              {/* Q&A List */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2">Detail Jawaban</h4>
                {Object.entries(data.answers_data || {}).map(([qId, val], idx) => (
                  <div key={qId} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 mb-1">Pertanyaan {idx + 1}</p>
                    <p className="text-sm font-medium text-gray-800 mb-2">{getQuestionText(qId)}</p>

                    {data.assessment_type === "essay" ? (
                      <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap">{val}</div>
                    ) : (
                      <div className="flex justify-between items-center bg-white p-3 rounded border border-gray-200">
                        <span className="text-sm font-medium text-red-700">{getStandardAnswerLabel(qId, val)}</span>
                        <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">Skor: {val}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-bold shadow-md">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrcDetailModal;
