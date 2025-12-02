// frontend/src/features/admin/MasterDataPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Card, Title, Text, Button, TextInput, Dialog, DialogPanel, Badge } from "@tremor/react";
import apiClient from "../../api/api";
import { FiTrash2, FiPlus, FiEdit2, FiDatabase, FiX, FiSave, FiBriefcase, FiDollarSign, FiGlobe, FiShield, FiChevronRight, FiLayers } from "react-icons/fi";
import { toast } from "sonner";
import AppResourceTable from "../../components/common/AppResourceTable";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import { motion, AnimatePresence } from "framer-motion";

// --- KATEGORI CONFIG ---
const CATEGORIES = [
  { key: "INDUSTRY", label: "Industri", icon: FiBriefcase, desc: "Sektor bisnis perusahaan" },
  { key: "COMPANY_TYPE", label: "Tipe Perusahaan", icon: FiShield, desc: "Jenis entitas hukum" },
  { key: "COMPANY_ASSETS", label: "Aset Perusahaan", icon: FiDollarSign, desc: "Rentang nilai aset" },
  { key: "CURRENCY", label: "Mata Uang", icon: FiGlobe, desc: "Mata uang pelaporan" },
];

// --- KOMPONEN FORM TAMBAH (STICKY) ---
function AddItemForm({ category, onSave, isLoading }) {
  const [item, setItem] = useState({ key: "", value: "" });
  const currentCategory = CATEGORIES.find((c) => c.key === category);

  const handleInputChange = (e) => setItem({ ...item, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(category, item);
    setItem({ key: "", value: "" });
  };

  return (
    <Card className="mb-6 sticky top-4 z-20 shadow-lg border-t-4 border-indigo-500 ring-1 ring-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
          <FiPlus size={18} />
        </div>
        <Text className="font-bold text-slate-700">Tambah {currentCategory?.label} Baru</Text>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-start md:items-end gap-4">
        <div className="w-full md:w-1/3">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Key (ID Unik)</label>
          <TextInput name="key" placeholder="Contoh: banking_finance" value={item.key} onChange={handleInputChange} required className="font-mono text-sm" />
        </div>
        <div className="w-full md:flex-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Value (Label Tampilan)</label>
          <TextInput name="value" placeholder={`Nama ${currentCategory?.label}...`} value={item.value} onChange={handleInputChange} required />
        </div>
        <Button type="submit" icon={FiPlus} loading={isLoading} className="rounded-md w-full md:w-auto text-white bg-indigo-600 hover:bg-indigo-700 border-indigo-600">
          Simpan
        </Button>
      </form>
    </Card>
  );
}

function MasterDataPage() {
  const [masterData, setMasterData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // State UI
  const [activeTab, setActiveTab] = useState("INDUSTRY");

  // State Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // State Delete
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = () => {
    setIsLoading(true);
    apiClient
      .get("/admin/master-data")
      .then((response) => setMasterData(response.data))
      .catch(() => toast.error("Gagal memuat data."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS ---
  const handleAddItem = (category, newItem) => {
    setIsSaving(true);
    apiClient
      .post("/admin/master-data", { ...newItem, category })
      .then(() => {
        toast.success("Data berhasil ditambahkan.");
        fetchData();
      })
      .catch(() => toast.error("Gagal menambah data."))
      .finally(() => setIsSaving(false));
  };

  const handleUpdateItem = (e) => {
    e.preventDefault();
    setIsSaving(true);
    apiClient
      .put(`/admin/master-data/${editingItem.id}`, editingItem)
      .then(() => {
        toast.success("Data diperbarui.");
        setIsEditModalOpen(false);
        setEditingItem(null);
        fetchData();
      })
      .catch(() => toast.error("Gagal update data."))
      .finally(() => setIsSaving(false));
  };

  const handleConfirmDelete = () => {
    setIsDeleting(true);
    apiClient
      .delete(`/admin/master-data/${deleteConfirm.id}`)
      .then(() => {
        toast.success("Data dihapus.");
        fetchData();
        setDeleteConfirm({ isOpen: false, id: null });
      })
      .catch(() => toast.error("Gagal menghapus."))
      .finally(() => setIsDeleting(false));
  };

  // Columns
  const columns = [
    {
      key: "key",
      header: "Key / ID",
      cell: (item) => (
        <Badge size="xs" color="slate" className="font-mono rounded-md px-2 py-1">
          {item.key}
        </Badge>
      ),
    },
    {
      key: "value",
      header: "Label Tampilan",
      cell: (item) => <Text className="font-medium text-slate-700">{item.value}</Text>,
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (item) => (
        <div className="flex justify-end gap-1">
          <Button
            size="xs"
            variant="light"
            icon={FiEdit2}
            onClick={() => {
              setEditingItem({ ...item });
              setIsEditModalOpen(true);
            }}
          />
          <Button size="xs" variant="light" color="rose" icon={FiTrash2} onClick={() => setDeleteConfirm({ isOpen: true, id: item.id })} />
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600 shadow-sm">
          <FiDatabase size={28} />
        </div>
        <div>
          <Title className="text-2xl text-slate-800">Master Data</Title>
          <Text className="text-slate-500">Kelola referensi sistem dan opsi dropdown.</Text>
        </div>
      </div>

      {/* LAYOUT: SIDEBAR TAB + CONTENT */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* 1. SIDEBAR NAVIGASI (Kiri) */}
        <Card className="w-full lg:w-72 p-0 overflow-hidden shadow-sm border border-gray-100 ring-1 ring-gray-200 sticky top-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kategori Data</Text>
          </div>
          <div className="flex flex-col p-2 space-y-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeTab === cat.key;
              const count = masterData[cat.key]?.length || 0;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveTab(cat.key)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm transition-all duration-200 group ${
                    isActive ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200" : "text-slate-600 hover:bg-gray-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <cat.icon size={18} className={isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"} />
                    <div className="text-left">
                      <span className="font-semibold block">{cat.label}</span>
                    </div>
                  </div>
                  {isActive && <FiChevronRight className="text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </Card>

        {/* 2. CONTENT AREA (Kanan) */}
        <div className="flex-1 w-full min-w-0">
          {/* Sticky Add Form */}
          <AddItemForm category={activeTab} onSave={handleAddItem} isLoading={isSaving} />

          {/* Data Table */}
          <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl min-h-[500px]">
            <div className="px-6 py-4 border-b border-gray-100 bg-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FiLayers className="text-indigo-500" />
                <Title className="text-base">Daftar {CATEGORIES.find((c) => c.key === activeTab)?.label}</Title>
              </div>
              <Badge size="xs" className="rounded-md px-2 py-1" color="slate">
                {masterData[activeTab]?.length || 0} Items
              </Badge>
            </div>

            <AppResourceTable data={masterData[activeTab] || []} isLoading={isLoading} columns={columns} emptyMessage={`Belum ada data untuk kategori ini.`} />
          </Card>
        </div>
      </div>

      {/* --- MODAL EDIT --- */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} static={true}>
        <DialogPanel className="max-w-md p-0 overflow-hidden rounded-xl bg-white shadow-xl">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
                <FiEdit2 />
              </div>
              <Title>Edit Item Master</Title>
            </div>
            <Button icon={FiX} variant="light" color="slate" onClick={() => setIsEditModalOpen(false)} className="rounded-full" />
          </div>

          <form onSubmit={handleUpdateItem} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Key (Read-only)</label>
              <TextInput value={editingItem?.key || ""} disabled className="bg-gray-50 text-gray-500 font-mono" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Value (Label)</label>
              <TextInput name="value" value={editingItem?.value || ""} onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })} required autoFocus />
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
              <Button variant="secondary" className="rounded-md" onClick={() => setIsEditModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" icon={FiSave} loading={isSaving} className="text-white rounded-md bg-indigo-600 border-indigo-600 hover:bg-indigo-700">
                Update
              </Button>
            </div>
          </form>
        </DialogPanel>
      </Dialog>

      {/* --- CONFIRM DELETE --- */}
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Master"
        message="Apakah Anda yakin? Menghapus data ini dapat mempengaruhi data lain yang menggunakannya."
        isLoading={isDeleting}
      />
    </div>
  );
}

export default MasterDataPage;
