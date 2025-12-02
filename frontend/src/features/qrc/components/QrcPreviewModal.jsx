import React from "react";
import { FiX, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

// Tambahkan prop 'questions'
const QrcPreviewModal = ({ isOpen, onClose, answers, onSubmit, isSubmitting, questions }) => {
  if (!isOpen) return null;

  // Gabungkan pertanyaan (dari props) dengan jawaban user
  const reviewData = questions.map((q, idx) => {
    // ID dari database adalah integer, tapi key di answers mungkin string. Kita pastikan aman.
    const userVal = answers[q.id];

    // Cari label opsi yang dipilih
    // Note: q.options dari DB berbentuk array object
    const selectedOption = q.options?.find((opt) => opt.value === userVal);

    return {
      ...q,
      displayId: idx + 1, // Gunakan index untuk nomor urut
      userAnswer: selectedOption ? selectedOption.label : "Belum dijawab",
      userScore: userVal !== undefined ? userVal : "-",
      status: userVal !== undefined ? "answered" : "missing",
    };
  });

  const totalAnswered = reviewData.filter((d) => d.status === "answered").length;
  const isComplete = totalAnswered === questions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-fadeIn overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Review Hasil QRS</h2>
            <p className="text-gray-500 text-xs mt-0.5">Periksa kembali jawaban sebelum kalkulasi skor risiko.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors text-gray-400">
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {!isComplete && (
            <div className="mb-5 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
              <FiAlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />
              <div>
                <h4 className="font-bold text-xs text-amber-800 uppercase tracking-wide">Data Belum Lengkap</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Anda baru menjawab <span className="font-bold">{totalAnswered}</span> dari <span className="font-bold">{questions.length}</span> pertanyaan.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 font-semibold text-[10px] uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3 w-[5%] text-center">#</th>
                  <th className="p-3 w-[45%]">Pertanyaan</th>
                  <th className="p-3 w-[35%]">Jawaban Anda</th>
                  <th className="p-3 w-[15%] text-center">Skor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {reviewData.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50/20 transition-colors group">
                    <td className="p-3 text-center text-gray-400 font-medium bg-gray-50/30">{item.displayId}</td>
                    <td className="p-3 text-gray-700 font-medium leading-relaxed group-hover:text-gray-900">{item.text}</td>
                    <td className="p-3 align-middle">
                      <span className={`inline-block px-2.5 py-1 rounded-md font-semibold border leading-tight ${item.status === "missing" ? "bg-gray-100 text-gray-500 border-gray-200 italic" : "bg-rose-50 text-rose-700 border-rose-100"}`}>
                        {item.userAnswer}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-bold ${item.userScore === 0 ? "text-red-600" : item.userScore === 5 ? "text-amber-500" : item.userScore === 10 ? "text-emerald-600" : "text-gray-300"}`}>{item.userScore}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm text-gray-600 font-medium hover:bg-white border hover:border-gray-200 transition-all">
            Kembali Edit
          </button>
          <button
            onClick={onSubmit}
            disabled={!isComplete || isSubmitting}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white shadow-md transition-all ${!isComplete || isSubmitting ? "bg-gray-300 cursor-not-allowed" : "bg-red-700 hover:bg-red-800 active:scale-95"}`}
          >
            {isSubmitting ? (
              "Processing..."
            ) : (
              <>
                <FiCheckCircle size={16} /> Process Scan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrcPreviewModal;
