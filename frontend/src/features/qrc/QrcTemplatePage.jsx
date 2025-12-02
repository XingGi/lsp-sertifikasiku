// frontend/src/features/qrc/QrcTemplatePage.jsx
import React, { useState, useEffect } from "react";
// Gunakan FiDatabase atau FiLayers
import { FiPlus, FiEdit2, FiTrash2, FiZap, FiFileText, FiCheckCircle, FiXCircle, FiDatabase } from "react-icons/fi";
import { qrcService } from "./api/qrcService";
import QrcQuestionFormModal from "./components/QrcQuestionFormModal";

const QrcTemplatePage = () => {
  // ... (Logic State & Effect TETAP SAMA) ...
  const [activeTab, setActiveTab] = useState("standard");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [activeTab]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await qrcService.getAllQuestionsAdmin(activeTab);
      setQuestions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };
  const handleEdit = (q) => {
    setEditingQuestion(q);
    setIsModalOpen(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Yakin hapus?")) {
      try {
        await qrcService.deleteQuestion(id);
        fetchQuestions();
      } catch (error) {
        alert("Gagal.");
      }
    }
  };
  const handleSave = async (formData) => {
    try {
      if (editingQuestion) await qrcService.updateQuestion(editingQuestion.id, formData);
      else await qrcService.createQuestion(formData);
      setIsModalOpen(false);
      fetchQuestions();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 min-h-full bg-gray-50/50">
      <div className="max-w-full mx-auto space-y-8">
        {/* --- HEADER SERAGAM --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
              <FiDatabase size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Template Pertanyaan QRC</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Kelola bank pertanyaan untuk asesmen Standard & Essay.</p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <FiPlus size={20} /> Tambah Pertanyaan
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab("standard")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "standard" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <FiZap size={16} /> Standard (Multiple Choice)
          </button>
          <button
            onClick={() => setActiveTab("essay")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "essay" ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <FiFileText size={16} /> Essay (Deep Analysis)
          </button>
        </div>

        {/* Table (Style diperhalus rounded-2xl) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-16 text-center">No</th>
                <th className="px-6 py-4 w-1/4">Kategori</th>
                <th className="px-6 py-4 w-1/2">Pertanyaan</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    Belum ada pertanyaan.
                  </td>
                </tr>
              ) : (
                questions.map((q, idx) => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-center text-gray-400">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 rounded-lg text-gray-600 border border-gray-200">{q.category}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium leading-relaxed">
                      {q.text}
                      <div className="mt-1 text-xs text-gray-400 font-normal truncate max-w-md">{activeTab === "standard" ? `Opsi: ${q.options?.map((o) => o.label).join(", ")}` : `Placeholder: ${q.placeholder || "-"}`}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {q.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          <FiCheckCircle size={12} /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                          <FiXCircle size={12} /> Non-Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <FiEdit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <QrcQuestionFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSave} initialData={editingQuestion} type={activeTab} />
    </div>
  );
};

export default QrcTemplatePage;
