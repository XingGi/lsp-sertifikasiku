// frontend/src/features/risk-management/madya/components/MadyaAssessmentView.jsx
import React from "react";
import { Title, Text, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Card, Grid, Badge } from "@tremor/react";
import StrukturOrganisasiTable from "./StrukturOrganisasiTable";
import RiskMapCard from "./RiskMapCard";
import apiClient from "../../../../api/api";
import MadyaCriteriaReference from "./MadyaCriteriaReference";

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
};

const formatDateIndo = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  // Cek validitas tanggal agar tidak error
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    // Opsional: Tambah jam jika perlu
    // hour: "2-digit", minute: "2-digit"
  }).format(date);
};

const getCellColor = (score) => {
  if (score === null || score === undefined) return "bg-gray-200 text-gray-500";
  if (score >= 20) return "bg-red-600 text-white";
  if (score >= 16) return "bg-orange-500 text-white";
  if (score >= 12) return "bg-yellow-400 text-black";
  if (score >= 6) return "bg-lime-400 text-black";
  if (score >= 1) return "bg-green-500 text-white";
  return "bg-gray-200 text-gray-500";
};

const riskLevelMapSimple = {
  R: "bg-green-500 text-white",
  L: "bg-lime-400 text-black",
  M: "bg-yellow-400 text-black",
  H: "bg-orange-500 text-white",
  E: "bg-red-600 text-white",
};

