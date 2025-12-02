// frontend/src/components/BasicAssessmentView.jsx

import React from "react";
import { Title, Text, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from "@tremor/react";

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
};

const formatDateIndo = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

function BasicAssessmentView({ assessmentData }) {
  if (!assessmentData) return null;

  return (
    <div className="space-y-6">
      {/* --- TUGAS 1: PENETAPAN KONTEKS ORGANISASI --- */}
      <div>
        <Title as="h2" className="mb-2">
          Tugas 1 - Penetapan Konteks Organisasi
        </Title>
        <Table>
          <TableHead>
            <TableRow className="bg-cyan-600 text-white">
              <TableHeaderCell>Konteks Eksternal</TableHeaderCell>
              <TableHeaderCell>Konteks Internal</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assessmentData.contexts.length > 0 ? (
              assessmentData.contexts.map((ctx, index) => (
                <TableRow key={`ctx-${index}`}>
                  <TableCell>{ctx.external}</TableCell>
                  <TableCell>{ctx.internal}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-gray-500">
                  Tidak ada data konteks.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <hr className="border-8" />

      {/* --- TUGAS 2: IDENTIFIKASI RISIKO --- */}
      <div>
        <Title as="h2" className="mb-2">
          Tugas 2 - Identifikasi Risiko
        </Title>
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 bg-slate-50">
            {/* Baris 1 */}
            <div className="col-span-1 p-2 bg-blue-700 text-white font-semibold text-sm border-b border-r">Nama Unit Kerja:</div>
            <div className="col-span-2 p-2 bg-blue-100 text-sm border-b border-r">{assessmentData.nama_unit_kerja}</div>

            {/* Sel Header Utama yang di-span */}
            <div className="col-span-9 row-span-2 p-2 text-center font-bold bg-blue-200 flex items-center justify-center">IDENTIFIKASI RISIKO</div>

            {/* Baris 2 */}
            <div className="col-span-1 p-2 bg-blue-700 text-white font-semibold text-sm border-r">Nama Perusahaan:</div>
            <div className="col-span-2 p-2 bg-blue-100 text-sm border-r">{assessmentData.nama_perusahaan}</div>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-[1600px]">
              <TableHead>
                <TableRow className="bg-red-800 text-white">
                  <TableHeaderCell>Kode Risiko</TableHeaderCell>
                  <TableHeaderCell>No.</TableHeaderCell>
                  <TableHeaderCell>Kategori Risiko</TableHeaderCell>
                  <TableHeaderCell>Unit Kerja / Fungsi</TableHeaderCell>
                  <TableHeaderCell>Sasaran</TableHeaderCell>
                  <TableHeaderCell>Tanggal Identifikasi Risiko</TableHeaderCell>
                  <TableHeaderCell>Deskripsi atau Kejadian Risiko</TableHeaderCell>
                  <TableHeaderCell>Akar Penyebab</TableHeaderCell>
                  <TableHeaderCell>Indikator Risiko</TableHeaderCell>
                  <TableHeaderCell>Faktor Positif / Internal Control</TableHeaderCell>
                  <TableHeaderCell>Deskripsi Dampak</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assessmentData.risks.length > 0 ? (
                  assessmentData.risks.map((risk, index) => (
                    <TableRow key={`risk-${index}`}>
                      <TableCell>{risk.kode_risiko}</TableCell>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{risk.kategori_risiko}</TableCell>
                      <TableCell>{risk.unit_kerja}</TableCell>
                      <TableCell>{risk.sasaran}</TableCell>
                      <TableCell>{formatDateIndo(risk.tanggal_identifikasi)}</TableCell>
                      <TableCell>{risk.deskripsi_risiko}</TableCell>
                      <TableCell>{risk.akar_penyebab}</TableCell>
                      <TableCell>{risk.indikator_risiko}</TableCell>
                      <TableCell>{risk.internal_control}</TableCell>
                      <TableCell>{risk.deskripsi_dampak}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-gray-500">
                      Tidak ada data identifikasi risiko.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <hr className="border-8" />

      {/* --- TUGAS 3: ANALISIS RISIKO --- */}
      <div>
        <Title as="h2" className="mb-2">
          Tugas 3 - Analisis Risiko
        </Title>
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 bg-slate-50 border-b">
            <div className="col-span-1 p-2 bg-blue-700 text-white font-semibold text-sm">Nama Unit Kerja:</div>
            <div className="col-span-2 p-2 bg-blue-100 text-sm">{assessmentData.nama_unit_kerja}</div>
            <div className="col-span-9 p-2 text-center font-bold bg-orange-200">ANALISIS RISIKO</div>
          </div>
          <div className="grid grid-cols-12 bg-slate-50 border-b">
            <div className="col-span-1 p-2 bg-blue-700 text-white font-semibold text-sm">Nama Perusahaan:</div>
            <div className="col-span-2 p-2 bg-blue-100 text-sm">{assessmentData.nama_perusahaan}</div>
            <div className="col-span-9 p-2 text-center font-bold bg-red-600 text-white">RISIKO INHERENT</div>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHead>
                <TableRow className="bg-red-800 text-white">
                  <TableHeaderCell>Deskripsi atau Kejadian Risiko</TableHeaderCell>
                  <TableHeaderCell>Probabilitas (P)</TableHeaderCell>
                  <TableHeaderCell>Dampak (I)</TableHeaderCell>
                  <TableHeaderCell>Skor Risiko Inherent (W)</TableHeaderCell>
                  <TableHeaderCell>Probabilitas Risiko Inherent Kualitatif (%)</TableHeaderCell>
                  <TableHeaderCell>Dampak Finansial Risiko Inherent (Rp)</TableHeaderCell>
                  <TableHeaderCell>Nilai Bersih Risiko Inherent</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assessmentData.analyses.length > 0 ? (
                  assessmentData.analyses.map((analysis, index) => {
                    const riskInfo = assessmentData.risks[analysis.risk_identification_id];
                    const skor = (analysis.probabilitas || 0) * (analysis.dampak || 0);
                    const nilaiBersih = (analysis.dampak_finansial || 0) * ((analysis.probabilitas_kualitatif || 0) / 100);
                    return (
                      <TableRow key={`analysis-${index}`}>
                        <TableCell>{riskInfo?.deskripsi_risiko}</TableCell>
                        <TableCell>{analysis.probabilitas}</TableCell>
                        <TableCell>{analysis.dampak}</TableCell>
                        <TableCell>{skor}</TableCell>
                        <TableCell>{analysis.probabilitas_kualitatif}%</TableCell>
                        <TableCell>{formatCurrency(analysis.dampak_finansial)}</TableCell>
                        <TableCell>{formatCurrency(nilaiBersih)}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      Tidak ada data analisis risiko.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BasicAssessmentView;
