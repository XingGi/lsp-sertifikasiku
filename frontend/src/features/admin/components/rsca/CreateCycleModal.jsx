// frontend/src/features/admin/components/rsca/CreateCycleModal.jsx

import React, { useState } from "react";
import { Dialog, DialogPanel, Title, Text, Button, TextInput, DatePicker, MultiSelect, MultiSelectItem } from "@tremor/react";
import { FiX, FiPlus, FiCalendar, FiBriefcase, FiFileText } from "react-icons/fi";
import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "../../../../api/api";
import { toast } from "sonner";
import { id } from "date-fns/locale";

// --- LOGIC HELPERS ---
const fetchDepartments = async () => {
  const { data } = await apiClient.get("/admin/departments-list");
  return data;
};

const createCycle = (newCycle) => {
  return apiClient.post("/admin/rsca-cycles", newCycle);
};

function CreateCycleModal({ isOpen, onClose }) {
  const [nama, setNama] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState(null);
  const [tanggalSelesai, setTanggalSelesai] = useState(null);
  const [selectedDepts, setSelectedDepts] = useState([]);

  // Ambil data departemen
  const { data: departments, isLoading: isLoadingDepts } = useQuery({
    queryKey: ["allDepartments"],
    queryFn: fetchDepartments,
  });

  const mutation = useMutation({
    mutationFn: createCycle,
    onSuccess: () => {
      toast.success("Siklus RSCA berhasil dibuat!");
      setNama("");
      setTanggalMulai(null);
      setTanggalSelesai(null);
      setSelectedDepts([]);
      onClose();
    },
    onError: (error) => {
      toast.error("Gagal membuat siklus: " + error.message);
    },
  });

  const handleSubmit = () => {
    if (!nama || !tanggalMulai || !tanggalSelesai) {
      toast.warning("Mohon lengkapi nama dan tanggal siklus.");
      return;
    }
    mutation.mutate({
      nama_siklus: nama,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      department_ids: selectedDepts.map((id) => parseInt(id)),
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
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm border border-blue-100">
              <FiPlus size={22} />
            </div>
            <div>
              <Title className="text-xl text-slate-800 font-bold">Buat Siklus Baru</Title>
              <Text className="text-xs text-gray-500 mt-0.5">Mulai periode penilaian risiko baru.</Text>
            </div>
          </div>
          <Button icon={FiX} variant="light" color="slate" onClick={onClose} disabled={mutation.isPending} className="rounded-full hover:bg-gray-200 p-2" />
        </div>

        {/* --- BODY FORM --- */}
        <div className="p-8 space-y-8">
          {/* Nama Siklus */}
          <div className="group">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 hover:text-blue-600 transition-colors">
              <div className="flex items-center gap-1.5">
                <FiFileText size={14} /> Nama Siklus
              </div>
            </label>
            <TextInput placeholder="Contoh: RSCA Q4 2025 - Kepatuhan" value={nama} onValueChange={setNama} className="hover:shadow-sm transition-shadow" />
          </div>

          {/* Grid Tanggal (Modern DatePicker) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 hover:text-blue-600 transition-colors">
                <div className="flex items-center gap-1.5">
                  <FiCalendar size={14} /> Tanggal Mulai
                </div>
              </label>
              <DatePicker placeholder="Pilih tanggal mulai" value={tanggalMulai} onValueChange={setTanggalMulai} className="w-full" enableClear={true} color="blue" locale={id} enableYearNavigation={true} />
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 hover:text-blue-600 transition-colors">
                <div className="flex items-center gap-1.5">
                  <FiCalendar size={14} /> Tanggal Selesai
                </div>
              </label>
              <DatePicker placeholder="Pilih tanggal selesai" value={tanggalSelesai} onValueChange={setTanggalSelesai} className="w-full" enableClear={true} color="blue" locale={id} enableYearNavigation={true} />
            </div>
          </div>

          {/* Departemen */}
          <div className="group">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 hover:text-blue-600 transition-colors">
              <div className="flex items-center gap-1.5">
                <FiBriefcase size={14} /> Tugaskan ke Departemen
              </div>
            </label>
            <MultiSelect placeholder="Pilih departemen..." value={selectedDepts} onValueChange={setSelectedDepts} disabled={isLoadingDepts} className="max-w-full">
              {departmentOptions?.map((item) => (
                <MultiSelectItem key={item.value} value={item.value}>
                  {item.name}
                </MultiSelectItem>
              ))}
            </MultiSelect>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 p-1.5 rounded w-fit">
              <FiBriefcase size={10} />
              <span>Hanya menampilkan departemen di bawah institusi Anda.</span>
            </div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" className="rounded-md hover:bg-rose-500 hover:text-white" color="slate" onClick={onClose} disabled={mutation.isPending}>
            Batal
          </Button>
          <Button onClick={handleSubmit} loading={mutation.isPending} className="text-white bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700 rounded-md">
            Buat Siklus
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default CreateCycleModal;
