// frontend/src/features/admin/components/rsca/ActionPlanModal.jsx

import React, { useState } from "react";
import { Dialog, DialogPanel, Title, Text, Button, Textarea, Select, SelectItem, DatePicker } from "@tremor/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../../api/api";
import { toast } from "sonner";
import { FiSave, FiX, FiPlusSquare, FiList, FiBriefcase, FiCalendar } from "react-icons/fi";
import { toLocalISODate } from "../../../../utils/formatters";
import { id } from "date-fns/locale";

const fetchDepartments = async () => {
  const { data } = await apiClient.get("/admin/departments-list");
  return data;
};

const createActionPlan = (planData) => {
  return apiClient.post("/admin/action-plans", planData);
};

function ActionPlanModal({ isOpen, onClose, sourceData, onSaveSuccess, cycleId }) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [assignedDeptId, setAssignedDeptId] = useState("");
  const [dueDate, setDueDate] = useState(null);

  const { data: departments, isLoading: isLoadingDepts } = useQuery({
    queryKey: ["allDepartments"],
    queryFn: fetchDepartments,
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: createActionPlan,
    onSuccess: (data) => {
      toast.success(data.msg || "Rencana aksi berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: ["rscaResult", cycleId] });
      onSaveSuccess();
      handleClose();
    },
    onError: (error) => {
      toast.error("Gagal membuat rencana aksi: " + (error.response?.data?.msg || error.message));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !assignedDeptId) {
      toast.error("Deskripsi dan Departemen wajib diisi.");
      return;
    }
    mutation.mutate({
      ...sourceData,
      action_description: description,
      assigned_department_id: Number(assignedDeptId),
      due_date: toLocalISODate(dueDate),
    });
  };

  const handleClose = () => {
    if (mutation.isPending) return;
    setDescription("");
    setAssignedDeptId("");
    setDueDate(null);
    onClose();
  };

  if (!isOpen || !sourceData) return null;

  return (
    <Dialog open={isOpen} onClose={handleClose} static={true}>
      <DialogPanel className="max-w-2xl p-0 overflow-hidden rounded-xl bg-white shadow-xl">
        {/* --- HEADER --- */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm border border-blue-100">
              <FiPlusSquare size={22} />
            </div>
            <div>
              <Title className="text-xl text-slate-800 font-bold">Buat Rencana Aksi</Title>
              <Text className="text-xs text-gray-500 mt-0.5">Tetapkan langkah mitigasi untuk risiko ini.</Text>
            </div>
          </div>
          <Button icon={FiX} variant="light" color="slate" onClick={handleClose} disabled={mutation.isPending} className="rounded-full hover:bg-gray-200 p-2" />
        </div>

        {/* --- BODY --- */}
        <div className="p-8 space-y-6">
          {/* Sumber Masalah (Read-only) */}
          <div className="group">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sumber Masalah</label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-slate-600 font-medium">
              {sourceData.context_text || (sourceData.origin_answer_id ? `Jawaban Kuesioner #${sourceData.origin_answer_id}` : `Ajuan Risiko #${sourceData.origin_submitted_risk_id}`)}
            </div>
          </div>

          {/* Deskripsi */}
          <div className="group">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-hover:text-blue-600 transition-colors">
              <div className="flex items-center gap-1.5">
                <FiList size={14} /> Deskripsi Tindakan <span className="text-red-500">*</span>
              </div>
            </label>
            <Textarea value={description} onValueChange={setDescription} placeholder="Jelaskan langkah konkret perbaikan..." rows={4} disabled={mutation.isPending} className="text-sm" />
          </div>

          {/* Grid: Dept & Tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-hover:text-blue-600 transition-colors">
                <div className="flex items-center gap-1.5">
                  <FiBriefcase size={14} /> Penanggung Jawab <span className="text-red-500">*</span>
                </div>
              </label>
              <Select value={assignedDeptId} onValueChange={setAssignedDeptId} placeholder={isLoadingDepts ? "Memuat..." : "Pilih departemen"} disabled={isLoadingDepts || mutation.isPending}>
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={String(dept.id)}>
                    {dept.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-hover:text-blue-600 transition-colors">
                <div className="flex items-center gap-1.5">
                  <FiCalendar size={14} /> Tenggat Waktu
                </div>
              </label>
              <DatePicker value={dueDate} onValueChange={setDueDate} placeholder="Pilih tanggal" disabled={mutation.isPending} className="w-full" color="blue" locale={id} enableYearNavigation={true} />
            </div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" className="bg-rose-300 hover:bg-rose-500 text-white rounded-md" color="slate" onClick={handleClose} disabled={mutation.isPending}>
            Batal
          </Button>
          <Button icon={FiSave} onClick={handleSubmit} loading={mutation.isPending} className="text-white bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700 shadow-lg shadow-blue-100 rounded-md">
            Simpan Rencana
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default ActionPlanModal;
