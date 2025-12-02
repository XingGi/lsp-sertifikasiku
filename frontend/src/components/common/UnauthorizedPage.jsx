// frontend/src/components/common/UnauthorizedPage.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Title, Text, Button } from "@tremor/react";
import { FiLock, FiArrowLeft, FiHardDrive, FiXCircle } from "react-icons/fi"; // Tambah FiHardDrive, FiXCircle
import { motion } from "framer-motion"; // Untuk animasi yang modern dan elegan

function UnauthorizedPage() {
  const navigate = useNavigate();

  // Animasi untuk elemen Card
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // Animasi untuk ikon
  const iconVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2, ease: "easeOut" } },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <motion.div initial="hidden" animate="visible" variants={cardVariants}>
        <Card className="max-w-md w-full text-center p-8 shadow-2xl rounded-xl border border-blue-200">
          <motion.div initial="hidden" animate="visible" variants={iconVariants} className="mx-auto w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6 shadow-md">
            <FiXCircle className="w-10 h-10 text-blue-600" /> {/* Ikon XCircle untuk 'akses ditolak' */}
          </motion.div>

          <Title className="text-3xl font-bold text-blue-800 mb-3">Akses Ditolak, Rekan Digital!</Title>
          <Text className="mt-2 text-lg text-gray-700 leading-relaxed">Sepertinya Anda mencoba mengakses area yang dijaga ketat oleh sistem kami. Ini bukan karena kami pelit, tetapi demi menjaga data Anda tetap aman.</Text>
          <Text className="mt-4 text-md text-gray-600 leading-relaxed">
            Setiap hak akses disesuaikan dengan peran Anda di sistem. Jika Anda yakin ini adalah kekeliruan, silakan hubungi administrator yang bertugas (mungkin mereka sedang ngopi).
          </Text>

          <Button
            icon={FiArrowLeft}
            onClick={() => navigate("/dashboard")}
            className="mt-8 w-full sm:w-auto px-6 py-3 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            color="blue" // Ganti warna tombol agar lebih match
            size="xl" // Ukuran tombol lebih besar
          >
            Kembali ke Dashboard
          </Button>

          <div className="mt-8 text-sm text-gray-400">
            <FiHardDrive className="inline-block mr-2 text-gray-500" />
            SIRICO Secure System - Integrity First
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default UnauthorizedPage;
