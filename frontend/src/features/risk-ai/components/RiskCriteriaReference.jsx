import React, { useState } from "react";
import { Card, Title, Text, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from "@tremor/react";

const criteriaStyles = {
  level1: "bg-green-500 text-white text-center",
  level2: "bg-lime-500 text-white text-center",
  level3: "bg-yellow-400 text-black text-center",
  level4: "bg-orange-500 text-white text-center",
  level5: "bg-red-600 text-white text-center",
};

const impactTabsData = {
  Financial: {
    headers: ["Parameter", "1", "2", "3", "4", "5"],
    rows: [{ Parameter: "% from Risk Limit", 1: "≤ 20%", 2: "20% - 40%", 3: "40% - 60%", 4: "60% - 80%", 5: "≥ 80%" }],
  },
  Business: {
    headers: ["Parameter", "1", "2", "3", "4", "5"],
    rows: [
      { Parameter: "Pencapaian Target (Polaritas positif)", 1: "100%", 2: "90%", 3: "80%", 4: "70%", 5: "< 70%" },
      { Parameter: "Pencapaian Target (Polaritas negatif)", 1: "70%", 2: "80%", 3: "90%", 4: "100%", 5: "100%" },
      { Parameter: "Peningkatan piutang macet (DPD > 90)", 1: "1%", 2: "2%", 3: "3%", 4: "4%", 5: "> 4%" },
    ],
  },
  Reputation: {
    headers: ["Parameter", "1", "2", "3", "4", "5"],
    rows: [
      { Parameter: "Jenis Media dan Cakupannya", 1: "Forum kecil / Grup Telegram", 2: "Media Lokal / Media Cetak", 3: "Media Nasional / Berita Viral", 4: "Media Mainstream Internasional", 5: "Media Besar + Viral (FT, WSJ, BBC)" },
      {
        Parameter: "Pemberitaan Negatif",
        1: "Tidak terdapat pemberitaan negatif",
        2: "Terdapat pemberitaan negatif",
        3: "Terdapat pemberitaan negatif yang berdampak",
        4: "Terdapat pemberitaan negatif yang berdampak signifikan",
        5: "Terdapat pemberitaan negatif yang berdampak sangat signifikan",
      },
    ],
  },
  Legal: {
    headers: ["Parameter", "1", "2", "3", "4", "5"],
    rows: [
      {
        Parameter: "Legal Cases",
        1: "Tidak ada somasi/tuntutan hukum",
        2: "Perusahaan mendapat somasi",
        3: "Perusahaan mendapat tuntutan hukum",
        4: "Perusahaan diputuskan kalah di pengadilan tingkat pertama",
        5: "Perusahaan diputuskan kalah di pengadilan tingkat selanjutnya",
      },
      { Parameter: "Compliance Violations (Frekuensi)", 1: "0", 2: "1", 3: "2", 4: "3", 5: "> 3" },
    ],
  },
  HR: {
    headers: ["Parameter", "1", "2", "3", "4", "5"],
    rows: [
      { Parameter: "Turn Over Karyawan", 1: "≤ 5%", 2: "10%", 3: "15%", 4: "20%", 5: "> 20%" },
      { Parameter: "Keselamatan Kerja", 1: "Kasus Pertolongan Pertama", 2: "Kasus Perawatan Medis", 3: "Cacat tidak tetap/Absen terbatas", 4: "Kasus kematian tunggal/Cacat tetap", 5: "Kasus kematian jamak" },
      { Parameter: "Keluhan Karyawan", 1: "Diselesaikan oleh Pimpinan Unit", 2: "Perlu diselesaikan oleh HRD", 3: "Perlu diselesaikan oleh BOD", 4: "Unjuk rasa mengganggu", 5: "Unjuk rasa dengan pemberitaan negatif" },
    ],
  },
  Operational: {
    headers: ["Parameter", "1", "2", "3", "4", "5"],
    rows: [
      { Parameter: "Gangguan/Failure Layanan Akibat Siber", 1: "0", 2: "1", 3: "2", 4: "3", 5: ">3" },
      { Parameter: "Peretasan atau Kehilangan Data", 1: "Tidak ada", 2: "Data internal minor", 3: "Data sensitif ≤ 50 record", 4: "Data sensitif > 50 record", 5: "Data sensitif > 100 record" },
      { Parameter: "Gangguan Transaksi (Jam)", 1: "0.25", 2: "0.5", 3: "1", 4: "1.5", 5: ">1.5" },
      { Parameter: "Gangguan Non-Transaksi (Jam)", 1: "1", 2: "2", 3: "3", 4: "4" },
      { Parameter: "Pelanggaran SLA Operasional", 1: "1", 2: "2", 3: "3", 4: "4" },
      { Parameter: "Others", 1: "Tidak Signifikan", 2: "Kurang Signifikan", 3: "Cukup Signifikan", 4: "Signifikan", 5: "Sangat Signifikan" },
    ],
  },
};

function RiskCriteriaReference({ riskLimit }) {
  const [activeTab, setActiveTab] = useState("Financial");
  const formatNumber = (num) => (num ? new Intl.NumberFormat("id-ID").format(num) : "0");

  if (riskLimit) {
    impactTabsData.Financial.rows[1] = {
      Parameter: "Financial Loss",
      1: `≤ Rp ${formatNumber(riskLimit * 0.2)}`,
      2: `> Rp ${formatNumber(riskLimit * 0.2)}`,
      3: `> Rp ${formatNumber(riskLimit * 0.4)}`,
      4: `> Rp ${formatNumber(riskLimit * 0.6)}`,
      5: `> Rp ${formatNumber(riskLimit * 0.8)}`,
    };
  }

  const currentTabData = impactTabsData[activeTab];

  return (
    <Card className="rounded-xl shadow-lg">
      <Title>Risk Assessment Criteria Reference</Title>
      <Text>Standardized criteria for consistent risk evaluation.</Text>

      <div className="mt-6">
        <Title as="h3" className="text-lg">
          1. Likelihood Criteria
        </Title>
        <div className="overflow-x-auto mt-2">
          <Table className="min-w-[600px]">
            <TableHead>
              <TableRow>
                {/* === PERBAIKAN: Background color diubah menjadi bg-slate-100 === */}
                <TableHeaderCell rowSpan={2} className="align-bottom bg-slate-100">
                  Parameter
                </TableHeaderCell>
                <TableHeaderCell colSpan={5} className="text-center bg-slate-100">
                  Rating Scale
                </TableHeaderCell>
              </TableRow>
              <TableRow>
                <TableHeaderCell className={criteriaStyles.level1}>1</TableHeaderCell>
                <TableHeaderCell className={criteriaStyles.level2}>2</TableHeaderCell>
                <TableHeaderCell className={criteriaStyles.level3}>3</TableHeaderCell>
                <TableHeaderCell className={criteriaStyles.level4}>4</TableHeaderCell>
                <TableHeaderCell className={criteriaStyles.level5}>5</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* === PERBAIKAN: Ukuran font diubah menjadi text-xs === */}
              <TableRow>
                <TableCell className="font-medium text-xs">Qualitative</TableCell>
                <TableCell className="text-xs">Almost Never</TableCell>
                <TableCell className="text-xs">Unlikely</TableCell>
                <TableCell className="text-xs">Likely</TableCell>
                <TableCell className="text-xs">Very Likely</TableCell>
                <TableCell className="text-xs">Almost Certain</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-xs">Probability</TableCell>
                <TableCell className="text-xs">&lt; 20%</TableCell>
                <TableCell className="text-xs">20%-40%</TableCell>
                <TableCell className="text-xs">40%-60%</TableCell>
                <TableCell className="text-xs">60%-80%</TableCell>
                <TableCell className="text-xs">&ge; 80%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-xs">Frequency (Transaction)</TableCell>
                <TableCell className="text-xs">0-2x/year</TableCell>
                <TableCell className="text-xs">3-5x/year</TableCell>
                <TableCell className="text-xs">6-7x/year</TableCell>
                <TableCell className="text-xs">8-10x/year</TableCell>
                <TableCell className="text-xs">&gt;10x/year</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-xs">Period (Catastrophe)</TableCell>
                <TableCell className="text-xs">0-2x/50yrs</TableCell>
                <TableCell className="text-xs">3-5x/50yrs</TableCell>
                <TableCell className="text-xs">6-7x/50yrs</TableCell>
                <TableCell className="text-xs">8-10x/50yrs</TableCell>
                <TableCell className="text-xs">&gt;10x/50yrs</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-6">
        <Title as="h3" className="text-lg">
          2. Impact Criteria
        </Title>
        <Card className="mt-2 bg-slate-100">
          <Text>
            Risk Limit: <span className="font-semibold">Rp {formatNumber(riskLimit)}</span>
          </Text>
          <Text className="text-xs">Batas maksimal kerugian finansial yang dapat ditoleransi organisasi.</Text>
        </Card>
        <div className="mt-4 border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex min-w-max">
            {Object.keys(impactTabsData).map((tabName) => (
              <button
                key={tabName}
                className={`flex-1 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-center focus:outline-none ${
                  activeTab === tabName ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab(tabName)}
              >
                {tabName}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-3">
          <Title as="h4" className="text-md font-semibold">
            {activeTab} Impact
          </Title>
          <div className="overflow-x-auto mt-2">
            <Table className="min-w-[800px]">
              <TableHead>
                <TableRow>
                  <TableHeaderCell rowSpan={2} className="align-bottom bg-slate-100 w-[25%]">
                    Parameter
                  </TableHeaderCell>
                  <TableHeaderCell colSpan={5} className="text-center bg-slate-100">
                    Rating Scale
                  </TableHeaderCell>
                </TableRow>
                <TableRow>
                  {currentTabData.headers.slice(1).map((header) => (
                    <TableHeaderCell key={header} className={criteriaStyles[`level${header}`]}>
                      {header}
                    </TableHeaderCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {currentTabData.rows.map((row) => (
                  <TableRow key={row.Parameter}>
                    {currentTabData.headers.map((header) => (
                      <TableCell key={header} className={`text-xs whitespace-normal ${header === "Parameter" ? "font-medium" : "text-center"}`}>
                        {row[header]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Title as="h3" className="text-lg">
          3. Control Effectiveness Criteria
        </Title>
        <div className="overflow-x-auto mt-2">
          <Table className="min-w-[500px]">
            <TableHead>
              <TableRow>
                <TableHeaderCell rowSpan={2} className="align-bottom bg-slate-100">
                  Parameter
                </TableHeaderCell>
                <TableHeaderCell colSpan={3} className="text-center bg-slate-100">
                  Rating Scale
                </TableHeaderCell>
              </TableRow>
              <TableRow>
                <TableHeaderCell className={criteriaStyles.level1}>A</TableHeaderCell>
                <TableHeaderCell className={criteriaStyles.level3}>B</TableHeaderCell>
                <TableHeaderCell className={criteriaStyles.level5}>C</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-xs">Qualitative</TableCell>
                {/* === PERBAIKAN DI SINI === */}
                <TableCell className={`text-xs ${criteriaStyles.level1}`}>Fully Effective</TableCell>
                <TableCell className={`text-xs ${criteriaStyles.level3}`}>Partially Effective</TableCell>
                <TableCell className={`text-xs ${criteriaStyles.level5}`}>Not Effective</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}

export default RiskCriteriaReference;
