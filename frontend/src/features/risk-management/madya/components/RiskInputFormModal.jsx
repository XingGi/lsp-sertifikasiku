// frontend/src/features/risk-management/madya/components/RiskInputFormModal.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogPanel, Title, Text, Button, TextInput, Textarea, Select, SelectItem, NumberInput, Grid, Card } from "@tremor/react";
import { FiSave, FiX, FiInfo, FiClipboard, FiTrendingUp, FiUserCheck, FiTool, FiCheckCircle, FiAlertTriangle, FiCalendar, FiTarget, FiPlus } from "react-icons/fi";
import apiClient from "../../../../api/api";
import { toast } from "sonner";

// --- CONSTANTS ---
const statusRisikoOptions = ["Risiko Aktif", "Risiko Retired"];
const peluangAncamanOptions = ["Ancaman", "Peluang"];
const strategiOptions = [
  "Menghindari Risiko",
  "Mengambil atau Meningkatkan Risiko",
  "Menghilangkan Sumber Risiko",
  "Mengubah Kemungkinan",
  "Mengubah Dampak",
  "Membagi Risiko",
  "Mempertahankan (Retain) Risiko",
  "Mengubah Kemungkinan dan Dampak",
];
const kategoriRisikoOptions = ["Risiko Kredit", "Risiko Pasar", "Risiko Likuiditas", "Risiko Operasional", "Risiko Kepatuhan", "Risiko Hukum", "Risiko Strategik", "Risiko Reputasi", "Risiko Lainnya"];

