// frontend/src/features/risk-management/madya/components/MadyaCriteriaReference.jsx
import React, { useState, useEffect } from "react";
import { TabGroup, TabList, Tab, TabPanels, TabPanel, Title, Text, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Button, Dialog, DialogPanel, TextInput, Textarea } from "@tremor/react";
import { FiEdit, FiEye, FiX, FiBarChart2, FiDollarSign, FiShield } from "react-icons/fi";
import apiClient from "../../../../api/api";
import { toast } from "sonner";

import { initialProbabilityData, initialImpactData, criteriaStyles } from "../../../../data/madyaCriteriaData";

// --- Tambah kelas CSS untuk perataan ---
const cellClassName = "align-middle text-center whitespace-normal border border-slate-300";
const headerClassName = "align-middle text-center whitespace-normal border border-slate-300";
const columnStyle = "w-[180px]";

function MadyaCriteriaReference({ probabilityCriteria = [], impactCriteria = [], onCriteriaSave, readOnly = false }) {
  const [criteriaData, setCriteriaData] = useState(initialProbabilityData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    level: 0,
    parameter: "",
    kemungkinan: "",
    frekuensi: "",
    persentase: "",
  });

  const [impactData, setImpactData] = useState(initialImpactData);
  const [isImpactModalOpen, setIsImpactModalOpen] = useState(false);
  const [impactFormData, setImpactFormData] = useState(null);

  useEffect(() => {
    // setCriteriaData(probabilityCriteria);
    if (probabilityCriteria.length > 0) setCriteriaData(probabilityCriteria);
  }, [probabilityCriteria]);

  useEffect(() => {
    setImpactData(impactCriteria);
  }, [impactCriteria]);

  const handleEditClick = (item) => {
    setFormData(item);
    setIsModalOpen(true);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSave = async () => {
    if (!formData.id) return;
    try {
      // Panggil API PUT baru kita
      await apiClient.put(`/madya-assessments/criteria/probability/${formData.id}`, formData);
      setIsModalOpen(false);
      if (onCriteriaSave) onCriteriaSave(); // Panggil refresh parent
      toast.success("Kriteria probabilitas berhasil diperbarui.");
    } catch (error) {
      toast.error("Gagal menyimpan: " + (error.response?.data?.msg || "Error"));
    }
  };

  const handleImpactEditClick = (item) => {
    setImpactFormData(item);
    setIsImpactModalOpen(true);
  };

  const handleImpactInputChange = (e) => {
    const { name, value } = e.target;
    setImpactFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImpactSave = async () => {
    if (!impactFormData || !impactFormData.id) return;
    try {
      // Panggil API PUT baru kita
      await apiClient.put(`/madya-assessments/criteria/impact/${impactFormData.id}`, impactFormData);
      setIsImpactModalOpen(false);
      setImpactFormData(null);
      if (onCriteriaSave) onCriteriaSave(); // Panggil refresh parent
      toast.success("Kriteria dampak berhasil diperbarui.");
    } catch (error) {
      toast.error("Gagal menyimpan: " + (error.response?.data?.msg || "Error"));
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* --- TABEL PROBABILITAS --- */}
      <div>
        <Title className="text-xl">Kriteria Probabilitas</Title>
        <Table className="mt-2">
          <TableHead className="text-sm">
            <TableRow className="bg-slate-100">
              <TableHeaderCell rowSpan={2} className="align-middle w-16">
                Skala
              </TableHeaderCell>
              <TableHeaderCell rowSpan={2} className="align-middle max-w-xs">
                Parameter
              </TableHeaderCell>
              <TableHeaderCell colSpan={3} className="text-center bg-slate-300">
                Parameter
              </TableHeaderCell>
            </TableRow>
            <TableRow className="bg-slate-100">
              <TableHeaderCell className="max-w-xs">Kemungkinan terjadi</TableHeaderCell>
              <TableHeaderCell className="max-w-xs">Frekuensi kejadian</TableHeaderCell>
              <TableHeaderCell className="max-w-xs">Persentase</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {criteriaData
              .sort((a, b) => b.level - a.level) // Urutkan dari 5 ke 1
              .map((item) => (
                <TableRow className="text-xs" key={item.level}>
                  <TableCell className={`font-semibold align-top ${criteriaStyles[`level${item.level}`]}`}>{item.level}</TableCell>
                  <TableCell className="align-top whitespace-normal max-w-xs">
                    <Text>{item.parameter}</Text>
                    {!readOnly && <Button size="xs" variant="light" icon={FiEdit} onClick={() => handleEditClick(item)} className="mt-2 -ml-2 p-1" />}
                  </TableCell>
                  <TableCell className="align-top whitespace-normal max-w-xs">{item.kemungkinan}</TableCell>
                  <TableCell className="align-top whitespace-normal max-w-xs">{item.frekuensi}</TableCell>
                  <TableCell className="align-top whitespace-normal max-w-xs">{item.persentase}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <hr className="border-4 border-double" />

      {/* --- TABEL DAMPAK --- */}
      <div>
        <Title className="text-xl">Kriteria Dampak</Title>
        <div className="mt-3 overflow-x-auto">
          <Table className="min-w-[5800px]">
            <TableHead>
              {/* Baris 1: Kuantitatif / Kualitatif (Tidak Berubah) */}
              <TableRow className="bg-slate-100">
                <TableHeaderCell rowSpan={4} className="align-middle !text-center sticky left-0 z-10 bg-slate-100 w-16 border border-slate-300">
                  Skala
                </TableHeaderCell>
                <TableHeaderCell colSpan={3} className={headerClassName}>
                  DAMPAK KUANTITATIF
                </TableHeaderCell>
                <TableHeaderCell colSpan={23} className="text-left border border-slate-300">
                  DAMPAK KUALITATIF
                </TableHeaderCell>
              </TableRow>

              {/* Baris 2: Parameter Induk (Semua Diberi rowSpan={2}) */}
              <TableRow className="bg-slate-100">
                <TableHeaderCell rowSpan={3} className={`${headerClassName} bg-slate-100 ${columnStyle}`}>
                  Kriteria Dampak
                </TableHeaderCell>
                <TableHeaderCell rowSpan={3} className={`${headerClassName} ${columnStyle}`}>
                  Range Dampak Finansial
                </TableHeaderCell>
                <TableHeaderCell rowSpan={3} className={`${headerClassName} ${columnStyle}`}>
                  Deskripsi Dampak
                </TableHeaderCell>
                <TableHeaderCell rowSpan={2} colSpan={1} className={`${headerClassName} bg-slate-200`}>
                  Risiko Strategis
                </TableHeaderCell>
                <TableHeaderCell rowSpan={2} colSpan={1} className={`${headerClassName} bg-slate-300`}>
                  Risiko Hukum
                </TableHeaderCell>
                <TableHeaderCell rowSpan={2} colSpan={1} className={`${headerClassName} bg-slate-200`}>
                  Risiko Kepatuhan
                </TableHeaderCell>
                <TableHeaderCell rowSpan={2} colSpan={3} className={`${headerClassName} bg-slate-300`}>
                  Risiko Reputasi
                </TableHeaderCell>
                <TableHeaderCell rowSpan={2} colSpan={3} className={`${headerClassName} bg-slate-200`}>
                  Risiko Sumber Daya Manusia
                </TableHeaderCell>
                <TableHeaderCell rowSpan={2} colSpan={3} className={`${headerClassName} bg-slate-300`}>
                  Risiko Sistem Infrastruktur Teknologi dan Keamanan Siber
                </TableHeaderCell>
                <TableHeaderCell rowSpan={2} colSpan={1} className={`${headerClassName} bg-slate-200`}>
                  Risiko Operasional
                </TableHeaderCell>
                <TableHeaderCell rowSpan={2} colSpan={5} className={`${headerClassName} bg-slate-300`}>
                  Risiko Health, Safety, Security and Environmental (HSSE) dan Sosial
                </TableHeaderCell>

                <TableHeaderCell rowSpan={2} colSpan={1} className={`${headerClassName} bg-slate-200`}>
                  Risiko Penyertaan Modal Negara (PMN)
                </TableHeaderCell>
                <TableHeaderCell rowSpan={2} colSpan={1} className={`${headerClassName} bg-slate-300`}>
                  Risiko Operasional Khusus Industri Perbankan
                </TableHeaderCell>

                <TableHeaderCell rowSpan={2} colSpan={2} className={`${headerClassName} bg-slate-200`}>
                  Risiko Investasi Khusus Industri Asuransi
                </TableHeaderCell>

                <TableHeaderCell rowSpan={2} colSpan={1} className={`${headerClassName} bg-slate-300`}>
                  Risiko Aktuarial
                </TableHeaderCell>
              </TableRow>

              {/* Baris 3 (SEKARANG KOSONG) */}
              <TableRow className="bg-slate-100"></TableRow>

              {/* Baris 4 (Semua sub-parameter level akhir) */}
              <TableRow className="bg-slate-100">
                {/* Strategis */}
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>Dampak keterlambatan pencapaian program strategis</TableHeaderCell>
                {/* Hukum */}
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>Pelanggaran hukum</TableHeaderCell>
                {/* Kepatuhan */}
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>Pelanggaran ketentuan kepatuhan</TableHeaderCell>

                {/* Reputasi */}
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>Keluhan pelanggan / nasabah / pembeli / supplier</TableHeaderCell>
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>Pemberitaan negatif di media</TableHeaderCell>
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>Kehilangan daya saing</TableHeaderCell>

                {/* SDM */}
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>Keluhan karyawan</TableHeaderCell>
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>Turn over karyawan bertalenta</TableHeaderCell>
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>regretted turnover</TableHeaderCell>

                {/* Sistem */}
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>Gangguan aplikasi infrastruktur pendukung</TableHeaderCell>
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>Serangan siber</TableHeaderCell>
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>Hasil penilaian platform security</TableHeaderCell>

                {/* Operasional */}
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>Pelampauan pemenuhan SLA (Service Level Agreement)</TableHeaderCell>
                <TableHeaderCell colSpan={3} className={`${headerClassName} ${columnStyle}`}>
                  Fatality
                </TableHeaderCell>
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>Kerusakan Lingkungan</TableHeaderCell>
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>Penurunan ESG rating Sustainalytic</TableHeaderCell>

                {/* PMN */}
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>Penundaan pencairan PMN</TableHeaderCell>
                {/* Bank */}
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>Total jumlah fraud internal dan eksternal</TableHeaderCell>
                <TableHeaderCell colSpan={2} className={`${headerClassName} ${columnStyle}`}>
                  Penurunan aset investasi berdasarkan rating surat utang atau Peringkat bank penerbit deposito
                </TableHeaderCell>

                {/* Aktuarial */}
                <TableHeaderCell className={`${headerClassName} ${columnStyle}`}>Rasio Klaim</TableHeaderCell>
              </TableRow>
            </TableHead>

            {/* --- TableBody (Tidak Berubah, urutan sel sudah benar) --- */}
            <TableBody>
              {impactData
                .sort((a, b) => b.level - a.level) // Urutkan dari 5 ke 1
                .map((item) => (
                  <TableRow key={item.level}>
                    <TableCell className={`font-semibold sticky left-0 z-10 ${criteriaStyles[`level${item.level}`]} ${cellClassName}`}>{item.level}</TableCell>
                    {/* Kuantitatif */}
                    <TableCell className={`${cellClassName} bg-white ${columnStyle}`}>
                      <Text className="text-center">{item.kriteriaDampak}</Text>
                      {!readOnly && <Button size="xs" variant="light" icon={FiEdit} onClick={() => handleImpactEditClick(item)} className="mt-2 mx-auto p-1" />}
                    </TableCell>
                    <TableCell className={`${cellClassName} whitespace-pre-line ${columnStyle}`}>{item.rangeFinansial}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.deskripsiDampak1}</TableCell>
                    {/* Kualitatif (Urutan sel sudah sesuai dengan header Baris 4 yang baru) */}
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.stra_dampak}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.hukum_pelanggaran}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.kepat_pelanggaran}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.reput_keluhan}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.reput_berita}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.reput_saing}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.sdm_keluhan}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.sdm_turnover}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.sdm_regretted_turnover}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.sistem_gangguan}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.sistem_siber}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.sistem_platform}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.ops_sla}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.hsse_fatality_1}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.hsse_fatality_2}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.hsse_fatality_3}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.hsse_kerusakan_lingkungan}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.hsse_penurunan_esg}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.pmn_tunda}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.bank_fraud}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.asuransi_aset_rating}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.asuransi_aset_peringkat}</TableCell>
                    <TableCell className={`${cellClassName} ${columnStyle}`}>{item.aktu_rasio}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {!readOnly && (
        <>
          {/* --- MODAL PROBABILITAS (MODERN) --- */}
          <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} static={true}>
            <DialogPanel className="max-w-xl p-0 overflow-hidden rounded-xl bg-white shadow-xl">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200 bg-blue-50/50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shadow-sm border border-blue-200">
                    <FiEdit size={22} />
                  </div>
                  <div>
                    <Title className="text-lg font-bold text-slate-800">Edit Kriteria Probabilitas</Title>
                    <Text className="text-xs text-gray-500 mt-0.5 font-mono">Skala Level {formData.level}</Text>
                  </div>
                </div>
                <Button icon={FiX} variant="light" color="slate" onClick={() => setIsModalOpen(false)} className="rounded-full hover:bg-gray-200 p-2" />
              </div>

              {/* Body */}
              <div className="p-8 space-y-5 bg-white">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Parameter Utama</label>
                  <TextInput name="parameter" value={formData.parameter} onChange={handleInputChange} placeholder="Contoh: Hampir Pasti" className="font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Kemungkinan Terjadi</label>
                  <Textarea name="kemungkinan" value={formData.kemungkinan} onChange={handleInputChange} rows={3} placeholder="Deskripsi kemungkinan..." />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Frekuensi</label>
                    <Textarea name="frekuensi" value={formData.frekuensi} onChange={handleInputChange} rows={3} placeholder="Contoh: > 10 kali/tahun" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Persentase</label>
                    <Textarea name="persentase" value={formData.persentase} onChange={handleInputChange} rows={3} placeholder="Contoh: > 90%" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <Button variant="secondary" className="rounded-md" color="rose" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleSave} className="text-white bg-blue-600 hover:bg-blue-700 border-blue-600 shadow-lg shadow-blue-100 rounded-md">
                  Simpan Perubahan
                </Button>
              </div>
            </DialogPanel>
          </Dialog>

          {/* --- MODAL DAMPAK (MODERN & GROUPED) --- */}
          <Dialog open={isImpactModalOpen} onClose={() => setIsImpactModalOpen(false)} static={true}>
            {impactFormData && (
              <DialogPanel className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl bg-white shadow-2xl">
                <div className="px-8 py-5 border-b border-gray-200 bg-orange-50/50 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl shadow-sm border border-orange-200">
                      <FiBarChart2 size={22} />
                    </div>
                    <div>
                      <Title className="text-xl font-bold text-slate-800">Edit Kriteria Dampak</Title>
                      <Text className="text-xs text-gray-500 mt-0.5 font-mono">Skala Level {impactFormData.level}</Text>
                    </div>
                  </div>
                  <Button icon={FiX} variant="light" color="slate" onClick={() => setIsImpactModalOpen(false)} className="rounded-full hover:bg-gray-200 p-2" />
                </div>

                <div className="flex-grow overflow-y-auto p-8 bg-slate-50/50 space-y-8">
                  {/* Section 1: Kuantitatif & Finansial */}
                  <div className="bg-white p-6 rounded-xl border-l-4 border-emerald-500 shadow-sm ring-1 ring-gray-200">
                    <h3 className="text-sm font-bold text-emerald-700 mb-5 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
                      <FiDollarSign /> Dampak Kuantitatif & Finansial
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Kriteria Umum</label>
                        <TextInput name="kriteriaDampak" value={impactFormData.kriteriaDampak} onChange={handleImpactInputChange} className="font-semibold" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Range Finansial</label>
                        <Textarea name="rangeFinansial" value={impactFormData.rangeFinansial} onChange={handleImpactInputChange} rows={2} />
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Deskripsi Detail</label>
                        <Textarea name="deskripsiDampak1" value={impactFormData.deskripsiDampak1} onChange={handleImpactInputChange} rows={2} />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Kualitatif Umum */}
                  <div className="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm ring-1 ring-gray-200">
                    <h3 className="text-sm font-bold text-blue-700 mb-5 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
                      <FiShield /> Dampak Kualitatif Umum
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Strategis</label>
                        <Textarea name="stra_dampak" value={impactFormData.stra_dampak} onChange={handleImpactInputChange} rows={4} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Hukum</label>
                        <Textarea name="hukum_pelanggaran" value={impactFormData.hukum_pelanggaran} onChange={handleImpactInputChange} rows={4} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Kepatuhan</label>
                        <Textarea name="kepat_pelanggaran" value={impactFormData.kepat_pelanggaran} onChange={handleImpactInputChange} rows={4} />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Reputasi & SDM */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl border-l-4 border-purple-500 shadow-sm ring-1 ring-gray-200">
                      <h3 className="text-sm font-bold text-purple-700 mb-4 uppercase tracking-wider border-b border-gray-100 pb-2">Reputasi</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">Keluhan Pelanggan</label>
                          <Textarea name="reput_keluhan" value={impactFormData.reput_keluhan} onChange={handleImpactInputChange} rows={2} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">Pemberitaan Negatif</label>
                          <Textarea name="reput_berita" value={impactFormData.reput_berita} onChange={handleImpactInputChange} rows={2} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">Daya Saing</label>
                          <Textarea name="reput_saing" value={impactFormData.reput_saing} onChange={handleImpactInputChange} rows={2} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border-l-4 border-pink-500 shadow-sm ring-1 ring-gray-200">
                      <h3 className="text-sm font-bold text-pink-700 mb-4 uppercase tracking-wider border-b border-gray-100 pb-2">Sumber Daya Manusia</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">Keluhan Karyawan</label>
                          <Textarea name="sdm_keluhan" value={impactFormData.sdm_keluhan} onChange={handleImpactInputChange} rows={2} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">Turnover</label>
                          <Textarea name="sdm_turnover" value={impactFormData.sdm_turnover} onChange={handleImpactInputChange} rows={2} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">Regretted Turnover</label>
                          <Textarea name="sdm_regretted_turnover" value={impactFormData.sdm_regretted_turnover} onChange={handleImpactInputChange} rows={2} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Sistem & HSSE */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl border-l-4 border-cyan-500 shadow-sm ring-1 ring-gray-200">
                      <h3 className="text-sm font-bold text-cyan-700 mb-4 uppercase tracking-wider border-b border-gray-100 pb-2">Sistem & Operasional</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-400 block mb-1">Gangguan Aplikasi</label>
                            <Textarea name="sistem_gangguan" value={impactFormData.sistem_gangguan} onChange={handleImpactInputChange} rows={2} />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-400 block mb-1">Serangan Siber</label>
                            <Textarea name="sistem_siber" value={impactFormData.sistem_siber} onChange={handleImpactInputChange} rows={2} />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">Platform Security</label>
                          <Textarea name="sistem_platform" value={impactFormData.sistem_platform} onChange={handleImpactInputChange} rows={2} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">SLA Operasional</label>
                          <Textarea name="ops_sla" value={impactFormData.ops_sla} onChange={handleImpactInputChange} rows={2} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border-l-4 border-rose-500 shadow-sm ring-1 ring-gray-200">
                      <h3 className="text-sm font-bold text-rose-700 mb-4 uppercase tracking-wider border-b border-gray-100 pb-2">HSSE, Lingkungan & PMN</h3>
                      <div className="space-y-4">
                        {/* Grid Fatality Lengkap (3 Kolom) */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-3 sm:col-span-1">
                            <label className="text-xs font-bold text-gray-400 block mb-1">Fatality (Jamak)</label>
                            <Textarea name="hsse_fatality_1" value={impactFormData.hsse_fatality_1} onChange={handleImpactInputChange} rows={2} className="text-xs" />
                          </div>
                          <div className="col-span-3 sm:col-span-1">
                            <label className="text-xs font-bold text-gray-400 block mb-1">Wabah / Penyakit</label>
                            <Textarea name="hsse_fatality_2" value={impactFormData.hsse_fatality_2} onChange={handleImpactInputChange} rows={2} className="text-xs" />
                          </div>
                          <div className="col-span-3 sm:col-span-1">
                            <label className="text-xs font-bold text-gray-400 block mb-1">Fatality (Tunggal)</label>
                            <Textarea name="hsse_fatality_3" value={impactFormData.hsse_fatality_3} onChange={handleImpactInputChange} rows={2} className="text-xs" />
                          </div>
                        </div>

                        {/* Lingkungan & ESG */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-400 block mb-1">Dampak Lingkungan</label>
                            <Textarea name="hsse_kerusakan_lingkungan" value={impactFormData.hsse_kerusakan_lingkungan} onChange={handleImpactInputChange} rows={2} />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-400 block mb-1">Rating ESG</label>
                            <Textarea name="hsse_penurunan_esg" value={impactFormData.hsse_penurunan_esg} onChange={handleImpactInputChange} rows={2} />
                          </div>
                        </div>

                        {/* PMN (Ditambahkan) */}
                        <div className="pt-2 border-t border-gray-100">
                          <label className="text-xs font-bold text-gray-400 block mb-1">Penundaan Pencairan PMN</label>
                          <Textarea name="pmn_tunda" value={impactFormData.pmn_tunda} onChange={handleImpactInputChange} rows={2} placeholder="Dampak penundaan..." />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Industri Khusus (Perbankan, Asuransi, Aktuarial) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Perbankan */}
                    <div className="bg-white p-6 rounded-xl border-l-4 border-amber-500 shadow-sm ring-1 ring-gray-200">
                      <h3 className="text-sm font-bold text-amber-700 mb-4 uppercase tracking-wider border-b border-gray-100 pb-2">Perbankan</h3>
                      <div>
                        <label className="text-xs font-bold text-gray-400 block mb-1">Total Fraud</label>
                        <Textarea name="bank_fraud" value={impactFormData.bank_fraud} onChange={handleImpactInputChange} rows={3} />
                      </div>
                    </div>

                    {/* Asuransi */}
                    <div className="bg-white p-6 rounded-xl border-l-4 border-indigo-500 shadow-sm ring-1 ring-gray-200">
                      <h3 className="text-sm font-bold text-indigo-700 mb-4 uppercase tracking-wider border-b border-gray-100 pb-2">Asuransi</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">Rating Surat Utang</label>
                          <Textarea name="asuransi_aset_rating" value={impactFormData.asuransi_aset_rating} onChange={handleImpactInputChange} rows={2} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">Peringkat Bank</label>
                          <Textarea name="asuransi_aset_peringkat" value={impactFormData.asuransi_aset_peringkat} onChange={handleImpactInputChange} rows={2} />
                        </div>
                      </div>
                    </div>

                    {/* Aktuarial */}
                    <div className="bg-white p-6 rounded-xl border-l-4 border-teal-500 shadow-sm ring-1 ring-gray-200">
                      <h3 className="text-sm font-bold text-teal-700 mb-4 uppercase tracking-wider border-b border-gray-100 pb-2">Aktuarial</h3>
                      <div>
                        <label className="text-xs font-bold text-gray-400 block mb-1">Rasio Klaim</label>
                        <Textarea name="aktu_rasio" value={impactFormData.aktu_rasio} onChange={handleImpactInputChange} rows={3} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                  <Button variant="secondary" className="rounded-md" color="rose" onClick={() => setIsImpactModalOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleImpactSave} className="text-white bg-orange-600 hover:bg-orange-700 border-orange-600 shadow-lg shadow-orange-100 rounded-md">
                    Simpan Perubahan
                  </Button>
                </div>
              </DialogPanel>
            )}
          </Dialog>
        </>
      )}
    </div>
  );
}

export default MadyaCriteriaReference;
