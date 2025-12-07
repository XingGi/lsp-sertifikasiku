// frontend/src/features/uji-kompetensi/UjiKompetensiStudioPage.jsx

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Title, Text, Button, Badge } from "@tremor/react";
import { FiArrowLeft, FiAlertCircle, FiCheckCircle } from "react-icons/fi"; // Tambah FiCheckCircle
import apiClient from "../../api/api";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

// Import Components
import StudioStepper from "./components/StudioStepper";
import TaskRenderer from "./components/TaskRenderer";
import StageIndicator from "./components/StageIndicator"; // Pastikan path ini benar

function UjiKompetensiStudioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State Context (Data dari Backend)
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Logic Read Only (Observer Mode)
  const [isReadOnly, setIsReadOnly] = useState(false); // Default false, biar user biasa gak kekunci

  // Efek samping: Cek permission setiap context/user berubah
  useEffect(() => {
    if (context && user) {
      const isAdmin = user.role === "admin";
      // TODO: Tambah logika cek kepemilikan (created_by_id) kalau backend udah kirim
      // const isOwner = context.created_by_id === user.id;

      if (isAdmin) {
        setIsReadOnly(true);
      } else {
        setIsReadOnly(false);
      }
    }
  }, [context, user]);

  // --- 1. FETCH CONTEXT (SAYA LAGI DIMANA?) ---
  const fetchContext = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/competency-tests/${id}/context`);
      setContext(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Gagal memuat data ujian.");
      toast.error("Gagal memuat workflow.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  // --- 2. HANDLE SUBMIT TASK ---
  const handleSubmitTask = async (formData) => {
    // Double protection: Jangan submit kalau read only
    if (isReadOnly) return;

    setSubmitting(true);
    try {
      const res = await apiClient.post(`/competency-tests/${id}/submit-task`, {
        response: formData,
      });
      toast.success(res.data.msg || "Berhasil disimpan!");
      fetchContext();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Gagal menyimpan jawaban.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDERING STATE ---

  if (loading && !context) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin text-indigo-600 mb-2 text-2xl mx-auto w-fit">⚙️</div>
          <p className="text-gray-500">Memuat lembar kerja...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-red-50 p-6 rounded-xl text-center border border-red-100 max-w-md">
          <FiAlertCircle className="text-red-500 text-4xl mx-auto mb-4" />
          <Title className="text-red-700 mb-2">Terjadi Kesalahan</Title>
          <Text className="text-red-600 mb-6">{error}</Text>
          <Button onClick={() => navigate("/uji-kompetensi")} variant="secondary">
            Kembali ke Daftar
          </Button>
        </div>
      </div>
    );
  }

  // Jika Status COMPLETED (Selesai)
  if (context?.status === "COMPLETED") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg border border-indigo-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle size={40} />
          </div>
          <Title className="text-2xl font-bold text-gray-800 mb-2">Seluruh Tahapan Selesai!</Title>
          <Text className="text-gray-500 mb-8">
            Terima kasih telah menyelesaikan seluruh rangkaian asesmen untuk skema <strong>{context.scheme_name}</strong>. Tim asesor akan memverifikasi data Anda.
          </Text>
          <Button size="lg" onClick={() => navigate("/uji-kompetensi")}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // --- MAIN LAYOUT (ONGOING) ---
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* 1. TOP BAR */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Tombol Back Pinter: Admin -> Monitoring, User -> List */}
            <Button variant="light" icon={FiArrowLeft} onClick={() => navigate(isReadOnly ? "/admin/monitoring" : "/uji-kompetensi")} tooltip="Kembali" />
            <div>
              <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">{context.test_title}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <Badge size="xs" color="indigo">
                  {context.scheme_name}
                </Badge>
                <span>•</span>
                <span>{context.current_task?.stage_title}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Indikator Observer Mode */}
            {isReadOnly && <Badge color="orange">Observer Mode</Badge>}

            {/* Indikator Task Kanan Atas */}
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Kegiatan Saat Ini</p>
              <p className="text-sm font-bold text-indigo-600 truncate max-w-[200px]">{context.current_task?.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STAGE INDICATOR & ADMIN TOOL (PENTING: Jangan dihapus) */}
      <StageIndicator
        testId={id}
        currentStage={context.current_task?.stage_id} // Pass Stage ID (bukan title)
        stages={context.stages}
        onStageChange={fetchContext} // Refresh halaman kalau admin mindahin stage
      />

      {/* 3. STEPPER PROGRESS (VISUAL) */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <StudioStepper stages={context.stages} />
        </div>
      </div>

      {/* 4. WORKSPACE AREA */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-10 pb-20">
        <div key={context.current_task?.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
          <TaskRenderer
            task={context.current_task}
            userResponse={context.user_response}
            onSubmit={handleSubmitTask}
            isSubmitting={submitting}
            readOnly={isReadOnly} // Pass prop ReadOnly
          />
        </div>
      </div>
    </div>
  );
}

export default UjiKompetensiStudioPage;
