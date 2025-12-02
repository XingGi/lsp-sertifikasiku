// frontend/src/utils/formatters.js

/**
 * Memformat string tanggal (termasuk ISO string atau YYYY-MM-DD)
 * menjadi format tanggal Indonesia yang mudah dibaca.
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  let date;
  // Cek apakah string sudah berisi 'T' (penanda waktu/ISO string)
  if (dateString.includes("T")) {
    // Jika YA (cth: "2025-11-18T10:30:00")
    date = new Date(dateString);
  } else {
    // Jika TIDAK (cth: "2025-11-20")
    // Tambahkan "T00:00:00" agar diparse sebagai WAKTU LOKAL
    date = new Date(dateString + "T00:00:00");
  }

  if (isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Mengembalikan warna badge Tremor berdasarkan status siklus RSCA
 * atau status tugas mitigasi.
 */
export const getStatusColor = (status) => {
  // Untuk status mitigasi
  if (status === "Selesai") return "green";
  if (status === "Sedang Dikerjakan") return "blue";
  if (status === "Belum Mulai") return "gray";

  // Untuk status siklus (fallback)
  if (status === "Draft" || status === "Berjalan") return "blue";
  return "gray";
};

/**
 * Mengembalikan warna badge Tremor berdasarkan status Ajuan Risiko.
 */
export const getStatusBadgeColor = (status) => {
  if (status === "Disetujui") return "green";
  if (status === "Ditolak") return "red";
  if (status === "Menunggu Persetujuan") return "amber";
  return "gray";
};

/**
 * Mengonversi objek Date JavaScript menjadi string format YYYY-MM-DD
 * untuk dikirim ke API (menghindari bug zona waktu UTC).
 */
export const toLocalISODate = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`; // Format YYYY-MM-DD
};
