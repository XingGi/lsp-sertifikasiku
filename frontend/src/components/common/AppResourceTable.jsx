// frontend/src/components/common/AppResourceTable.jsx

import React from "react";
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Text, Flex, Icon } from "@tremor/react";
import { FiLoader, FiCheckCircle } from "react-icons/fi";

/**
 * Baris yang ditampilkan saat data sedang dimuat.
 */
const LoadingRow = ({ colSpan }) => (
  <TableRow>
    <TableCell colSpan={colSpan} className="text-center py-10">
      <Flex justifyContent="center" alignItems="center" className="space-x-2 text-tremor-content">
        <Icon icon={FiLoader} className="animate-spin" size="sm" />
        <Text>Memuat data...</Text>
      </Flex>
    </TableCell>
  </TableRow>
);

/**
 * Baris yang ditampilkan saat data kosong.
 */
const EmptyRow = ({ colSpan, message }) => (
  <TableRow>
    <TableCell colSpan={colSpan} className="text-center py-10">
      <Flex justifyContent="center" alignItems="center" className="space-x-2 text-tremor-content">
        <Icon icon={FiCheckCircle} size="sm" />
        <Text>{message || "Tidak ada data yang ditemukan."}</Text>
      </Flex>
    </TableCell>
  </TableRow>
);

/**
 * Komponen tabel generik yang menangani state loading,
 * state kosong, dan me-render data.
 *
 * @param {Object[]} data - Array data yang akan di-render.
 * @param {boolean} isLoading - Status loading dari useQuery.
 * @param {string} emptyMessage - Pesan yang ditampilkan saat data kosong.
 * @param {Object[]} columns - Konfigurasi kolom tabel.
 * - {string} key - Kunci unik untuk kolom.
 * - {string} header - Teks untuk TableHeaderCell.
 * - {function} cell - Fungsi (item) => JSX untuk me-render TableCell.
 * - {string} [className] - Class opsional for TableHeaderCell.
 * - {string} [cellClassName] - Class opsional for TableCell.
 */
function AppResourceTable({ data, isLoading, columns, emptyMessage }) {
  const colSpan = columns.length;

  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((col) => (
            <TableHeaderCell key={col.key} className={col.className}>
              {col.header}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {isLoading ? (
          <LoadingRow colSpan={colSpan} />
        ) : !data || data.length === 0 ? (
          <EmptyRow colSpan={colSpan} message={emptyMessage} />
        ) : (
          data.map((item) => (
            <TableRow key={item.id}>
              {columns.map((col) => (
                <TableCell key={col.key} className={col.cellClassName}>
                  {/* Ini adalah intinya: memanggil fungsi 'cell'
                      untuk setiap item dan setiap kolom */}
                  {col.cell(item)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export default AppResourceTable;
