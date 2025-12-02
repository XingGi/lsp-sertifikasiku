// frontend/src/features/admin/DepartmentAdminPage.jsx

import React, { useState, useMemo } from "react";
import { Card, Title, Text, Button, Flex, Icon, TextInput, Select, SelectItem } from "@tremor/react";
import { FiPlus, FiEdit, FiTrash2, FiBriefcase, FiHome, FiLoader, FiAlertTriangle, FiSearch, FiFilter } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api/api";
import { toast } from "sonner";

// Components
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import AppResourceTable from "../../components/common/AppResourceTable";
import AddEditDepartmentModal from "./components/dept/AddEditDepartmentModal";

// --- API CALLS (TETAP) ---
const fetchDepartments = async () => {
  const { data } = await apiClient.get("/admin/departments");
  return data;
};

const createDepartment = (deptData) => apiClient.post("/admin/departments", deptData);
const updateDepartment = ({ id, ...deptData }) => apiClient.put(`/admin/departments/${id}`, deptData);
const deleteDepartment = (id) => apiClient.delete(`/admin/departments/${id}`);

function DepartmentAdminPage() {
  const queryClient = useQueryClient();

  // State UI & Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  // State Filter & Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");

  const queryKey = "adminDepartments";

  // Fetch Data
  const { data: departments, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchDepartments,
  });

  // Logic Filter & Sort (Client Side)
  const filteredAndSortedData = useMemo(() => {
    if (!departments) return [];

    let result = departments.filter((dept) => (dept.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (dept.institution || "").toLowerCase().includes(searchTerm.toLowerCase()));

    result.sort((a, b) => {
      if (sortOption === "name-asc") return a.name.localeCompare(b.name);
      if (sortOption === "name-desc") return b.name.localeCompare(a.name);
      if (sortOption === "inst-asc") return (a.institution || "").localeCompare(b.institution || "");
      return 0;
    });

    return result;
  }, [departments, searchTerm, sortOption]);

  // Mutations
  const mutation = useMutation({
    mutationFn: (deptData) => {
      return deptData.id ? updateDepartment(deptData) : createDepartment(deptData);
    },
    onSuccess: () => {
      toast.success(selectedDept ? "Departemen berhasil diperbarui" : "Departemen berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setModalOpen(false);
      setSelectedDept(null);
    },
    onError: (err) => toast.error("Gagal: " + (err.response?.data?.msg || err.message)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      toast.success("Departemen berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setConfirmOpen(false);
      setSelectedDept(null);
    },
    onError: (err) => toast.error("Gagal: " + (err.response?.data?.msg || err.message)),
  });

  // Handlers
  const openAddModal = () => {
    setSelectedDept(null);
    setModalOpen(true);
  };

  const openEditModal = (dept) => {
    setSelectedDept(dept);
    setModalOpen(true);
  };

  const openDeleteConfirm = (dept) => {
    setSelectedDept(dept);
    setConfirmOpen(true);
  };

  const handleSave = (deptData) => {
    mutation.mutate(deptData);
  };

  const handleDelete = () => {
    deleteMutation.mutate(selectedDept.id);
  };

  // Definisi Kolom (Updated Style)
  const columns = [
    {
      key: "name",
      header: "Nama Departemen",
      cell: (dept) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FiBriefcase />
          </div>
          <Text className="font-semibold text-slate-700">{dept.name}</Text>
        </div>
      ),
    },
    {
      key: "institution",
      header: "Institusi",
      cell: (dept) => (
        <div className="flex items-center gap-2 text-slate-600">
          <FiHome size={14} className="text-gray-400" />
          <Text>{dept.institution || "Global / Default"}</Text>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (dept) => (
        <div className="flex justify-end gap-1 opacity-80 hover:opacity-100 transition-opacity">
          <Button size="xs" icon={FiEdit} variant="light" color="indigo" onClick={() => openEditModal(dept)} title="Edit" />
          <Button size="xs" icon={FiTrash2} variant="light" color="rose" onClick={() => openDeleteConfirm(dept)} title="Hapus" />
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
            <FiBriefcase size={28} />
          </div>
          <div>
            <Title className="text-2xl text-slate-800">Manajemen Departemen</Title>
            <Text className="text-slate-500">Atur struktur organisasi dan departemen institusi.</Text>
          </div>
        </div>
        <Button size="lg" icon={FiPlus} onClick={openAddModal} className="shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all rounded-xl">
          Tambah Departemen
        </Button>
      </div>

      {/* --- FILTER BAR (BARU) --- */}
      <Card className="p-4 shadow-sm border border-gray-100 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          <div className="relative flex-grow w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama departemen atau institusi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-56 flex-shrink-0">
            <Select value={sortOption} onValueChange={setSortOption} icon={FiFilter} placeholder="Urutkan..." className="h-[42px]">
              <SelectItem value="name-asc">Nama (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nama (Z-A)</SelectItem>
              <SelectItem value="inst-asc">Institusi (A-Z)</SelectItem>
            </Select>
          </div>
        </div>
      </Card>

      {/* --- TABLE CONTENT --- */}
      <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl">
        <AppResourceTable data={filteredAndSortedData} isLoading={isLoading} columns={columns} emptyMessage="Belum ada departemen yang terdaftar." />
      </Card>

      {/* --- MODALS --- */}
      <AddEditDepartmentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} department={selectedDept} isLoading={mutation.isPending} />

      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Departemen"
        message={`Yakin ingin menghapus departemen "${selectedDept?.name}"? Data terkait mungkin akan terpengaruh.`}
        confirmButtonText="Hapus"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default DepartmentAdminPage;
