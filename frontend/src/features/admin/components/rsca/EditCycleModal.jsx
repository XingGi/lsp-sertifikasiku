// frontend/src/features/admin/components/rsca/EditCycleModal.jsx

import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, Title, Text, Button, TextInput, DatePicker, MultiSelect, MultiSelectItem, Grid } from "@tremor/react";
import { FiX, FiEdit, FiCalendar, FiBriefcase, FiFileText } from "react-icons/fi";
import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "../../../../api/api";
import { toast } from "sonner";
import { id } from "date-fns/locale";

// --- LOGIC HELPERS (TETAP) ---
const fetchDepartments = async () => {
  const { data } = await apiClient.get("/admin/departments-list");
  return data;
};

const updateCycle = ({ id, cycleData }) => {
  return apiClient.put(`/admin/rsca-cycles/${id}`, cycleData);
};

const toLocalISODate = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString + "T00:00:00");
};

function EditCycleModal({ isOpen, onClose, cycleData, onSaveSuccess }) {
  // State Form
  const [nama, setNama] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState(null);
  const [tanggalSelesai, setTanggalSelesai] = useState(null);
  const [selectedDepts, setSelectedDepts] = useState([]);

  // Fetch Data Departemen
  const { data: departments, isLoading: isLoadingDepts } = useQuery({
    queryKey: ["allDepartments"],
    queryFn: fetchDepartments,
  });

  // Sync State dengan Props
  useEffect(() => {
    if (cycleData && isOpen) {
      setNama(cycleData.nama_siklus || "");
      setTanggalMulai(parseDate(cycleData.tanggal_mulai));
      setTanggalSelesai(parseDate(cycleData.tanggal_selesai));
      setSelectedDepts(cycleData.departments?.map((dept) => String(dept.id)) || []);
    }
  }, [cycleData, isOpen]);

  // Mutation Update
  const mutation = useMutation({
    mutationFn: updateCycle,
    onSuccess: (updatedData) => {
      toast.success("Siklus RSCA berhasil diupdate!");
      onSaveSuccess(updatedData);
      onClose();
    },
    onError: (error) => {
      toast.error("Gagal mengupdate siklus: " + error.response?.data?.msg);
    },
  });

  const handleSubmit = () => {
    mutation.mutate({
      id: cycleData.id,
      cycleData: {
        nama_siklus: nama,
        tanggal_mulai: toLocalISODate(tanggalMulai),
        tanggal_selesai: toLocalISODate(tanggalSelesai),
        department_ids: selectedDepts.map(Number),
      },
    });
  };

  const departmentOptions = departments?.map((dep) => ({
    value: dep.id.toString(),
    name: dep.name,
  }));

  return (
    <Dialog open={isOpen} onClose={() => !mutation.isPending && onClose()} static={true}>
      <DialogPanel className="max-w-2xl p-0 overflow-hidden rounded-xl bg-white shadow-xl transform transition-all">
        {/* --- HEADER --- */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl shadow-sm border border-orange-100">
              <FiEdit size={20} />
            </div>
            <div>
              <Title className="text-lg text-slate-800 font-bold">Edit Siklus</Title>
              <Text className="text-xs text-gray-500 mt-0.5">Perbarui detail siklus kuesioner.</Text>
            </div>
          </div>
          <Button icon={FiX} variant="light" color="slate" onClick={onClose} disabled={mutation.isPending} className="rounded-full hover:bg-gray-200 p-2" />
        </div>

        {/* --- BODY FORM --- */}
        <div className="p-8 space-y-8">
          {/* Nama Siklus */}
          <div className="group">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 hover:text-orange-600 transition-colors">
              <div className="flex items-center gap-1">
                <FiFileText size={14} /> Nama Siklus
              </div>
            </label>
            <TextInput placeholder="Contoh: RSCA Q3 2025" value={nama} onValueChange={setNama} className="hover:shadow-sm transition-shadow" />
          </div>

          {/* Grid Tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 hover:text-orange-600 transition-colors">
                <div className="flex items-center gap-1">
                  <FiCalendar size={14} /> Tanggal Mulai
                </div>
              </label>
              <DatePicker placeholder="Pilih tanggal mulai" value={tanggalMulai} onValueChange={setTanggalMulai} className="w-full" enableClear={true} color="blue" locale={id} enableYearNavigation={true} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 hover:text-orange-600 transition-colors">
                <div className="flex items-center gap-1">
                  <FiCalendar size={14} /> Tanggal Selesai
                </div>
              </label>
              <DatePicker placeholder="Pilih tanggal selesai" value={tanggalSelesai} onValueChange={setTanggalSelesai} className="w-full" enableClear={true} color="blue" locale={id} enableYearNavigation={true} />
            </div>
          </div>

          {/* Departemen */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 hover:text-orange-600 transition-colors">
              <div className="flex items-center gap-1">
                <FiBriefcase /> Tugaskan ke Departemen
              </div>
            </label>
            <MultiSelect placeholder="Pilih departemen..." value={selectedDepts} onValueChange={setSelectedDepts} disabled={isLoadingDepts} className="max-w-full">
              {departmentOptions?.map((item) => (
                <MultiSelectItem key={item.value} value={item.value}>
                  {item.name}
                </MultiSelectItem>
              ))}
            </MultiSelect>
            <div className="mt-2 flex items-center gap-1 text-[10px] italic text-gray-400 bg-gray-50 p-1.5 rounded w-fit">
              <FiBriefcase size={10} />
              <span>*Hanya departemen di bawah institusi Anda yang muncul.</span>
            </div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" className="rounded-md hover:bg-rose-500 hover:text-white" color="slate" onClick={onClose} disabled={mutation.isPending}>
            Batal
          </Button>
          <Button onClick={handleSubmit} loading={mutation.isPending} className="text-white bg-orange-600 border-orange-600 hover:bg-orange-700 hover:border-orange-700 rounded-md">
            Simpan Perubahan
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default EditCycleModal;