function MadyaAssessmentView({ assessmentData, templateData, riskInputEntries }) {
  if (!assessmentData) return <Text>Data asesmen tidak tersedia.</Text>;

  const API_BASE_URL_FOR_IMAGE = apiClient.defaults.baseURL; // Ambil baseURL (misal: http://127.0.0.1:5000/api)
  const imageUrlFull = assessmentData.structure_image_url ? `${API_BASE_URL_FOR_IMAGE.replace("/api", "")}${assessmentData.structure_image_url.startsWith("/") ? "" : "/"}${assessmentData.structure_image_url}` : null;

  const getSasaranText = (sasaranId) => {
    const found = assessmentData?.sasaran_kpi_entries?.find((s) => s.id === sasaranId);
    return found?.sasaran_kpi || "-";
  };

  return (
    <div className="space-y-6 m-1">
      <Card>
        <Title as="h2">Informasi Asesmen</Title>
        <Grid numItemsMd={2} className="gap-4 mt-4">
          <div>
            <Text>Nama Asesmen:</Text>
            <Text className="font-semibold">{assessmentData.nama_asesmen}</Text>
          </div>
          <div>
            <Text>ID Asesmen:</Text>
            <Text className="font-semibold">RAM-#{assessmentData.id}</Text>
          </div>
          <div>
            <Text>Dibuat Tanggal:</Text>
            <Text className="font-semibold">{formatDateIndo(assessmentData.created_at)}</Text>
          </div>
          <div>
            <Text>Template Peta Risiko:</Text>
            <Text className="font-semibold">{templateData?.name || "N/A"}</Text>
          </div>
          {assessmentData.filter_organisasi && (
            <div>
              <Text>Filter Organisasi:</Text>
              <Text className="font-semibold">{assessmentData.filter_organisasi}</Text>
            </div>
          )}
          {assessmentData.filter_direktorat && (
            <div>
              <Text>Filter Direktorat:</Text>
              <Text className="font-semibold">{assessmentData.filter_direktorat}</Text>
            </div>
          )}
          {assessmentData.filter_divisi && (
            <div>
              <Text>Filter Divisi:</Text>
              <Text className="font-semibold">{assessmentData.filter_divisi}</Text>
            </div>
          )}
          {assessmentData.filter_departemen && (
            <div>
              <Text>Filter Departemen:</Text>
              <Text className="font-semibold">{assessmentData.filter_departemen}</Text>
            </div>
          )}
        </Grid>
      </Card>

      {/* Card 1: Struktur Organisasi */}
      <Card>
        <Title as="h3">1. Struktur Organisasi</Title>
        {imageUrlFull && (
          <div className="mt-4">
            <img src={imageUrlFull} alt="Struktur Organisasi" className="max-w-xs max-h-48 object-contain rounded border mb-2" />
          </div>
        )}
        <div className="mt-4">
          <StrukturOrganisasiTable data={assessmentData.structure_entries || []} onEdit={null} onDelete={null} readOnly={true} />
        </div>
      </Card>

      <Card>
        <Title as="h3">2. Kriteria Risiko</Title>
        <Text>Acuan kriteria probabilitas dan dampak yang digunakan.</Text>
        <div className="mt-4">
          <MadyaCriteriaReference probabilityCriteria={assessmentData?.probability_criteria || []} impactCriteria={assessmentData?.impact_criteria || []} readOnly={true} />
        </div>
      </Card>

      <Card>
        <Title as="h3">3. Sasaran Organisasi / KPI dan Risk Appetite</Title>
        <Text>Sasaran/KPI yang didefinisikan dan toleransi risikonya.</Text>
        <Table className="mt-4">
          <TableHead>
            <TableRow className="bg-gray-100">
              <TableHeaderCell className="w-1/12 text-center">No</TableHeaderCell>
              <TableHeaderCell className="w-6/12">Sasaran Organisasi / KPI</TableHeaderCell>
              <TableHeaderCell className="w-1/12 text-center">Target</TableHeaderCell>
              <TableHeaderCell className="w-2/12 text-center">Risiko Inheren</TableHeaderCell>
              <TableHeaderCell className="w-2/12 text-center">Risiko Residual</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assessmentData.sasaran_kpi_entries && assessmentData.sasaran_kpi_entries.length > 0 ? (
              assessmentData.sasaran_kpi_entries.map((item, index) => {
                const inherentStyle = getCellColor(item.inherent_risk_score);
                const residualStyle = getCellColor(item.residual_risk_score);
                const targetStyleClass = riskLevelMapSimple[item.target_level] || "bg-gray-200 text-gray-500";

                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell className="whitespace-normal">{item.sasaran_kpi}</TableCell>
                    <TableCell className={`text-center font-semibold ${targetStyleClass}`}>{item.target_level || "-"}</TableCell>
                    <TableCell className={`text-center font-semibold ${inherentStyle}`}>{item.inherent_risk_score ?? "#N/A"}</TableCell>
                    <TableCell className={`text-center font-semibold ${residualStyle}`}>{item.residual_risk_score ?? "#N/A"}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-5">
                  <Text>Belum ada Sasaran Organisasi / KPI yang ditambahkan.</Text>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Card 4: Risk Input (Read-only View) */}
      <Card>
        <Title as="h3">4. Risk Input</Title>
        <Text>Detail risiko yang diidentifikasi.</Text>
        <div className="overflow-x-auto mt-4">
          <Table className="min-w-[4000px]">
            <TableHead>
              <TableRow className="bg-gray-100 text-xs sticky top-0 z-10">
                <TableHeaderCell className="w-12">No</TableHeaderCell>
                <TableHeaderCell>Kode Risiko</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Ancaman/Peluang</TableHeaderCell>
                <TableHeaderCell>Kategori Risiko</TableHeaderCell>
                <TableHeaderCell>Unit Kerja</TableHeaderCell>
                <TableHeaderCell className="min-w-[200px]">Sasaran</TableHeaderCell>
                <TableHeaderCell>Tgl Identifikasi</TableHeaderCell>
                <TableHeaderCell className="min-w-[300px]">Deskripsi Risiko</TableHeaderCell>
                <TableHeaderCell className="min-w-[250px]">Akar Penyebab</TableHeaderCell>
                <TableHeaderCell className="min-w-[200px]">Indikator</TableHeaderCell>
                <TableHeaderCell className="min-w-[250px]">Kontrol Internal</TableHeaderCell>
                <TableHeaderCell className="min-w-[250px]">Deskripsi Dampak</TableHeaderCell>
                <TableHeaderCell className="text-center">P (In)</TableHeaderCell>
                <TableHeaderCell className="text-center">I (In)</TableHeaderCell>
                <TableHeaderCell className="text-center">Skor (In)</TableHeaderCell>
                <TableHeaderCell className="text-center">Prob Kualitatif (%) In</TableHeaderCell>
                <TableHeaderCell className="text-center">Dampak Finansial (Rp) In</TableHeaderCell>
                <TableHeaderCell className="text-center">Nilai Bersih (Rp) In</TableHeaderCell>
                <TableHeaderCell>Pemilik Risiko</TableHeaderCell>
                <TableHeaderCell>Jabatan Pemilik</TableHeaderCell>
                <TableHeaderCell>Kontak HP</TableHeaderCell>
                <TableHeaderCell>Kontak Email</TableHeaderCell>
                <TableHeaderCell>Strategi</TableHeaderCell>
                <TableHeaderCell className="min-w-[300px]">Rencana Penanganan</TableHeaderCell>
                <TableHeaderCell className="text-center">Biaya Penanganan (Rp)</TableHeaderCell>
                <TableHeaderCell className="min-w-[250px]">Penanganan Dilakukan</TableHeaderCell>
                <TableHeaderCell>Status Penanganan</TableHeaderCell>
                <TableHeaderCell>Jadwal Mulai</TableHeaderCell>
                <TableHeaderCell>Jadwal Selesai</TableHeaderCell>
                <TableHeaderCell>PIC Penanganan</TableHeaderCell>
                <TableHeaderCell className="text-center">P (Res)</TableHeaderCell>
                <TableHeaderCell className="text-center">I (Res)</TableHeaderCell>
                <TableHeaderCell className="text-center">Skor (Res)</TableHeaderCell>
                <TableHeaderCell className="text-center">Prob Kualitatif (%) Res</TableHeaderCell>
                <TableHeaderCell className="text-center">Dampak Finansial (Rp) Res</TableHeaderCell>
                <TableHeaderCell className="text-center">Nilai Bersih (Rp) Res</TableHeaderCell>
                <TableHeaderCell>Tgl Review</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {riskInputEntries && riskInputEntries.length > 0 ? (
                riskInputEntries.map((r, i) => {
                  const inherentStyle = getCellColor(r.inherent_skor);
                  const residualStyle = getCellColor(r.residual_skor);
                  const kategoriDisplay = r.kategori_risiko === "Lainnya" || r.kategori_risiko === "Risiko Lainnya" ? r.kategori_risiko_lainnya : r.kategori_risiko;
                  return (
                    <TableRow key={r.id} className="text-xs hover:bg-slate-50 [&>td]:py-1 [&>td]:px-2">
                      <TableCell className="text-center">{i + 1}</TableCell>
                      <TableCell>{r.kode_risiko || "-"}</TableCell>
                      <TableCell>
                        <Badge color={r.status_risiko === "Risiko Aktif" ? "blue" : "gray"}>{r.status_risiko}</Badge>
                      </TableCell>
                      <TableCell>{r.peluang_ancaman}</TableCell>
                      <TableCell>{kategoriDisplay}</TableCell>
                      <TableCell>{r.unit_kerja}</TableCell>
                      <TableCell className="whitespace-normal">{getSasaranText(r.sasaran_id)}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDateIndo(r.tanggal_identifikasi)}</TableCell>
                      <TableCell className="whitespace-normal">{r.deskripsi_risiko}</TableCell>
                      <TableCell className="whitespace-normal">{r.akar_penyebab || "-"}</TableCell>
                      <TableCell className="whitespace-normal">{r.indikator_risiko || "-"}</TableCell>
                      <TableCell className="whitespace-normal">{r.internal_control || "-"}</TableCell>
                      <TableCell className="whitespace-normal">{r.deskripsi_dampak || "-"}</TableCell>
                      <TableCell className={`text-center font-semibold ${inherentStyle.colorClass}`}>{r.inherent_probabilitas}</TableCell>
                      <TableCell className={`text-center font-semibold ${inherentStyle.colorClass}`}>{r.inherent_dampak}</TableCell>
                      <TableCell className={`text-center font-semibold ${inherentStyle.colorClass}`}>{r.inherent_skor ?? "N/A"}</TableCell>
                      <TableCell className="text-right">{r.inherent_prob_kualitatif !== null ? `${r.inherent_prob_kualitatif}%` : "-"}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(r.inherent_dampak_finansial)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(r.inherent_nilai_bersih)}</TableCell>
                      <TableCell>{r.pemilik_risiko || "-"}</TableCell>
                      <TableCell>{r.jabatan_pemilik || "-"}</TableCell>
                      <TableCell>{r.kontak_pemilik_hp || "-"}</TableCell>
                      <TableCell>{r.kontak_pemilik_email || "-"}</TableCell>
                      <TableCell>{r.strategi || "-"}</TableCell>
                      <TableCell className="whitespace-normal">{r.rencana_penanganan || "-"}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(r.biaya_penanganan)}</TableCell>
                      <TableCell className="whitespace-normal">{r.penanganan_dilakukan || "-"}</TableCell>
                      <TableCell>
                        <Badge color={r.status_penanganan === "Done" ? "emerald" : r.status_penanganan ? "orange" : "gray"}>{r.status_penanganan || "-"}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{formatDateIndo(r.jadwal_mulai_penanganan)}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDateIndo(r.jadwal_selesai_penanganan)}</TableCell>
                      <TableCell>{r.pic_penanganan || "-"}</TableCell>
                      <TableCell className={`text-center font-semibold ${residualStyle.colorClass}`}>{r.residual_probabilitas ?? "-"}</TableCell>
                      <TableCell className={`text-center font-semibold ${residualStyle.colorClass}`}>{r.residual_dampak ?? "-"}</TableCell>
                      <TableCell className={`text-center font-semibold ${residualStyle.colorClass}`}>{r.residual_skor ?? "N/A"}</TableCell>
                      <TableCell className="text-right">{r.residual_prob_kualitatif !== null ? `${r.residual_prob_kualitatif}%` : "-"}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(r.residual_dampak_finansial)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(r.residual_nilai_bersih)}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDateIndo(r.tanggal_review)}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={38} className="text-center py-5">
                    <Text>Belum ada data Risk Input.</Text>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Card 5: Peta Risiko */}
      <RiskMapCard risks={riskInputEntries || []} templateData={templateData} />
    </div>
  );
}

export default MadyaAssessmentView;
