// frontend/src/features/admin/competency/MasterSchemeFormPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Title, Text, Button, TextInput, Badge, Accordion, AccordionHeader, AccordionBody, AccordionList } from "@tremor/react";
import { FiArrowLeft, FiSave, FiPlus, FiTrash2, FiBriefcase, FiFileText, FiLayers } from "react-icons/fi";
import apiClient from "../../../api/api";
import UnitSelectionWidget from "./components/UnitSelectionWidget";
import { toast } from "sonner";

export default function MasterSchemeFormPage() {
  const { id } = useParams(); // Kalau ada ID berarti EDIT mode
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [allUnits, setAllUnits] = useState([]); // Master Data Unit

  // State Data Utama
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    job_groups: [], // Array of { name: "", unit_ids: [], evidences: [] }
  });

  // --- INIT ---
  useEffect(() => {
    // 1. Load Master Units
    apiClient.get("/master/competency-units?per_page=1000").then((res) => setAllUnits(res.data.data || []));

    // 2. Load Data Schema (If Edit)
    if (isEditMode) {
      setIsLoading(true);
      apiClient
        .get(`/master/schemes/${id}`)
        .then((res) => {
          const data = res.data;
          // Transform data dari API ke format state
          const formattedGroups = data.job_groups.map((g) => ({
            name: g.name,
            unit_ids: g.units.map((u) => u.id),
            evidences: g.evidences.map((e) => e.name), // Kita pake array string dulu biar simpel
            // Helper buat UI input evidence
            tempEvidence: "",
          }));

          setFormData({
            code: data.code || "",
            title: data.title || "",
            description: data.description || "",
            job_groups: formattedGroups,
          });
        })
        .catch((err) => {
          toast.error("Gagal memuat data skema");
          navigate("/admin/master-schemes");
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditMode, navigate]);

  // --- HANDLERS ---

  // 1. Tambah Kelompok Pekerjaan Baru
  const addJobGroup = () => {
    setFormData((prev) => ({
      ...prev,
      job_groups: [...prev.job_groups, { name: "", unit_ids: [], evidences: [], tempEvidence: "" }],
    }));
  };

  // 2. Hapus Kelompok
  const removeJobGroup = (index) => {
    if (!confirm("Hapus kelompok pekerjaan ini?")) return;
    setFormData((prev) => ({
      ...prev,
      job_groups: prev.job_groups.filter((_, i) => i !== index),
    }));
  };

  // 3. Update Nama Kelompok
  const updateGroupName = (index, val) => {
    const newGroups = [...formData.job_groups];
    newGroups[index].name = val;
    setFormData({ ...formData, job_groups: newGroups });
  };

  // 4. Update Unit di Kelompok
  const updateGroupUnits = (index, newIds) => {
    const newGroups = [...formData.job_groups];
    newGroups[index].unit_ids = newIds;
    setFormData({ ...formData, job_groups: newGroups });
  };

  // 5. Evidence Handlers (Tambah/Hapus Bukti)
  const addEvidence = (groupIndex) => {
    const group = formData.job_groups[groupIndex];
    if (!group.tempEvidence.trim()) return;

    const newGroups = [...formData.job_groups];
    newGroups[groupIndex].evidences.push(group.tempEvidence);
    newGroups[groupIndex].tempEvidence = ""; // Reset input
    setFormData({ ...formData, job_groups: newGroups });
  };

  const removeEvidence = (groupIndex, evIndex) => {
    const newGroups = [...formData.job_groups];
    newGroups[groupIndex].evidences = newGroups[groupIndex].evidences.filter((_, i) => i !== evIndex);
    setFormData({ ...formData, job_groups: newGroups });
  };

  const handleEvidenceKeyDown = (e, groupIndex) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEvidence(groupIndex);
    }
  };

  // 6. Save All
  const handleSave = async () => {
    if (!formData.title) return toast.error("Judul Skema wajib diisi.");
    if (formData.job_groups.length === 0) return toast.error("Minimal harus ada 1 Kelompok Pekerjaan.");

    setIsLoading(true);
    try {
      if (isEditMode) {
        await apiClient.put(`/master/schemes/${id}`, formData);
        toast.success("Skema berhasil diperbarui.");
      } else {
        await apiClient.post("/master/schemes", formData);
        toast.success("Skema berhasil dibuat.");
      }
      navigate("/admin/master-schemes");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan skema.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditMode) return <div className="p-10 text-center">Memuat data...</div>;

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-50 z-20 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button variant="light" icon={FiArrowLeft} onClick={() => navigate("/admin/master-schemes")} className="rounded-full" />
          <div>
            <Title className="text-2xl text-slate-800">{isEditMode ? "Edit Skema" : "Skema Baru"}</Title>
            <Text className="text-slate-500">Susun unit kompetensi berdasarkan kelompok pekerjaan.</Text>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate("/admin/master-schemes")}>
            Batal
          </Button>
          <Button icon={FiSave} loading={isLoading} onClick={handleSave}>
            Simpan Skema
          </Button>
        </div>
      </div>

      <div className="space-y-8 max-w-5xl mx-auto">
        {/* 1. Info Dasar */}
        <Card className="p-6 border-t-4 border-indigo-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Kode Skema</label>
              <TextInput value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="SKM-001" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                Judul Skema <span className="text-red-500">*</span>
              </label>
              <TextInput value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Nama Skema Sertifikasi" />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Deskripsi</label>
              <textarea className="w-full rounded-lg border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 p-2 min-h-[80px]" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>
        </Card>

        {/* 2. Kelompok Pekerjaan Builder */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <div>
              <Title className="text-lg">Struktur Skema</Title>
              <Text>Tambahkan kelompok pekerjaan untuk mengelompokkan unit.</Text>
            </div>
            <Button icon={FiPlus} variant="secondary" color="indigo" onClick={addJobGroup}>
              Tambah Kelompok
            </Button>
          </div>

          {formData.job_groups.length === 0 ? (
            <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-xl bg-white">
              <p className="text-gray-500 mb-2">Belum ada kelompok pekerjaan.</p>
              <Button size="xs" onClick={addJobGroup}>
                Buat Kelompok Pertama
              </Button>
            </div>
          ) : (
            <AccordionList className="space-y-4">
              {formData.job_groups.map((group, idx) => (
                <Accordion key={idx} defaultOpen={true} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <AccordionHeader className="bg-gray-50 border-b border-gray-100 px-4 py-3">
                    <div className="flex justify-between items-center w-full pr-4">
                      <div className="flex items-center gap-3">
                        <Badge color="slate">{idx + 1}</Badge>
                        <span className="font-bold text-slate-700">{group.name || "Kelompok Baru (Klik untuk edit)"}</span>
                        <span className="text-xs text-gray-400 font-normal">
                          ({group.unit_ids.length} Unit, {group.evidences.length} Bukti)
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeJobGroup(idx);
                        }}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </AccordionHeader>
                  <AccordionBody className="p-6">
                    <div className="space-y-6">
                      {/* Nama Kelompok */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nama Kelompok Pekerjaan</label>
                        <TextInput value={group.name} onChange={(e) => updateGroupName(idx, e.target.value)} placeholder="Contoh: Pengukuran Risiko" />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Kiri: Unit Selector */}
                        <div>
                          <div className="flex items-center gap-2 mb-2 text-indigo-700 border-b border-indigo-100 pb-1">
                            <FiLayers /> <span className="text-sm font-bold">Pilih Unit Kompetensi</span>
                          </div>
                          {/* REUSE WIDGET YANG UDAH KITA BUAT */}
                          <UnitSelectionWidget allUnits={allUnits} selectedUnitIds={group.unit_ids} onChange={(newIds) => updateGroupUnits(idx, newIds)} />
                        </div>

                        {/* Kanan: Bukti Portofolio */}
                        <div>
                          <div className="flex items-center gap-2 mb-2 text-emerald-700 border-b border-emerald-100 pb-1">
                            <FiFileText /> <span className="text-sm font-bold">Daftar Bukti Portofolio</span>
                          </div>

                          <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-4 h-[400px] flex flex-col">
                            <div className="flex gap-2 mb-3">
                              <TextInput
                                placeholder="Ketik nama bukti lalu Enter..."
                                value={group.tempEvidence || ""}
                                onChange={(e) => {
                                  const newGroups = [...formData.job_groups];
                                  newGroups[idx].tempEvidence = e.target.value;
                                  setFormData({ ...formData, job_groups: newGroups });
                                }}
                                onKeyDown={(e) => handleEvidenceKeyDown(e, idx)}
                              />
                              <Button size="xs" icon={FiPlus} color="emerald" onClick={() => addEvidence(idx)}>
                                Add
                              </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                              {group.evidences.length === 0 && <p className="text-xs text-gray-400 italic text-center mt-10">Belum ada bukti yang diminta.</p>}
                              {group.evidences.map((ev, evIdx) => (
                                <div key={evIdx} className="flex justify-between items-center bg-white p-2 rounded border border-emerald-200 shadow-sm text-sm">
                                  <span>{ev}</span>
                                  <button onClick={() => removeEvidence(idx, evIdx)} className="text-red-400 hover:text-red-600">
                                    <FiX />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionBody>
                </Accordion>
              ))}
            </AccordionList>
          )}
        </div>
      </div>
    </div>
  );
}
