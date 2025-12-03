// frontend/src/features/admin/competency/MasterSchemePage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Card, Title, Text, Button, TextInput, Dialog, DialogPanel, Select, SelectItem, Badge, Grid } from "@tremor/react";
import { FiPlus, FiLayers, FiCheck, FiX, FiSearch, FiFilter, FiEdit2, FiTrash2, FiGrid, FiList, FiEye, FiHash, FiFileText, FiCpu, FiBookOpen, FiLoader } from "react-icons/fi";
import apiClient from "../../../api/api";
import AppResourceTable from "../../../components/common/AppResourceTable";
import ConfirmationDialog from "../../../components/common/ConfirmationDialog";
import UnitSelectionWidget from "./../competency/UnitSelectionWidget";
import { toast } from "sonner";

function MasterSchemePage() {
  // --- STATE UTAMA ---
  const [schemes, setSchemes] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE VIEW & FILTER ---
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  // --- STATE MODAL CREATE/EDIT ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ id: null, code: "", title: "", description: "", unit_ids: [] });

  // --- STATE MODAL VIEW (READ ONLY) ---
  const [viewModal, setViewModal] = useState({ isOpen: false, isLoading: false, data: null });

  // --- STATE DELETE ---
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, title: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    apiClient
      .get("/master/competency-units?per_page=1000")
      .then((res) => setAllUnits(res.data.data || []))
      .catch((err) => console.error("Gagal load units", err));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchSchemes = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, per_page: itemsPerPage, q: debouncedSearch, sort: sortOption };
      const res = await apiClient.get("/master/schemes", { params });
      setSchemes(res.data.data);
      setTotalPages(res.data.meta.total_pages);
      setTotalItems(res.data.meta.total_items);
    } catch (err) {
      toast.error("Gagal memuat skema.");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, sortOption]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setFormData({ id: null, code: "", title: "", description: "", unit_ids: [] });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setFormData({
      id: item.id,
      code: item.code || "",
      title: item.title,
      description: item.description || "",
      unit_ids: item.unit_ids || [],
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // HANDLER BARU: Open View Modal
  const handleOpenView = async (item) => {
    setViewModal({ isOpen: true, isLoading: true, data: null });
    try {
      // Fetch detail lengkap (termasuk list unit dengan standard_type)
      const res = await apiClient.get(`/master/schemes/${item.id}`);
      setViewModal({ isOpen: true, isLoading: false, data: res.data });
    } catch (error) {
      toast.error("Gagal memuat detail skema.");
      setViewModal({ isOpen: false, isLoading: false, data: null });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title) return toast.error("Judul skema wajib diisi");
    if (formData.unit_ids.length === 0) return toast.error("Pilih minimal 1 unit kompetensi");

    setIsSaving(true);
    try {
      if (isEditMode) {
        await apiClient.put(`/master/schemes/${formData.id}`, formData);
        toast.success("Skema diperbarui");
      } else {
        await apiClient.post("/master/schemes", formData);
        toast.success("Skema berhasil dibuat");
      }
      setIsModalOpen(false);
      fetchSchemes();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/master/schemes/${deleteConfirm.id}`);
      toast.success("Skema dihapus");
      setDeleteConfirm({ isOpen: false, id: null, title: "" });
      fetchSchemes();
    } catch (err) {
      toast.error("Gagal menghapus");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- COLUMNS ---
  const columns = [
    {
      key: "code",
      header: "Kode",
      cell: (item) => (
        <Badge color="slate" className="font-mono rounded-md px-3 py-1">
          {item.code || "-"}
        </Badge>
      ),
    },
    { key: "title", header: "Judul Skema", cell: (item) => <div className="font-bold text-slate-700">{item.title}</div> },
    {
      key: "unit_count",
      header: "Jumlah Unit",
      cell: (item) => (
        <Badge className="rounded-md px-3 py-1" color="indigo" icon={FiLayers}>
          {item.unit_count} Unit
        </Badge>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      cell: (item) => (
        <div className="flex justify-end gap-2">
          {/* Tombol Lihat (Baru) */}
          <Button size="xs" variant="light" color="teal" icon={FiEye} onClick={() => handleOpenView(item)} tooltip="Lihat Detail" />
          <Button size="xs" variant="light" icon={FiEdit2} onClick={() => handleOpenEdit(item)} tooltip="Edit" />
          <Button size="xs" variant="light" color="rose" icon={FiTrash2} onClick={() => setDeleteConfirm({ isOpen: true, id: item.id, title: item.title })} tooltip="Hapus" />
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
          <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600 shadow-sm border border-indigo-200">
            <FiLayers size={28} />
          </div>
          <div>
            <Title className="text-2xl text-slate-800">Master Skema Sertifikasi</Title>
            <Text className="text-slate-500">Manajemen paket kompetensi untuk uji sertifikasi.</Text>
          </div>
        </div>

        <div className="flex gap-3">
          <Button size="lg" variant="secondary" icon={viewMode === "list" ? FiGrid : FiList} onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")} className="shadow-sm border-gray-200 bg-white hover:bg-gray-50 rounded-xl" />
          <Button size="lg" icon={FiPlus} onClick={handleOpenAdd} className="shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all rounded-xl">
            Buat Skema Baru
          </Button>
        </div>
      </div>

      {/* --- FILTER BAR --- */}
      <Card className="p-4 shadow-sm border border-gray-100 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          <div className="relative flex-grow w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari judul atau kode skema..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-56 flex-shrink-0">
            <Select value={sortOption} onValueChange={setSortOption} icon={FiFilter} className="h-[42px]">
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="oldest">Terlama</SelectItem>
              <SelectItem value="title-asc">Judul (A-Z)</SelectItem>
              <SelectItem value="code-asc">Kode (A-Z)</SelectItem>
            </Select>
          </div>
        </div>
      </Card>

      {/* --- CONTENT AREA --- */}
      {viewMode === "list" ? (
        <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl">
          <AppResourceTable data={schemes} isLoading={isLoading} columns={columns} emptyMessage="Belum ada skema." />
        </Card>
      ) : /* GRID VIEW */
      isLoading ? (
        <div className="text-center py-20 text-gray-500">Memuat data...</div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border-2 border-dashed rounded-xl bg-white">Tidak ada skema ditemukan.</div>
      ) : (
        <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6">
          {schemes.map((item) => (
            <Card key={item.id} className="flex flex-col border-t-4 border-t-indigo-500 hover:shadow-xl transition-all group h-full justify-between rounded-xl">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <Badge color="slate" size="xs" icon={FiHash} className="font-mono rounded-md px-3 py-1">
                    {item.code || "N/A"}
                  </Badge>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Tombol View di Grid */}
                    <button onClick={() => handleOpenView(item)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors">
                      <FiEye size={16} />
                    </button>
                    <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                      <FiEdit2 size={16} />
                    </button>
                    <button onClick={() => setDeleteConfirm({ isOpen: true, id: item.id, title: item.title })} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10 leading-relaxed">{item.description || "Tidak ada deskripsi."}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
                <span className="text-xs font-medium text-gray-400">Total Kompetensi</span>
                <div className="flex items-center gap-1.5 text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  <FiLayers size={14} /> {item.unit_count}
                </div>
              </div>
            </Card>
          ))}
        </Grid>
      )}

      {/* --- PAGINATION FOOTER --- */}
      {!isLoading && schemes.length > 0 && (
        <div className="flex justify-center gap-2 mt-2">
          <Button size="xs" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span className="text-sm font-medium self-center text-gray-600 px-2">
            Halaman {page} dari {totalPages}
          </span>
          <Button size="xs" variant="secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      {/* --- MODAL VIEW (READ ONLY) --- */}
      <Dialog open={viewModal.isOpen} onClose={() => setViewModal({ ...viewModal, isOpen: false })} static={true}>
        <DialogPanel className="max-w-5xl w-full p-0 overflow-hidden rounded-2xl bg-white shadow-2xl h-[80vh] flex flex-col transform transition-all">
          {/* Header: Gradient Teal/Emerald biar beda */}
          <div className="px-8 py-6 bg-gradient-to-r from-teal-500 to-emerald-600 flex justify-between items-start flex-shrink-0 text-white relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FiEye size={24} />
                </div>
                <Title className="text-white text-2xl font-bold tracking-tight">Detail Skema Sertifikasi</Title>
              </div>
              <Text className="text-teal-50 opacity-90 ml-1">Daftar unit kompetensi yang terdaftar dalam skema ini.</Text>
            </div>
            <button onClick={() => setViewModal({ ...viewModal, isOpen: false })} className="relative z-10 text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors">
              <FiX size={24} />
            </button>
          </div>

          {/* Body: Content Detail */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
            {viewModal.isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                <div className="animate-spin text-teal-500">
                  <FiLoader size={32} />
                </div>
                <p>Memuat detail skema...</p>
              </div>
            ) : viewModal.data ? (
              <div className="space-y-6">
                {/* Info Header Skema */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge size="xs" color="slate" icon={FiHash} className="font-mono rounded-md px-3 py-1">
                        {viewModal.data.code || "NO-CODE"}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{viewModal.data.title}</h2>
                    <p className="text-gray-500 text-sm mt-1">{viewModal.data.description || "Tidak ada deskripsi."}</p>
                  </div>
                  <div className="text-right flex flex-col justify-center items-end">
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Unit</span>
                    <span className="text-3xl font-bold text-teal-600">{viewModal.data.units?.length || 0}</span>
                  </div>
                </div>

                {/* Table Unit Kompetensi */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <FiCpu className="text-gray-400" />
                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Daftar Unit Kompetensi</h3>
                  </div>

                  {viewModal.data.units && viewModal.data.units.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 text-xs text-gray-500 bg-gray-50/30">
                            <th className="px-5 py-3 font-semibold uppercase tracking-wider w-32">Kode Unit</th>
                            <th className="px-5 py-3 font-semibold uppercase tracking-wider">Judul Unit</th>
                            <th className="px-5 py-3 font-semibold uppercase tracking-wider">Jenis Standar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                          {viewModal.data.units.map((unit, idx) => (
                            <tr key={unit.id} className="hover:bg-teal-50/30 transition-colors group">
                              <td className="px-5 py-3 font-mono text-slate-600 font-medium">{unit.code}</td>
                              <td className="px-5 py-3 text-slate-800 font-medium group-hover:text-teal-700">{unit.title}</td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <FiBookOpen size={12} className="text-teal-400" />
                                  <span className="text-wrap max-w-[200px]" title={unit.standard_type}>
                                    {unit.standard_type}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400 italic">Belum ada unit kompetensi yang ditambahkan ke skema ini.</div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
            <Button variant="secondary" className="rounded-lg border-2 hover:bg-rose-800 hover:border-rose-600 hover:text-white" color="emerald" onClick={() => setViewModal({ ...viewModal, isOpen: false })}>
              Tutup
            </Button>
          </div>
        </DialogPanel>
      </Dialog>

      {/* --- MODAL CREATE/EDIT (EXISTING) --- */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} static={true}>
        <DialogPanel className="max-w-5xl w-full p-0 overflow-hidden rounded-2xl bg-white shadow-2xl h-[85vh] flex flex-col transform transition-all">
          {/* ... (Kode Modal Create/Edit Tetap Sama, Tidak Perlu Diubah) ... */}
          {/* Header Create/Edit */}
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-start flex-shrink-0 text-white relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">{isEditMode ? <FiEdit2 size={24} /> : <FiPlus size={24} />}</div>
                <Title className="text-white text-2xl font-bold tracking-tight">{isEditMode ? "Edit Skema Sertifikasi" : "Buat Skema Baru"}</Title>
              </div>
              <Text className="text-indigo-100 opacity-90 ml-1">{isEditMode ? "Perbarui detail skema dan unit kompetensi." : "Definisikan paket kompetensi baru dan pilih unit terkait."}</Text>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="relative z-10 text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors">
              <FiX size={24} />
            </button>
          </div>

          {/* Body Create/Edit */}
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50">
            <div className="w-full md:w-1/3 p-6 overflow-y-auto border-r border-gray-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-900 font-bold border-b border-indigo-100 pb-2 mb-4">
                  <FiFileText /> Informasi Dasar
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kode Skema</label>
                  <TextInput icon={FiHash} value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="Contoh: SKM-001" className="font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Judul Skema <span className="text-rose-500">*</span>
                  </label>
                  <TextInput value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Nama Skema Sertifikasi" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi</label>
                  <textarea
                    className="w-full rounded-lg border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[120px] p-3 shadow-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tuliskan deskripsi singkat..."
                  />
                </div>
              </div>
            </div>
            <div className="w-full md:w-2/3 p-6 overflow-y-auto bg-slate-50/50">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 text-indigo-900 font-bold border-b border-indigo-100 pb-2 mb-4">
                  <FiCpu /> Konfigurasi Unit Kompetensi
                </div>
                <div className="flex-1 min-h-[400px]">
                  <UnitSelectionWidget allUnits={allUnits} selectedUnitIds={formData.unit_ids} onChange={(newIds) => setFormData({ ...formData, unit_ids: newIds })} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Create/Edit */}
          <div className="p-5 border-t border-gray-200 bg-white flex justify-between items-center flex-shrink-0 z-20">
            <div className="text-sm text-gray-500 italic">
              {formData.unit_ids.length > 0 ? (
                <span>
                  <span className="font-bold text-indigo-600">{formData.unit_ids.length}</span> unit kompetensi dipilih.
                </span>
              ) : (
                "Belum ada unit dipilih."
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="rounded-lg" color="rose" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button icon={FiCheck} loading={isSaving} onClick={handleSave} className="text-white bg-indigo-600 hover:bg-indigo-700 border-indigo-600 shadow-lg shadow-indigo-200 rounded-lg">
                {isEditMode ? "Simpan Perubahan" : "Simpan Skema"}
              </Button>
            </div>
          </div>
        </DialogPanel>
      </Dialog>

      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={handleDelete}
        title="Hapus Skema"
        message={`Apakah Anda yakin ingin menghapus skema "${deleteConfirm.title}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default MasterSchemePage;
