// frontend/src/features/uji-kompetensi/components/StageIndicator.jsx

import React, { useState } from "react";
import { Dialog, DialogPanel, Title, Text, Button, Select, SelectItem, Textarea, Badge } from "@tremor/react";
import { FiSettings, FiAlertTriangle, FiMapPin, FiCheck } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/api";
import { toast } from "sonner";

export default function StageIndicator({ testId, currentStage, stages = [], onStageChange }) {
  const { user } = useAuth();
  // Cek apakah user adalah admin
  const isAdmin = user?.role === "admin";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State form override
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [reason, setReason] = useState("");

  // Helper: Cari nama stage aktif
  const activeStage = stages.find((s) => s.id === currentStage);

  const handleSave = async () => {
    if (!selectedTaskId) return toast.error("Pilih task tujuan.");
    if (!reason) return toast.error("Wajib isi alasan.");

    setIsSaving(true);
    try {
      // Panggil endpoint override yang ada di competency.py
      await apiClient.put(`/competency-tests/${testId}/stage`, {
        task_id: selectedTaskId,
        reason: reason,
      });
      toast.success("Posisi berhasil dipindah.");
      onStageChange(); // Refresh halaman induk
      setIsModalOpen(false);
      setReason("");
      setSelectedTaskId("");
    } catch (error) {
      toast.error("Gagal mengubah posisi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 py-3 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Info Posisi Sekarang */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <FiMapPin />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Tahap Saat Ini</p>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">{activeStage?.title || "Memuat..."}</span>
              {/* Tampilkan Badge Completed kalau sudah lewat */}
              {activeStage?.is_completed && (
                <Badge size="xs" color="emerald" icon={FiCheck}>
                  Selesai
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tombol Admin Override */}
        {isAdmin && (
          <Button size="xs" color="orange" variant="secondary" icon={FiSettings} onClick={() => setIsModalOpen(true)}>
            Atur Posisi (Admin)
          </Button>
        )}
      </div>

      {/* MODAL OVERRIDE */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} static={true}>
        <DialogPanel className="max-w-md bg-white rounded-xl shadow-2xl p-6">
          <div className="flex items-center gap-3 text-orange-600 mb-4 border-b border-orange-100 pb-3">
            <FiAlertTriangle size={24} />
            <Title>Override Posisi Asesmen</Title>
          </div>

          <Text className="mb-4 text-slate-600 text-sm">
            Fitur ini memungkinkan Anda memindahkan posisi asesi ke tahap/task tertentu secara paksa.
            <br />
            <b>Gunakan dengan bijak!</b>
          </Text>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Pilih Task Tujuan</label>
              <Select value={selectedTaskId} onValueChange={setSelectedTaskId} placeholder="Pilih task..." enableClear={false}>
                {stages.map((stage) =>
                  // Grouping Task per Stage (Tremor Select belum support OptGroup, jadi kita flatten visualnya)
                  (stage.tasks || []).map((task) => (
                    <SelectItem key={task.id} value={String(task.id)}>
                      {stage.title} — {task.title}
                    </SelectItem>
                  ))
                )}
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                Alasan Perubahan <span className="text-red-500">*</span>
              </label>
              <Textarea placeholder="Contoh: Dokumen salah, dikembalikan ke awal." value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button color="orange" loading={isSaving} onClick={handleSave}>
                Simpan & Pindah
              </Button>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
