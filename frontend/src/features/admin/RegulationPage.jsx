// frontend/src/features/admin/RegulationPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Card, Title, Text, Button, TextInput, Textarea, Select, SelectItem, Badge, Dialog, DialogPanel } from "@tremor/react";
import apiClient from "../../api/api";
import { FiTrash2, FiPlus, FiEye, FiBookOpen, FiSearch, FiFilter, FiFileText, FiUploadCloud, FiDownload, FiX } from "react-icons/fi";
import { toast } from "sonner";
import AppResourceTable from "../../components/common/AppResourceTable";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";

function RegulationPage() {
  const [regulations, setRegulations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Form
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // State Filter & Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  // State Delete
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // --- STATE BARU UNTUK PREVIEW ---
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fetchData = () => {
    setIsLoading(true);
    apiClient
      .get("/admin/regulations")
      .then((response) => setRegulations(response.data))
      .catch((error) => toast.error("Gagal memuat data regulasi."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LOGIC FILTER & SORT ---
  const filteredRegulations = useMemo(() => {
    let result = [...regulations];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((reg) => reg.name.toLowerCase().includes(term) || (reg.description || "").toLowerCase().includes(term));
    }

    result.sort((a, b) => {
      if (sortOption === "newest") return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortOption === "oldest") return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      if (sortOption === "a-z") return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [regulations, searchTerm, sortOption]);

  const handleFileChange = (e) => {
    setNewFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newFile) {
      toast.warning("File dokumen wajib diunggah.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("name", newName);
    formData.append("description", newDescription);
    formData.append("file", newFile);

    apiClient
      .post("/admin/regulations", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        toast.success("Regulasi berhasil ditambahkan.");
        setNewName("");
        setNewDescription("");
        setNewFile(null);
        document.getElementById("file-input").value = "";
        fetchData();
      })
      .catch((error) => toast.error("Gagal upload: " + (error.response?.data?.msg || "Error")))
      .finally(() => setIsUploading(false));
  };

  const openDeleteConfirm = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    apiClient
      .delete(`/admin/regulations/${deleteConfirm.id}`)
      .then(() => {
        toast.success("Regulasi dihapus.");
        fetchData();
        setDeleteConfirm({ isOpen: false, id: null });
      })
      .catch(() => toast.error("Gagal menghapus."))
      .finally(() => setIsDeleting(false));
  };

  // --- HANDLER PREVIEW BARU ---
  const handlePreview = (filename) => {
    if (!filename) return;
    // Asumsi file disajikan static oleh backend di /uploads/
    // Sesuaikan URL ini jika backend Anda menggunakan path berbeda atau cloud storage
    const fileUrl = `http://127.0.0.1:5000/uploads/${filename}`;
    setPreviewUrl(fileUrl);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewUrl(null);
  };

  // Helper ekstensi file
  const getFileBadge = (filename) => {
    const ext = filename?.split(".").pop().toLowerCase();
    let color = "slate";
    if (ext === "pdf") color = "rose";
    if (["doc", "docx"].includes(ext)) color = "blue";
    if (["xls", "xlsx"].includes(ext)) color = "emerald";

    return (
      <Badge size="xs" color={color}>
        {ext?.toUpperCase()}
      </Badge>
    );
  };

  // Kolom Tabel
  const columns = [
    {
      key: "name",
      header: "Nama Regulasi",
      cell: (item) => (
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => handlePreview(item.filename)}>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors shrink-0">
            <FiFileText size={18} />
          </div>
          <div>
            <Text className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors text-sm">{item.name}</Text>
            <div className="flex items-center gap-2 mt-1">
              {getFileBadge(item.filename)}
              <Text className="text-xs text-gray-400 truncate w-32 lg:w-40">{item.filename}</Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Deskripsi",
      cell: (item) => (
        <div className="max-w-xs lg:max-w-md whitespace-normal break-words">
          <Text className="text-xs text-slate-600 line-clamp-3 leading-relaxed" title={item.description}>
            {item.description || "-"}
          </Text>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (item) => (
        <div className="flex justify-end gap-2">
          <Button size="xs" color="blue" className="rounded-md" variant="secondary" icon={FiEye} onClick={() => handlePreview(item.filename)} title="Lihat Dokumen">
            Buka
          </Button>
          <Button size="xs" variant="light" color="rose" icon={FiTrash2} onClick={() => openDeleteConfirm(item.id)} title="Hapus" />
        </div>
      ),
      className: "text-right w-32",
    },
  ];

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen space-y-8">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
          <FiBookOpen size={28} />
        </div>
        <div>
          <Title className="text-2xl text-slate-800">Master Regulasi</Title>
          <Text className="text-slate-500">Kelola dokumen kebijakan, SOP, dan regulasi eksternal.</Text>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* KOLOM KIRI: TABEL (Lebar) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filter Bar */}
          <Card className="p-4 shadow-sm border border-gray-100 rounded-xl">
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
              <div className="relative flex-grow w-full">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari regulasi..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48 flex-shrink-0">
                <Select value={sortOption} onValueChange={setSortOption} icon={FiFilter} placeholder="Urutkan..." className="h-[38px]">
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="oldest">Terlama</SelectItem>
                  <SelectItem value="a-z">Abjad A-Z</SelectItem>
                </Select>
              </div>
            </div>
          </Card>

          {/* Table Card */}
          <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl min-h-[500px]">
            <AppResourceTable data={filteredRegulations} isLoading={isLoading} columns={columns} emptyMessage="Belum ada dokumen regulasi yang diunggah." />
          </Card>
        </div>

        {/* KOLOM KANAN: FORM UPLOAD (Sticky) */}
        <div className="lg:col-span-1 sticky top-6">
          <Card className="shadow-lg border-t-4 border-blue-500 ring-1 ring-gray-100">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <FiUploadCloud size={20} />
              </div>
              <Title className="text-lg">Unggah Regulasi</Title>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                  Nama Dokumen <span className="text-red-500">*</span>
                </label>
                <TextInput placeholder="Contoh: UU No. 10 Tahun 2024" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Deskripsi</label>
                <Textarea placeholder="Keterangan singkat..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                  File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer relative group">
                  <input id="file-input" type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                  <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                    <FiUploadCloud className="text-gray-400 group-hover:text-blue-500 transition-colors" size={24} />
                    {newFile ? (
                      <Text className="text-blue-600 font-medium truncate max-w-[200px] text-xs">{newFile.name}</Text>
                    ) : (
                      <>
                        <Text className="text-sm text-gray-500 font-medium">Klik untuk pilih file</Text>
                        <Text className="text-[10px] text-gray-400">PDF, DOCX, XLSX (Max 5MB)</Text>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" icon={FiPlus} loading={isUploading} className="text-white w-full bg-blue-600 hover:bg-blue-700 border-blue-600 mt-4 shadow-lg shadow-blue-100 rounded-md">
                Simpan Dokumen
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* --- MODAL PREVIEW DOKUMEN --- */}
      <Dialog open={isPreviewOpen} onClose={closePreview} static={true} className="z-[100]">
        <DialogPanel className="w-full max-w-6xl h-[90vh] p-0 flex flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
          {/* Header Modal */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <FiFileText size={20} />
              </div>
              <div>
                <Title className="text-lg text-slate-800">Preview Dokumen</Title>
                <Text className="text-xs text-gray-500">Menampilkan isi dokumen regulasi.</Text>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {previewUrl && (
                <a href={previewUrl} download target="_blank" rel="noreferrer">
                  <Button size="xs" variant="secondary" icon={FiDownload}>
                    Unduh
                  </Button>
                </a>
              )}
              <Button icon={FiX} variant="light" color="slate" onClick={closePreview} className="rounded-full hover:bg-gray-200 p-2" />
            </div>
          </div>

          {/* Content (Iframe) */}
          <div className="flex-1 bg-gray-100 relative overflow-hidden">
            {previewUrl ? <iframe src={previewUrl} className="w-full h-full border-none" title="Document Preview" /> : <div className="flex items-center justify-center h-full text-gray-400">File tidak ditemukan.</div>}
          </div>
        </DialogPanel>
      </Dialog>

      {/* --- CONFIRM DELETE --- */}
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Hapus Regulasi"
        message="Apakah Anda yakin ingin menghapus dokumen ini? File akan hilang permanen."
        isLoading={isDeleting}
      />
    </div>
  );
}

export default RegulationPage;
