// frontend/src/features/qrc/components/QrcQuestionFormModal.jsx
import React, { useState, useEffect } from "react";
import { FiX, FiSave, FiHelpCircle, FiList, FiType } from "react-icons/fi";

const QrcQuestionFormModal = ({ isOpen, onClose, onSubmit, initialData, type }) => {
  const [formData, setFormData] = useState({
    text: "",
    category: "Tata Kelola & Budaya",
    placeholder: "",
    options: [
      { label: "Tidak ada / Buruk", value: 0 },
      { label: "Cukup / Sedang", value: 5 },
      { label: "Baik / Lengkap", value: 10 },
    ],
    is_active: true,
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else
      setFormData({
        text: "",
        category: "Tata Kelola & Budaya",
        placeholder: "",
        options: [
          { label: "Tidak ada / Buruk", value: 0 },
          { label: "Cukup / Sedang", value: 5 },
          { label: "Baik / Lengkap", value: 10 },
        ],
        is_active: true,
      });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, question_type: type });
  };

  const handleOptionChange = (idx, field, val) => {
    const newOpts = [...formData.options];
    newOpts[idx][field] = val;
    setFormData({ ...formData, options: newOpts });
  };

  const categories = ["Tata Kelola & Budaya", "Identifikasi & Proses", "Ketahanan & Teknologi", "Keuangan & Strategis"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* --- HEADER --- */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${initialData ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>{initialData ? <FiType size={20} /> : <FiList size={20} />}</div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{initialData ? "Edit Pertanyaan" : "Tambah Pertanyaan"}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{type === "standard" ? "Tipe: Pilihan Ganda (Standard)" : "Tipe: Esai Deskriptif"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* --- FORM CONTENT --- */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Kategori */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Kategori / Dimensi</label>
            <div className="relative">
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition-all"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Teks Pertanyaan */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Teks Pertanyaan</label>
            <textarea
              required
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="Contoh: Apakah perusahaan memiliki..."
            />
          </div>

          {/* Conditional Input */}
          {type === "essay" ? (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Placeholder Jawaban</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.placeholder || ""}
                onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                placeholder="Contoh: Jelaskan secara rinci..."
              />
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Opsi Jawaban & Skor</label>
              <div className="space-y-3">
                {formData.options?.map((opt, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}.</span>
                    <input
                      type="text"
                      className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                      value={opt.label}
                      onChange={(e) => handleOptionChange(idx, "label", e.target.value)}
                      placeholder="Label Opsi"
                    />
                    <div className="relative w-24">
                      <input
                        type="number"
                        className="w-full p-2 pl-8 border border-gray-200 rounded-lg text-sm text-center font-bold text-blue-600 focus:border-blue-500 outline-none"
                        value={opt.value}
                        onChange={(e) => handleOptionChange(idx, "value", parseInt(e.target.value))}
                      />
                      <span className="absolute left-3 top-2 text-xs text-gray-400">Pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toggle Active */}
          <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </div>
            <span className="text-sm font-medium text-gray-700">Aktifkan Pertanyaan Ini</span>
          </label>
        </form>

        {/* --- FOOTER --- */}
        <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-gray-500 font-bold text-xs hover:bg-gray-100 rounded-xl transition-all">
            Batal
          </button>
          <button onClick={handleSubmit} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95">
            <FiSave size={16} /> Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrcQuestionFormModal;
