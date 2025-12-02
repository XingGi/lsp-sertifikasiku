import React from "react";
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge, Switch, Button } from "@tremor/react";
import { FiEdit2 } from "react-icons/fi";

const getLevelInfo = (likelihood, impact) => {
  const level = (likelihood || 0) * (impact || 0);
  if (level >= 15) return { text: "5 - High", color: "bg-red-500 text-white" };
  if (level >= 8) return { text: "4 - Moderate to High", color: "bg-orange-400 text-black" };
  if (level >= 4) return { text: "3 - Moderate", color: "bg-yellow-300 text-black" };
  if (level >= 2) return { text: "2 - Low to Moderate", color: "bg-lime-300 text-black" };
  return { text: "1 - Low", color: "bg-green-300 text-black" };
};

const RISK_TYPE_MAP = {
  RP: "Risiko Pasar",
  RK: "Risiko Kepatuhan",
  RO: "Risiko Operasional",
  RR: "Risiko Reputasi",
  "N/A": "Tidak Diketahui",
};

function RiskResultsTable({ risks, selectedRisks, onRowSelect, onEditClick }) {
  return (
    <Table className="min-w-[3000px]">
      <TableHead>
        <TableRow className="bg-blue-900 text-white">
          <TableHeaderCell className="sticky left-0 z-20 w-12 text-xs"></TableHeaderCell>
          <TableHeaderCell className="sticky left-12 z-20 w-12 text-xs">No</TableHeaderCell>
          <TableHeaderCell className="sticky left-24 z-20 w-28 text-xs">Risk Code</TableHeaderCell>
          <TableHeaderCell className="text-xs w-64">Objective</TableHeaderCell>
          <TableHeaderCell className="text-xs">Risk Type</TableHeaderCell>
          <TableHeaderCell className="text-xs w-72">Risk Description</TableHeaderCell>
          <TableHeaderCell className="text-xs w-64">Potential Cause</TableHeaderCell>
          <TableHeaderCell className="text-xs w-64">Potential Impact</TableHeaderCell>
          <TableHeaderCell className="text-xs w-64">Existing Control</TableHeaderCell>
          <TableHeaderCell className="text-xs">Control Effectiveness</TableHeaderCell>
          <TableHeaderCell className="text-xs">Likelihood</TableHeaderCell>
          <TableHeaderCell className="text-xs">Impact</TableHeaderCell>
          <TableHeaderCell className="text-xs">Risk Level</TableHeaderCell>
          <TableHeaderCell className="text-xs">Treatment Option</TableHeaderCell>
          <TableHeaderCell className="text-xs w-80">Mitigation Plan</TableHeaderCell>
          <TableHeaderCell className="text-xs">Residual Likelihood (Target)</TableHeaderCell>
          <TableHeaderCell className="text-xs">Residual Impact (Target)</TableHeaderCell>
          <TableHeaderCell className="text-xs">Residual Risk Level (Target)</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {risks?.map((risk, index) => {
          const inherentRisk = getLevelInfo(risk.inherent_likelihood, risk.inherent_impact);
          const residualRisk = getLevelInfo(risk.residual_likelihood, risk.residual_impact);
          const isSelected = selectedRisks.includes(risk.id);
          const riskTypeFullName = RISK_TYPE_MAP[risk.risk_type] || risk.risk_type;

          return (
            <TableRow key={risk.id} className={`[&>td]:p-2 ${isSelected ? "bg-blue-50" : ""}`}>
              <TableCell className="sticky left-0 bg-white z-10 text-center">
                <Switch checked={isSelected} onChange={() => onRowSelect(risk.id)} />
              </TableCell>
              <TableCell className="sticky left-12 bg-white z-10 font-medium text-xs text-center">{index + 1}</TableCell>
              <TableCell className="sticky left-24 bg-white z-10 text-xs">{risk.kode_risiko}</TableCell>
              <TableCell className="text-xs whitespace-normal">
                {risk.objective}
                <div className="mt-1">
                  <Button variant="light" size="xs" icon={FiEdit2} onClick={() => onEditClick(risk)}>
                    Edit
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge color="cyan" className="rounded-md">
                  {riskTypeFullName}
                </Badge>
              </TableCell>
              <TableCell className="text-xs whitespace-normal">{risk.deskripsi_risiko}</TableCell>
              <TableCell className="text-xs whitespace-normal">{risk.risk_causes}</TableCell>
              <TableCell className="text-xs whitespace-normal">{risk.risk_impacts}</TableCell>
              <TableCell className="text-xs whitespace-normal">{risk.existing_controls}</TableCell>
              <TableCell className="text-xs text-center">{risk.control_effectiveness}</TableCell>
              <TableCell className={`text-center font-semibold text-xs ${inherentRisk.color}`}>{risk.inherent_likelihood}</TableCell>
              <TableCell className={`text-center font-semibold text-xs ${inherentRisk.color}`}>{risk.inherent_impact}</TableCell>
              <TableCell className={`text-center font-semibold text-xs ${inherentRisk.color}`}>{inherentRisk.text}</TableCell>
              <TableCell className="text-xs">Reduce</TableCell>
              <TableCell className="text-xs whitespace-normal">{risk.mitigation_plan}</TableCell>
              <TableCell className={`text-center font-semibold text-xs ${residualRisk.color}`}>{risk.residual_likelihood}</TableCell>
              <TableCell className={`text-center font-semibold text-xs ${residualRisk.color}`}>{risk.residual_impact}</TableCell>
              <TableCell className={`text-center font-semibold text-xs ${residualRisk.color}`}>{residualRisk.text}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default RiskResultsTable;