// --- HELPERS ---
const formatDateForInput = (date) => {
  if (!date) return "";
  try {
    if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

const parseFloatSafely = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const cleaned = String(value)
    .replace(/[^0-9.,]/g, "")
    .replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

const formatRupiah = (value) => {
  const num = parseFloatSafely(value);
  if (num === null) return "";
  return new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
};

const parseRupiah = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const cleaned = String(value).replace(/[^0-9]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
};

// Helper: Skor Matriks (1-5)
const clampMatrixValue = (value) => {
  const num = parseInt(value, 10);
  if (value === "" || value === undefined || value === null || isNaN(num)) return "";
  return Math.max(1, Math.min(num, 5));
};

// Helper: Persentase (0-100) - PERBAIKAN MAX 100
const clampPercentValue = (value) => {
  const num = parseFloat(value);
  if (value === "" || value === undefined || value === null || isNaN(num)) return "";
  return Math.max(0, Math.min(num, 100));
};

const getDefaultFormState = () => ({
  assessment_id: null,
  status_risiko: "Risiko Aktif",
  peluang_ancaman: "Ancaman",
  kategori_risiko: "",
  kategori_risiko_lainnya: "",
  unit_kerja: "",
  sasaran_id: "",
  tanggal_identifikasi: formatDateForInput(new Date()),
  deskripsi_risiko: "",
  akar_penyebab: "",
  indikator_risiko: "",
  internal_control: "",
  deskripsi_dampak: "",
  inherent_probabilitas: 1,
  inherent_dampak: 1,
  inherent_prob_kualitatif: null,
  inherent_dampak_finansial: null,
  pemilik_risiko: "",
  jabatan_pemilik: "",
  kontak_pemilik_hp: "",
  kontak_pemilik_email: "",
  strategi: "",
  rencana_penanganan: "",
  biaya_penanganan: null,
  penanganan_dilakukan: "",
  status_penanganan: "",
  jadwal_mulai_penanganan: "",
  jadwal_selesai_penanganan: "",
  pic_penanganan: "",
  residual_probabilitas: null,
  residual_dampak: null,
  residual_prob_kualitatif: null,
  residual_dampak_finansial: null,
  tanggal_review: "",
});

function RiskInputFormModal({ isOpen, onClose, onSaveSuccess, assessmentId, initialData = null, sasaranOptions = [], unitKerjaOptions = [], templateScores = [] }) {
  const isEditMode = Boolean(initialData?.id);
  const [formData, setFormData] = useState(getDefaultFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const validSasaranOptions = Array.isArray(sasaranOptions) ? sasaranOptions : [];

  useEffect(() => {
    if (isOpen) {
      const defaultState = getDefaultFormState();
      defaultState.assessment_id = assessmentId;

      if (isEditMode && initialData) {
        const formattedInitialData = {
          ...initialData,
          tanggal_identifikasi: formatDateForInput(initialData.tanggal_identifikasi),
          jadwal_mulai_penanganan: formatDateForInput(initialData.jadwal_mulai_penanganan),
          jadwal_selesai_penanganan: formatDateForInput(initialData.jadwal_selesai_penanganan),
          tanggal_review: formatDateForInput(initialData.tanggal_review),
          inherent_probabilitas: clampMatrixValue(initialData.inherent_probabilitas) || 1,
          inherent_dampak: clampMatrixValue(initialData.inherent_dampak) || 1,
          residual_probabilitas: clampMatrixValue(initialData.residual_probabilitas) || null,
          residual_dampak: clampMatrixValue(initialData.residual_dampak) || null,
        };
        setFormData({ ...defaultState, ...formattedInitialData, assessment_id: assessmentId });
      } else {
        setFormData(defaultState);
      }
      setError("");
    }
  }, [isOpen, initialData, assessmentId, isEditMode]);

  // --- LOGIC PERHITUNGAN (DIPERBAIKI & DIKEMBALIKAN KE ASAL) ---

  // 1. Nilai Bersih Inheren = Prob% * DampakRp
  const calculatedInherenNilaiBersih = useMemo(() => {
    const prob = parseFloatSafely(formData.inherent_prob_kualitatif);
    const dampak = parseRupiah(formData.inherent_dampak_finansial);
    if (prob === null || dampak === null) return null;
    return (prob / 100.0) * dampak;
  }, [formData.inherent_prob_kualitatif, formData.inherent_dampak_finansial]);

  // 2. Dampak Finansial Residual = DampakInheren * (ProbResidual% / 100)
  // (Rumus dari file asli: Dampak turun karena probabilitas turun? Atau ini asumsi mitigasi?)
  const calculatedDampakFinansialResidual = useMemo(() => {
    const dampakInheren = parseRupiah(formData.inherent_dampak_finansial);
    const probResidualKualitatif = parseFloatSafely(formData.residual_prob_kualitatif);
    if (dampakInheren === null || probResidualKualitatif === null) return null;
    // Mengikuti logika file asli: Dampak Inheren * Persen Residual
    return dampakInheren * (probResidualKualitatif / 100.0);
  }, [formData.inherent_dampak_finansial, formData.residual_prob_kualitatif]);

  // 3. Nilai Bersih Residual = DampakResidual * (ProbResidual% / 100)
  // (Rumus dari file asli: Dampak Residual dikali lagi dengan Probabilitas Residual)
  const calculatedResidualNilaiBersih = useMemo(() => {
    const dampakResidual = calculatedDampakFinansialResidual;
    const probResidualKualitatif = parseFloatSafely(formData.residual_prob_kualitatif);
    if (dampakResidual === null || probResidualKualitatif === null) return null;
    return dampakResidual * (probResidualKualitatif / 100.0);
  }, [calculatedDampakFinansialResidual, formData.residual_prob_kualitatif]);

  // --- HANDLERS ---
  const handleChange = (name, value) => {
    if (name === "kontak_pemilik_hp") {
      const numericValue = value.replace(/\D/g, ""); // Hapus karakter non-angka
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleKategoriChange = (value) => {
    handleChange("kategori_risiko", value);
    if (value !== "Risiko Lainnya") handleChange("kategori_risiko_lainnya", "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.kategori_risiko === "Risiko Lainnya" && !formData.kategori_risiko_lainnya?.trim()) {
      setError("Harap isi nama Kategori Risiko Lainnya.");
      setIsLoading(false);
      return;
    }

    // 1. Validasi Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.kontak_pemilik_email && !emailRegex.test(formData.kontak_pemilik_email)) {
      setError("Format email tidak valid (contoh: nama@domain.com).");
      setIsLoading(false);
      return;
    }

    // 2. Validasi No HP (10-13 Digit)
    if (formData.kontak_pemilik_hp) {
      if (formData.kontak_pemilik_hp.length < 10 || formData.kontak_pemilik_hp.length > 13) {
        setError("Nomor HP harus terdiri dari 10 hingga 13 digit angka.");
        setIsLoading(false);
        return;
      }
    }

    const inherentP = parseInt(formData.inherent_probabilitas, 10);
    const inherentI = parseInt(formData.inherent_dampak, 10);
    if (isNaN(inherentP) || inherentP < 1 || inherentP > 5 || isNaN(inherentI) || inherentI < 1 || inherentI > 5) {
      setError("Probabilitas dan Dampak Inheren harus antara 1 dan 5.");
      setIsLoading(false);
      return;
    }

    const payload = {
      ...formData,
      inherent_probabilitas: inherentP,
      inherent_dampak: inherentI,
      residual_probabilitas: formData.residual_probabilitas ? parseInt(formData.residual_probabilitas, 10) : null,
      residual_dampak: formData.residual_dampak ? parseInt(formData.residual_dampak, 10) : null,
      sasaran_id: formData.sasaran_id ? parseInt(formData.sasaran_id, 10) : null,
      inherent_prob_kualitatif: parseFloatSafely(formData.inherent_prob_kualitatif),
      residual_prob_kualitatif: parseFloatSafely(formData.residual_prob_kualitatif),
      inherent_dampak_finansial: parseRupiah(formData.inherent_dampak_finansial),
      // GUNAKAN HASIL HITUNG UNTUK DATA RESIDUAL
      residual_dampak_finansial: calculatedDampakFinansialResidual,
      biaya_penanganan: parseRupiah(formData.biaya_penanganan),
    };

    try {
      let response;
      if (isEditMode) {
        response = await apiClient.put(`/risk-inputs/${initialData.id}`, payload);
      } else {
        response = await apiClient.post(`/madya-assessments/${assessmentId}/risk-inputs`, payload);
      }
      onSaveSuccess(response.data, isEditMode);
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || "Gagal menyimpan Risk Input.");
    } finally {
      setIsLoading(false);
    }
  };

  const getScore = (pVal, iVal) => {
    const p = parseInt(pVal, 10);
    const i = parseInt(iVal, 10);
    if (isNaN(p) || p < 1 || p > 5 || isNaN(i) || i < 1 || i > 5) return "";
    const scoreData = templateScores.find((s) => parseInt(s.likelihood_level) === p && parseInt(s.impact_level) === i);
    return scoreData ? String(scoreData.score) : (p * i).toString();
  };

  const inherentSkor = useMemo(() => getScore(formData.inherent_probabilitas, formData.inherent_dampak), [formData.inherent_probabilitas, formData.inherent_dampak, templateScores]);
  const residualSkor = useMemo(() => getScore(formData.residual_probabilitas, formData.residual_dampak), [formData.residual_probabilitas, formData.residual_dampak, templateScores]);

  const labelClass = "text-xs font-bold text-gray-500 uppercase mb-1 block";

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="z-[100]">
      <DialogPanel className="max-w-6xl p-0 overflow-hidden rounded-xl bg-white shadow-2xl transform transition-all">
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm border border-indigo-100">{isEditMode ? <FiClipboard size={22} /> : <FiPlus size={22} />}</div>
            <div>
              <Title className="text-xl text-slate-800 font-bold">{isEditMode ? "Edit Risiko" : "Identifikasi Risiko Baru"}</Title>
              <Text className="text-xs text-gray-500 mt-0.5">Lengkapi formulir detail risiko di bawah ini.</Text>
            </div>
          </div>
          <Button icon={FiX} variant="light" color="slate" onClick={onClose} className="rounded-full hover:bg-gray-200 p-2" />
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-100 text-red-600 text-sm flex items-center gap-2">
            <FiAlertTriangle /> {error}
          </div>
        )}

        {/* BODY FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[75vh] overflow-y-auto bg-slate-50/30">
          {/* 1. IDENTIFIKASI RISIKO */}
          <Card className="p-6 rounded-xl border border-gray-200 shadow-sm bg-white">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-100">
              <FiClipboard className="text-blue-500" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Identifikasi Risiko</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Kode Risiko</label>
                <TextInput name="kode_risiko" value={formData.kode_risiko || ""} onChange={(e) => handleChange("kode_risiko", e.target.value)} placeholder="Otomatis..." />
              </div>
              <div>
                <label className={labelClass}>Status Risiko</label>
                <Select value={formData.status_risiko || ""} onValueChange={(v) => handleChange("status_risiko", v)}>
                  {statusRisikoOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <label className={labelClass}>Peluang / Ancaman</label>
                <Select value={formData.peluang_ancaman || ""} onValueChange={(v) => handleChange("peluang_ancaman", v)}>
                  {peluangAncamanOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <label className={labelClass}>
                  Kategori Risiko<span className="text-red-500">*</span>
                </label>
                <Select value={formData.kategori_risiko || ""} onValueChange={handleKategoriChange} required>
                  {kategoriRisikoOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              {formData.kategori_risiko === "Risiko Lainnya" && (
                <div className="lg:col-span-2">
                  <label className={labelClass}>Nama Kategori Lainnya</label>
                  <TextInput name="kategori_risiko_lainnya" value={formData.kategori_risiko_lainnya || ""} onChange={(e) => handleChange("kategori_risiko_lainnya", e.target.value)} />
                </div>
              )}
              <div>
                <label className={labelClass}>
                  Unit Kerja <span className="text-red-500">*</span>
                </label>
                <Select value={formData.unit_kerja || ""} onValueChange={(v) => handleChange("unit_kerja", v)} placeholder="Pilih Unit...">
                  {unitKerjaOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <label className={labelClass}>
                  Tanggal Identifikasi <span className="text-red-500">*</span>
                </label>
                <TextInput type="date" value={formData.tanggal_identifikasi || ""} onChange={(e) => handleChange("tanggal_identifikasi", e.target.value)} icon={FiCalendar} />
              </div>
              <div className="lg:col-span-3">
                <label className={labelClass}>Sasaran Terkait</label>
                <Select value={String(formData.sasaran_id || "")} onValueChange={(v) => handleChange("sasaran_id", v)} placeholder="Pilih Sasaran KPI...">
                  {validSasaranOptions.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.sasaran_kpi}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="lg:col-span-3">
                <label className={labelClass}>
                  Deskripsi Risiko <span className="text-red-500">*</span>
                </label>
                <Textarea name="deskripsi_risiko" value={formData.deskripsi_risiko} onChange={(e) => handleChange("deskripsi_risiko", e.target.value)} required rows={3} />
              </div>
              <div className="lg:col-span-1">
                <label className={labelClass}>Akar Penyebab</label>
                <Textarea name="akar_penyebab" value={formData.akar_penyebab} onChange={(e) => handleChange("akar_penyebab", e.target.value)} rows={3} />
              </div>
              <div className="lg:col-span-1">
                <label className={labelClass}>Indikator Risiko Kunci (KRI)</label>
                <Textarea name="indikator_risiko" value={formData.indikator_risiko} onChange={(e) => handleChange("indikator_risiko", e.target.value)} rows={3} />
              </div>
              <div className="lg:col-span-1">
                <label className={labelClass}>Kontrol Internal Yang Ada</label>
                <Textarea name="internal_control" value={formData.internal_control} onChange={(e) => handleChange("internal_control", e.target.value)} rows={3} placeholder="SOP, Sistem, dll..." />
              </div>
              <div className="lg:col-span-3">
                <label className={labelClass}>Deskripsi Dampak</label>
                <Textarea name="deskripsi_dampak" value={formData.deskripsi_dampak} onChange={(e) => handleChange("deskripsi_dampak", e.target.value)} rows={2} />
              </div>
            </div>
          </Card>

          {/* 2. ANALISIS RISIKO INHEREN */}
          <Card className="p-6 rounded-xl border-l-4 border-blue-500 shadow-sm ring-1 ring-gray-200 bg-white">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-100">
              <FiTrendingUp className="text-blue-600" />
              <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider">Analisis Risiko Inheren</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 md:col-span-1">
                <Text className="text-xs font-bold text-blue-700 mb-3 uppercase border-b border-blue-200 pb-1">Skor Kuantitatif</Text>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Prob (1-5)</label>
                    <NumberInput value={formData.inherent_probabilitas || ""} onValueChange={(v) => handleChange("inherent_probabilitas", clampMatrixValue(v))} min={1} max={5} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Dampak (1-5)</label>
                    <NumberInput value={formData.inherent_dampak || ""} onValueChange={(v) => handleChange("inherent_dampak", clampMatrixValue(v))} min={1} max={5} />
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-blue-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-600">Skor Risiko</span>
                  <span className="text-xl font-bold text-slate-800">{inherentSkor || "-"}</span>
                </div>
              </div>
              <div className="md:col-span-2 grid grid-cols-2 gap-6">
                {/* Probabilitas 0-100% */}
                <div>
                  <label className={labelClass}>Probabilitas Kualitatif (%)</label>
                  <NumberInput
                    value={formData.inherent_prob_kualitatif || ""}
                    onValueChange={(v) => handleChange("inherent_prob_kualitatif", clampPercentValue(v))}
                    min={0}
                    max={100}
                    icon={() => <span className="text-gray-400 text-xs ml-2">%</span>}
                  />
                </div>
                <div>
                  <label className={labelClass}>Dampak Finansial</label>
                  <TextInput
                    value={formatRupiah(formData.inherent_dampak_finansial || "")}
                    onChange={(e) => handleChange("inherent_dampak_finansial", parseRupiah(e.target.value))}
                    icon={() => <span className="text-gray-400 text-xs ml-2">Rp</span>}
                  />
                </div>
                <div className="col-span-2 bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase">Nilai Bersih Risiko Inhheren (Net Risk)</span>
                  <span className="text-base font-bold text-slate-700">Rp {formatRupiah(calculatedInherenNilaiBersih)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 3. PEMILIK RISIKO */}
          <Card className="p-6 rounded-xl border-l-4 border-yellow-400 shadow-sm ring-1 ring-gray-200 bg-white">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
              <FiUserCheck className="text-yellow-600" />
              <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wider">Pemilik Risiko</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Nama Pemilik Risiko</label>
                <TextInput name="pemilik_risiko" value={formData.pemilik_risiko || ""} onChange={(e) => handleChange("pemilik_risiko", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Jabatan</label>
                <TextInput name="jabatan_pemilik" value={formData.jabatan_pemilik || ""} onChange={(e) => handleChange("jabatan_pemilik", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <TextInput name="kontak_pemilik_email" type="email" value={formData.kontak_pemilik_email || ""} onChange={(e) => handleChange("kontak_pemilik_email", e.target.value)} placeholder="email@perusahaan.com" />
              </div>
              <div>
                <label className={labelClass}>No. HP</label>
                <TextInput
                  name="kontak_pemilik_hp"
                  value={formData.kontak_pemilik_hp || ""}
                  onChange={(e) => handleChange("kontak_pemilik_hp", e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  error={formData.kontak_pemilik_hp && (formData.kontak_pemilik_hp.length < 10 || formData.kontak_pemilik_hp.length > 13)}
                  errorMessage="Harus 10-13 digit"
                />
              </div>
            </div>
          </Card>

          {/* 4. EVALUASI & PENANGANAN */}
          <Card className="p-6 rounded-xl border-l-4 border-emerald-500 shadow-sm ring-1 ring-gray-200 bg-white">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-100">
              <FiTool className="text-emerald-600" />
              <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Evaluasi & Penanganan</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Strategi Penanganan</label>
                <Select value={formData.strategi || ""} onValueChange={(v) => handleChange("strategi", v)} placeholder="Pilih Strategi...">
                  {strategiOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <label className={labelClass}>Estimasi Biaya Penanganan</label>
                <TextInput value={formatRupiah(formData.biaya_penanganan || "")} onChange={(e) => handleChange("biaya_penanganan", parseRupiah(e.target.value))} icon={() => <span className="text-gray-400 text-xs ml-2">Rp</span>} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Rencana Penanganan / Mitigasi</label>
                <Textarea name="rencana_penanganan" value={formData.rencana_penanganan || ""} onChange={(e) => handleChange("rencana_penanganan", e.target.value)} rows={3} />
              </div>
              <div>
                <label className={labelClass}>Status Penanganan</label>
                <Select value={formData.status_penanganan || ""} onValueChange={(v) => handleChange("status_penanganan", v)} placeholder="Status...">
                  {["Open", "In Progress", "Done", "Cancelled"].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <label className={labelClass}>PIC Penanganan</label>
                <TextInput name="pic_penanganan" value={formData.pic_penanganan || ""} onChange={(e) => handleChange("pic_penanganan", e.target.value)} placeholder="Nama Penanggung Jawab" />
              </div>
              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <div>
                  <label className={labelClass}>Jadwal Mulai</label>
                  <TextInput type="date" value={formData.jadwal_mulai_penanganan || ""} onChange={(e) => handleChange("jadwal_mulai_penanganan", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Jadwal Selesai</label>
                  <TextInput type="date" value={formData.jadwal_selesai_penanganan || ""} onChange={(e) => handleChange("jadwal_selesai_penanganan", e.target.value)} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Penanganan Yang Telah Dilakukan</label>
                <Textarea name="penanganan_dilakukan" value={formData.penanganan_dilakukan} onChange={(e) => handleChange("penanganan_dilakukan", e.target.value)} rows={3} placeholder="Tindakan yang sudah dieksekusi..." />
              </div>
            </div>
          </Card>

          {/* 5. ANALISIS RISIKO RESIDUAL (FIXED) */}
          <Card className="p-6 rounded-xl border-l-4 border-orange-500 shadow-sm ring-1 ring-gray-200 bg-white">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-100">
              <FiTarget className="text-orange-600" />
              <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider">Analisis Risiko Residual</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Skor Matriks */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 md:col-span-1">
                <Text className="text-xs font-bold text-orange-700 mb-3 uppercase border-b border-orange-200 pb-1">Target Skor Matriks</Text>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Target P (1-5)</label>
                    <NumberInput value={formData.residual_probabilitas || ""} onValueChange={(v) => handleChange("residual_probabilitas", clampMatrixValue(v))} min={1} max={5} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Target I (1-5)</label>
                    <NumberInput value={formData.residual_dampak || ""} onValueChange={(v) => handleChange("residual_dampak", clampMatrixValue(v))} min={1} max={5} />
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-orange-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-orange-600">Skor Risiko</span>
                  <span className="text-xl font-bold text-slate-800">{residualSkor || "-"}</span>
                </div>
              </div>

              {/* Analisis Finansial Residual */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Probabilitas Kualitatif - IZINKAN 0-100 */}
                <div>
                  <label className={labelClass}>Probabilitas Kualitatif (%)</label>
                  <NumberInput
                    value={formData.residual_prob_kualitatif || ""}
                    onValueChange={(v) => handleChange("residual_prob_kualitatif", clampPercentValue(v))}
                    min={0}
                    max={100}
                    icon={() => <span className="text-gray-400 text-xs ml-2">%</span>}
                  />
                </div>

                {/* Dampak Finansial Residual (READ-ONLY, HASIL HITUNG) */}
                <div>
                  <label className={labelClass}>Dampak Finansial Residual (Hitung)</label>
                  <TextInput value={formatRupiah(calculatedDampakFinansialResidual || "")} disabled placeholder="Otomatis" icon={() => <span className="text-gray-400 text-xs ml-2">Rp</span>} />
                </div>

                {/* Nilai Bersih Residual (READ-ONLY, HASIL HITUNG) */}
                <div className="sm:col-span-2 bg-orange-50/50 p-3 rounded border border-orange-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase">Nilai Bersih Risiko Residual</span>
                  <span className="text-base font-bold text-slate-700">Rp {formatRupiah(calculatedResidualNilaiBersih)}</span>
                </div>

                {/* Tanggal Review */}
                <div className="sm:col-span-2">
                  <label className={labelClass}>Target Review</label>
                  <TextInput type="date" value={formData.tanggal_review || ""} onChange={(e) => handleChange("tanggal_review", e.target.value)} />
                </div>
              </div>
            </div>
          </Card>
        </form>

        {/* FOOTER */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" className="rounded-md" color="rose" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSubmit} loading={isLoading} icon={FiSave} className="text-white bg-indigo-600 border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700 shadow-lg shadow-indigo-100 rounded-md">
            {isEditMode ? "Update Risiko" : "Simpan Risiko"}
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default RiskInputFormModal;
