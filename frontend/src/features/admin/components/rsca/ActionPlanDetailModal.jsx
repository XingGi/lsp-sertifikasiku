// frontend/src/features/admin/components/rsca/ActionPlanDetailModal.jsx

import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, Title, Text, Button, Select, SelectItem } from "@tremor/react";
import { useMutation } from "@tanstack/react-query";
import apiClient from "../../../../api/api";
import { toast } from "sonner";
import { FiSave, FiClock, FiCheckCircle, FiMinusCircle, FiX, FiActivity, FiUser, FiCalendar } from "react-icons/fi";
import { getStatusColor } from "../../../../utils/formatters";

const updateStatus = ({ planId, status }) => {
  return apiClient.put(`/admin/action-plans/${planId}/status`, { status });
};

function ActionPlanDetailModal({ isOpen, onClose, plan, onSaveSuccess }) {
  const [currentStatus, setCurrentStatus] = useState("");

  useEffect(() => {
    if (plan) {
      setCurrentStatus(plan.status || "Belum Mulai");
    }
  }, [plan, isOpen]);

  const mutation = useMutation({
    mutationFn: updateStatus,
    onSuccess: (data) => {
      toast.success(data.msg || "Status berhasil diupdate!");
      onSaveSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error("Gagal update: " + (error.response?.data?.msg || error.message));
    },
  });

  const handleSave = () => {
    mutation.mutate({ planId: plan.id, status: currentStatus });
  };

  if (!isOpen || !plan) return null;

  return (
    <Dialog open={isOpen} onClose={() => !mutation.isPending && onClose()} static={true}>
      <DialogPanel className="max-w-lg p-0 overflow-hidden rounded-xl bg-white shadow-xl">
        {/* --- HEADER --- */}
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-start bg-gray-50/50">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm border border-emerald-100 shrink-0">
              <FiActivity size={22} />
            </div>
            <div>
              <Title className="text-lg text-slate-800 font-bold leading-snug line-clamp-2">{plan.action_description}</Title>
              <Text className="text-xs text-gray-500 mt-1 font-mono">ID: #{plan.id}</Text>
            </div>
          </div>
          <Button icon={FiX} variant="light" color="slate" onClick={onClose} disabled={mutation.isPending} className="rounded-full hover:bg-gray-200 p-2 -mr-2 -mt-2" />
        </div>

        {/* --- BODY --- */}
        <div className="p-8 space-y-6">
          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status Saat Ini</label>
            <Select
              value={currentStatus}
              onValueChange={setCurrentStatus}
              disabled={mutation.isPending}
              icon={currentStatus === "Selesai" ? FiCheckCircle : currentStatus === "Sedang Dikerjakan" ? FiClock : FiMinusCircle}
              className="w-full"
            >
              <SelectItem value="Belum Mulai" icon={FiMinusCircle}>
                Belum Mulai
              </SelectItem>
              <SelectItem value="Sedang Dikerjakan" icon={FiClock}>
                Sedang Dikerjakan
              </SelectItem>
              <SelectItem value="Selesai" icon={FiCheckCircle}>
                Selesai
              </SelectItem>
            </Select>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                <FiUser size={12} /> PIC / Dept
              </label>
              <Text className="text-sm font-medium text-slate-700">{plan.assigned_department?.name || "N/A"}</Text>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                <FiCalendar size={12} /> Tenggat
              </label>
              <Text className={`text-sm font-medium ${new Date(plan.due_date) < new Date() ? "text-red-600" : "text-slate-700"}`}>{plan.due_date || "N/A"}</Text>
            </div>

            <div className="col-span-2 border-t border-gray-200 pt-3 mt-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider">Dibuat Oleh</label>
              <Text className="text-xs text-gray-500">{plan.creator?.nama_lengkap || "Sistem"}</Text>
            </div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" className="text-white bg-rose-300 hover:bg-rose-500 rounded-md  " color="slate" onClick={onClose} disabled={mutation.isPending}>
            Tutup
          </Button>
          <Button icon={FiSave} onClick={handleSave} loading={mutation.isPending} className="text-white bg-emerald-600 border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700 shadow-lg shadow-emerald-100 rounded-md">
            Update Status
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default ActionPlanDetailModal;
