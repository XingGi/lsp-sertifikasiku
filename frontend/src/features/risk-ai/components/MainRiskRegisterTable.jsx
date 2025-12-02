// frontend/src/features/risk-ai/components/MainRiskRegisterTable.jsx

import React from "react";
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge, Switch, Button, Text } from "@tremor/react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

// Helper functions
const getLevelInfo = (likelihood, impact) => {
  const score = (likelihood || 0) * (impact || 0);
  if (score >= 15) return { text: "5 - High", color: "bg-red-500 text-white" };
  if (score >= 8) return { text: "4 - Moderate to High", color: "bg-orange-400 text-black" };
  if (score >= 4) return { text: "3 - Moderate", color: "bg-yellow-300 text-black" };
  if (score >= 2) return { text: "2 - Low to Moderate", color: "bg-lime-300 text-black" };
  return { text: "1 - Low", color: "bg-green-300 text-black" };
};

const RISK_TYPE_MAP = {
  RP: "Risiko Pasar",
  RK: "Risiko Kepatuhan",
  RO: "Risiko Operasional",
  RR: "Risiko Reputasi",
  "N/A": "Tidak Diketahui",
};

function MainRiskRegisterTable({ risks, selectedRisks, onSelectRow, onEdit, onDelete, isAllSelected, onSelectAll }) {
  return (
    <Table className="min-w-[3000px]">
      <TableHead>
        <TableRow className="bg-blue-900 text-white border-b border-blue-800">
          {/* Sticky Columns Header */}
          <TableHeaderCell className="sticky left-0 z-20 w-12 bg-blue-900 text-center">
            <div className="flex justify-center">
              <Switch id="selectAllSwitch" checked={isAllSelected} onChange={onSelectAll} color="blue" />
            </div>
          </TableHeaderCell>
          <TableHeaderCell className="sticky left-12 z-20 w-12 bg-blue-900 text-xs text-center border-l border-blue-800">No</TableHeaderCell>
          <TableHeaderCell className="sticky left-24 z-20 w-64 bg-blue-900 text-xs border-l border-blue-800">Title & Actions</TableHeaderCell>

          {/* Scrollable Columns Header */}
          <TableHeaderCell className="text-xs w-28">Risk Code</TableHeaderCell>
          <TableHeaderCell className="text-xs w-64">Objective</TableHeaderCell>
          <TableHeaderCell className="text-xs w-32">Risk Type</TableHeaderCell>
          <TableHeaderCell className="text-xs w-72">Risk Description</TableHeaderCell>
          <TableHeaderCell className="text-xs w-64">Potential Cause</TableHeaderCell>
          <TableHeaderCell className="text-xs w-64">Potential Impact</TableHeaderCell>
          <TableHeaderCell className="text-xs w-64">Existing Control</TableHeaderCell>
          <TableHeaderCell className="text-xs w-32">Control Effectiveness</TableHeaderCell>
          <TableHeaderCell className="text-xs w-16 text-center">Prob</TableHeaderCell>
          <TableHeaderCell className="text-xs w-16 text-center">Impact</TableHeaderCell>
          <TableHeaderCell className="text-xs w-32 text-center">Risk Level</TableHeaderCell>
          <TableHeaderCell className="text-xs w-32">Treatment</TableHeaderCell>
          <TableHeaderCell className="text-xs w-80">Mitigation Plan</TableHeaderCell>
          <TableHeaderCell className="text-xs w-16 text-center">Res. Prob</TableHeaderCell>
          <TableHeaderCell className="text-xs w-16 text-center">Res. Imp</TableHeaderCell>
          <TableHeaderCell className="text-xs w-32 text-center">Residual Level</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {risks.map((risk, index) => {
          const inherentRisk = getLevelInfo(risk.inherent_likelihood, risk.inherent_impact);
          const residualRisk = getLevelInfo(risk.residual_likelihood, risk.residual_impact);
          const riskTypeFullName = RISK_TYPE_MAP[risk.risk_type] || risk.risk_type;
          const isSelected = selectedRisks.includes(risk.id);

          return (
            <TableRow key={risk.id} className={`hover:bg-blue-50/50 transition-colors ${isSelected ? "bg-blue-50" : ""}`}>
              {/* Sticky Columns Body */}
              <TableCell className={`sticky left-0 z-10 text-center border-r border-gray-100 ${isSelected ? "bg-blue-50" : "bg-white group-hover:bg-blue-50"}`}>
                <div className="flex justify-center">
                  <Switch checked={isSelected} onChange={() => onSelectRow(risk.id)} />
                </div>
              </TableCell>
              <TableCell className={`sticky left-12 z-10 text-center border-r border-gray-100 text-xs font-medium text-slate-500 ${isSelected ? "bg-blue-50" : "bg-white group-hover:bg-blue-50"}`}>{index + 1}</TableCell>
              <TableCell className={`sticky left-24 z-10 border-r border-gray-100 ${isSelected ? "bg-blue-50" : "bg-white group-hover:bg-blue-50"}`}>
                <div className="flex flex-col gap-2">
                  <Text className="font-bold text-slate-700 text-xs line-clamp-2" title={risk.title}>
                    {risk.title || "Untitled Risk"}
                  </Text>
                  <div className="flex gap-3">
                    <Button variant="light" size="xs" icon={FiEdit2} onClick={() => onEdit(risk)} color="indigo">
                      Edit
                    </Button>
                    <Button variant="light" size="xs" icon={FiTrash2} color="rose" onClick={() => onDelete(risk.id)}>
                      Hapus
                    </Button>
                  </div>
                </div>
              </TableCell>

              {/* Scrollable Columns Body */}
              <TableCell className="text-xs align-top font-mono text-slate-500">{risk.kode_risiko}</TableCell>
              <TableCell className="text-xs align-top whitespace-normal">{risk.objective}</TableCell>
              <TableCell className="align-top">
                <Badge size="xs" className="rounded-md" color="cyan">
                  {riskTypeFullName}
                </Badge>
              </TableCell>
              <TableCell className="text-xs align-top whitespace-normal">{risk.deskripsi_risiko}</TableCell>
              <TableCell className="text-xs align-top whitespace-normal text-gray-500">{risk.risk_causes}</TableCell>
              <TableCell className="text-xs align-top whitespace-normal text-gray-500">{risk.risk_impacts}</TableCell>
              <TableCell className="text-xs align-top whitespace-normal text-gray-500">{risk.existing_controls}</TableCell>
              <TableCell className="text-xs align-top">{risk.control_effectiveness}</TableCell>

              {/* Inherent Score */}
              <TableCell className="text-center align-top text-xs font-semibold">{risk.inherent_likelihood}</TableCell>
              <TableCell className="text-center align-top text-xs font-semibold">{risk.inherent_impact}</TableCell>
              <TableCell className="text-center align-top">
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${inherentRisk.color} inline-block w-full`}>{inherentRisk.text}</span>
              </TableCell>

              <TableCell className="text-xs align-top">
                <Badge size="xs" className="rounded-md" color="slate">
                  {risk.treatment_option || "-"}
                </Badge>
              </TableCell>
              <TableCell className="text-xs align-top whitespace-normal text-gray-500">{risk.mitigation_plan}</TableCell>

              {/* Residual Score */}
              <TableCell className="text-center align-top text-xs font-semibold">{risk.residual_likelihood}</TableCell>
              <TableCell className="text-center align-top text-xs font-semibold">{risk.residual_impact}</TableCell>
              <TableCell className="text-center align-top">
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${residualRisk.color} inline-block w-full`}>{residualRisk.text}</span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default MainRiskRegisterTable;
