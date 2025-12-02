// frontend/src/features/account/ApiKeySettingPage.jsx

import React, { useState, useEffect } from "react";
import apiClient from "../../api/api";
import { FiSave, FiKey, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const ApiKeySettingPage = () => {
  const [apiKey, setApiKey] = useState("");
  const [maskedKey, setMaskedKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchCurrentStatus();
  }, []);

  const fetchCurrentStatus = async () => {
    try {
      const response = await apiClient.get("/admin/system-config/api-key");
      if (response.data.has_key) {
        setMaskedKey(response.data.masked_key);
      }
    } catch (error) {
      console.error("Gagal mengambil status API Key", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await apiClient.post("/admin/system-config/api-key", { api_key: apiKey });
      setMessage({ type: "success", text: "API Key berhasil disimpan dan aktif!" });
      setApiKey(""); // Clear input
      fetchCurrentStatus(); // Refresh status
    } catch (error) {
      setMessage({ type: "error", text: "Gagal menyimpan API Key. Silakan coba lagi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Pengaturan Akun</h1>
        <p className="text-slate-500 mt-2 text-sm md:text-base">Kelola kredensial dan konfigurasi sistem Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Left Column: Description (Visible on Desktop) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 hidden lg:block">
            <h3 className="font-semibold text-violet-800 mb-2 flex items-center gap-2">
              <FiKey /> Penting
            </h3>
            <p className="text-sm text-violet-700 leading-relaxed">
              API Key ini digunakan untuk menghubungkan aplikasi SIRICO dengan layanan Google Gemini AI. Pastikan key yang Anda masukkan memiliki kuota yang cukup dan izin yang sesuai.
            </p>
          </div>
        </div>

        {/* Right Column: Form Card */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Card Header with Distinct Color (Violet) */}
            <div className="px-6 py-5 bg-gradient-to-r from-violet-50 to-white border-b border-violet-100 flex items-center gap-4">
              <div className="p-3 bg-violet-100 text-violet-600 rounded-xl shadow-sm">
                <FiKey size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Gemini AI Configuration</h2>
                <p className="text-sm text-slate-500">Update API Key untuk Generative AI</p>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 md:p-8">
              {/* Status Banner */}
              {maskedKey ? (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start sm:items-center gap-3">
                  <div className="p-1 bg-emerald-100 text-emerald-600 rounded-full mt-0.5 sm:mt-0">
                    <FiCheckCircle size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-emerald-800 font-medium">Sistem terhubung</p>
                    <p className="text-xs text-emerald-600 mt-0.5 break-all">
                      Current Key: <span className="font-mono font-bold">{maskedKey}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                  <FiAlertCircle className="text-amber-500 mt-0.5" size={18} />
                  <p className="text-sm text-amber-700">Belum ada API Key yang tersimpan. Fitur AI tidak dapat digunakan.</p>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Input New API Key</label>
                  <div className="relative group">
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Contoh: AIzaSyD..."
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all font-mono text-sm shadow-sm group-hover:border-slate-400"
                      required
                    />
                    <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
                      {showKey ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Key akan dienkripsi dan disimpan aman di database Master Data.</p>
                </div>

                {message && (
                  <div
                    className={`p-4 rounded-xl text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                      message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                    }`}
                  >
                    {message.type === "success" ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
                    {message.text}
                  </div>
                )}

                <div className="pt-4 flex justify-end border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 active:scale-95 transition-all shadow-md shadow-violet-200 disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    <FiSave size={18} />
                    {loading ? "Menyimpan..." : "Simpan Key Baru"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySettingPage;
