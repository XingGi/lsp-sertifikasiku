// frontend/src/features/admin/competency/MasterUnitPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Card, Title, Text, Button, TextInput, Dialog, DialogPanel, Select, SelectItem } from "@tremor/react";
import { FiPlus, FiTrash2, FiDatabase, FiSearch, FiFilter, FiX, FiSave, FiBookOpen, FiEdit2, FiChevronLeft, FiChevronRight, FiLoader } from "react-icons/fi";
import apiClient from "../../../api/api";
import AppResourceTable from "../../../components/common/AppResourceTable";
import ConfirmationDialog from "../../../components/common/ConfirmationDialog";
import { toast } from "sonner";

function MasterUnitPage() {
  // --- State Data ---
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- State Pagination & Params (Server-side) ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // --- State Filter & Sort ---
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Nilai search yg dikirim ke API
  const [sortOption, setSortOption] = useState("code-asc");

  // --- State Modal & CRUD ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: null, code: "", title: "", standard_type: "", description: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, title: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  // --- 1. Debounce Logic ---
  // Biar gak spam server tiap ngetik 1 huruf
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset ke hal 1 tiap search berubah
    }, 500); // Tunggu 500ms berhenti ngetik

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- 2. Fetch Data (Server-side) ---
  const fetchUnits = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: page,
        per_page: itemsPerPage,
        q: debouncedSearch,
        sort: sortOption,
      };

      const res = await apiClient.get("/master/competency-units", { params });

      // Struktur baru dari Backend
      setUnits(res.data.data);
      setTotalPages(res.data.meta.total_pages);
      setTotalItems(res.data.meta.total_items);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data.");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, sortOption]);

  // Trigger fetch setiap parameter berubah
  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  // --- Handlers CRUD ---

  const handleOpenAdd = () => {
    setFormData({ id: null, code: "", title: "", standard_type: "", description: "" });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setFormData({ ...item, description: item.description || "" });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.title || !formData.standard_type) {
      return toast.error("Semua field wajib diisi.");
    }
    setIsSaving(true);
    try {
      if (isEditMode) {
        await apiClient.put(`/master/competency-units/${formData.id}`, formData);
        toast.success("Unit diperbarui");
      } else {
        await apiClient.post("/master/competency-units", formData);
        toast.success("Unit ditambahkan");
      }
      setIsModalOpen(false);
      fetchUnits(); // Refresh data current page
    } catch (err) {
      toast.error(err.response?.data?.msg || "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/master/competency-units/${deleteConfirm.id}`);
      toast.success("Unit dihapus");
      setDeleteConfirm({ isOpen: false, id: null, title: "" });

      // Jika halaman kosong setelah delete, mundur 1 halaman
      if (units.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchUnits();
      }
    } catch (err) {
      toast.error("Gagal menghapus");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Columns ---
  const columns = [
    {
      key: "code",
      header: "Kode Unit",
      cell: (item) => <div className="font-mono text-slate-700 font-medium bg-slate-100 px-2 py-1 rounded w-fit text-xs border border-slate-200">{item.code}</div>,
    },
    {
      key: "title",
      header: "Judul Unit",
      cell: (item) => <div className="font-semibold text-slate-800 leading-snug">{item.title}</div>,
    },
    {
      key: "standard_type",
      header: "Jenis Standar",
      cell: (item) => (
        <div className="flex items-start gap-2 text-xs text-slate-600 max-w-xs">
          <FiBookOpen className="shrink-0 mt-0.5 text-indigo-500" />
          <span>{item.standard_type}</span>
        </div>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      cell: (item) => (
        <div className="flex justify-end gap-2">
          <Button size="xs" variant="light" color="indigo" icon={FiEdit2} onClick={() => handleOpenEdit(item)} />
          <Button size="xs" variant="light" color="rose" icon={FiTrash2} onClick={() => setDeleteConfirm({ isOpen: true, id: item.id, title: item.title })} />
        </div>
      ),
      className: "text-right w-24",
    },
  ];

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600 shadow-sm">
            <FiDatabase size={28} />
          </div>
          <div>
            <Title className="text-2xl text-slate-800">Gudang Unit Kompetensi</Title>
            <Text className="text-slate-500">Master data unit (Server-side Pagination).</Text>
          </div>
        </div>
        <Button icon={FiPlus} onClick={handleOpenAdd} size="lg" className="shadow-lg shadow-indigo-500/20 rounded-xl">
          Tambah Unit
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 shadow-sm border border-gray-100 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          {/* Search */}
          <div className="relative flex-grow w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kode, judul, atau standar..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Indikator Loading Search Kecil */}
            {searchTerm !== debouncedSearch && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <FiLoader className="animate-spin text-indigo-500" />
              </div>
            )}
          </div>

          {/* Sort - Trigger Server Fetch */}
          <div className="w-full md:w-56 flex-shrink-0">
            <Select value={sortOption} onValueChange={setSortOption} icon={FiFilter} className="h-[42px]">
              <SelectItem value="code-asc">Kode (A-Z)</SelectItem>
              <SelectItem value="title-asc">Judul (A-Z)</SelectItem>
              <SelectItem value="type">Jenis Standar</SelectItem>
              <SelectItem value="newest">Terbaru</SelectItem>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table Content */}
      <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl flex flex-col">
        <div className="flex-grow">
          <AppResourceTable data={units} isLoading={isLoading} columns={columns} emptyMessage={debouncedSearch ? `Tidak ditemukan data untuk "${debouncedSearch}"` : "Belum ada unit kompetensi."} />
        </div>

        {/* --- SERVER SIDE PAGINATION FOOTER --- */}
        {!isLoading && units.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-500">
              Menampilkan{" "}
              <span className="font-bold text-slate-700">
                {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, totalItems)}
              </span>{" "}
              dari <span className="font-bold text-slate-700">{totalItems}</span> total data
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft size={18} />
              </button>

              {/* Page Info */}
              <div className="flex items-center px-2 gap-1 text-sm font-medium text-slate-600">
                <span>Halaman</span>
                <span className="text-indigo-600">{page}</span>
                <span>/</span>
                <span>{totalPages}</span>
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal (Code Tetap Sama) */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} static={true}>
        <DialogPanel className="max-w-lg p-0 overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="px-6 py-5 border-b border-gray-200 bg-indigo-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg border border-indigo-200">{isEditMode ? <FiEdit2 size={20} /> : <FiPlus size={20} />}</div>
              <div>
                <Title className="text-lg text-indigo-900 font-bold">{isEditMode ? "Edit Unit Kompetensi" : "Tambah Unit Baru"}</Title>
                <Text className="text-xs text-indigo-600 mt-0.5">{isEditMode ? "Perbarui informasi." : "Input data unit."}</Text>
              </div>
            </div>
            <Button icon={FiX} variant="light" color="slate" onClick={() => setIsModalOpen(false)} className="rounded-full" />
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-5">
            {/* Form Inputs (Sama persis kayak sebelumnya) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Kode Unit <span className="text-red-500">*</span>
              </label>
              <TextInput value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="Contoh: K.66BPM01.004.1" required className="font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Judul Unit <span className="text-red-500">*</span>
              </label>
              <TextInput value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Contoh: Analisis K3" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Jenis Standar <span className="text-red-500">*</span>
              </label>
              <TextInput value={formData.standard_type} onChange={(e) => setFormData({ ...formData, standard_type: e.target.value })} placeholder="Contoh: SKKNI No. 233 Tahun 2019" required />
            </div>
            <div className="pt-6 mt-2 border-t border-gray-100 flex justify-end gap-3">
              <Button type="button" variant="secondary" className="rounded-lg" color="rose" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" icon={FiSave} loading={isSaving} className="text-white bg-indigo-600 border-indigo-600 hover:bg-indigo-700 rounded-lg">
                {isEditMode ? "Simpan Perubahan" : "Simpan Unit"}
              </Button>
            </div>
          </form>
        </DialogPanel>
      </Dialog>

      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={handleDelete}
        title="Hapus Unit"
        message={`Hapus unit "${deleteConfirm.title}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default MasterUnitPage;
