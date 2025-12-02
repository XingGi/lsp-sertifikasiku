// frontend/src/features/risk-management/madya/components/StrukturOrganisasiTable.jsx
import React from "react";
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Text, Badge, Button } from "@tremor/react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

function StrukturOrganisasiTable({ data, onEdit, onDelete, readOnly = false }) {
  return (
    <Table>
      <TableHead>
        <TableRow className="text-md">
          <TableHeaderCell>No</TableHeaderCell>
          <TableHeaderCell>Direktorat</TableHeaderCell>
          <TableHeaderCell>Divisi</TableHeaderCell>
          <TableHeaderCell>Unit Kerja</TableHeaderCell>
          {!readOnly && <TableHeaderCell className="text-right">Aksi</TableHeaderCell>}
        </TableRow>
      </TableHead>
      <TableBody className="text-xs">
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.direktorat || "-"}</TableCell>
              <TableCell>{item.divisi || "-"}</TableCell>
              <TableCell>{item.unit_kerja || "-"}</TableCell>
              {/* <TableCell className="text-right">
                <Button icon={FiEdit2} variant="light" color="blue" onClick={() => onEdit(item)} className="mr-4">
                  Edit
                </Button>
                <Button icon={FiTrash2} variant="light" color="red" onClick={() => onDelete(item.id)}>
                  Hapus
                </Button>
              </TableCell> */}
              {!readOnly && (
                <TableCell className="text-right">
                  {/* Pastikan onEdit dan onDelete ada sebelum render tombol */}
                  {onEdit && <Button icon={FiEdit2} variant="light" color="blue" onClick={() => onEdit(item)} className="mr-4" />}
                  {onDelete && <Button icon={FiTrash2} variant="light" color="red" onClick={() => onDelete(item.id)} />}
                </TableCell>
              )}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={readOnly ? 4 : 5} className="text-center">
              <Text>Belum ada data struktur organisasi.</Text>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default StrukturOrganisasiTable;
