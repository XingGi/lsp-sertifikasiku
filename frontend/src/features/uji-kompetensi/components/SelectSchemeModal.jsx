// frontend/src/features/uji-kompetensi/components/SelectSchemeModal.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogPanel, Title, Text, Grid, Card, Badge, Button } from "@tremor/react";
import { FiCheckCircle, FiLayers, FiSearch, FiX, FiLoader, FiUser } from "react-icons/fi";
import apiClient from "../../../api/api";
import { useAuth } from "../../../context/AuthContext";
import ConfirmationAgreement from "../../../components/common/ConfirmationAgreement";

export default function SelectSchemeModal({ isOpen, onClose, onSelect }) {
  const { user } = useAuth(); // Ambil data user yang lagi login
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmState, setConfirmState] = useState({ isOpen: false, scheme: null });

  // Fetch Data pas Modal Dibuka
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      apiClient
        .get("/master/schemes?per_page=1000")
        .then((res) => {
          setSchemes(res.data.data || []);
        })
        .catch((err) => {
          console.error(err);
          setSchemes([]);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Filter Search Client-side
  const filtered = useMemo(() => {
    if (!schemes) return [];
    return schemes.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));
  }, [schemes, search]);

  const handleCardClick = (scheme) => {
    setConfirmState({ isOpen: true, scheme: scheme });
  };

  // 2. Handler saat User klik "Ya, Lanjutkan" di Dialog Konfirmasi
  const handleConfirmProceed = () => {
    const scheme = confirmState.scheme;
    if (!scheme) return;

    const userName = user?.nama_lengkap || "Asesi";
    const dateStr = new Date().toLocaleDateString("id-ID");
    const autoTitle = `${scheme.title} - ${userName}`;

    onSelect(scheme.id, autoTitle);
    setConfirmState({ isOpen: false, scheme: null });
  };

  return (
    <>
      {/* Modal Utama (Daftar Skema) */}
      <Dialog open={isOpen} onClose={onClose} static={true} className="z-[50]">
        <DialogPanel className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-slate-50 shadow-2xl">
          {/* HEADER */}
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-blue-600 flex justify-between items-start flex-shrink-0 text-white relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FiLayers size={24} />
                </div>
                <Title className="text-white text-2xl font-bold tracking-tight">Pilih Skema Sertifikasi</Title>
              </div>
              <Text className="text-indigo-100 opacity-90 ml-1">Klik pada kartu skema untuk memulai uji kompetensi baru.</Text>
            </div>
            <button onClick={onClose} className="relative z-10 text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors">
              <FiX size={24} />
            </button>
          </div>

          {/* SEARCH */}
          <div className="p-6 bg-white border-b border-gray-100 flex-shrink-0 z-10">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-all outline-none text-gray-700"
                placeholder="Cari nama skema..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* GRID CONTENT */}
          <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                <FiLoader className="animate-spin text-indigo-500" size={32} />
                <p>Memuat daftar skema...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p>Skema tidak ditemukan.</p>
              </div>
            ) : (
              <Grid numItemsMd={2} className="gap-4">
                {filtered.map((scheme) => (
                  <Card
                    key={scheme.id}
                    // Ubah onClick ke handleCardClick
                    onClick={() => handleCardClick(scheme)}
                    className="cursor-pointer border-2 border-transparent hover:border-indigo-500 hover:shadow-xl transition-all group flex flex-col relative overflow-hidden bg-white"
                  >
                    <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <Badge icon={FiLayers} size="xs" color="blue" className="font-mono px-3 py-1 rounded-md">
                          {scheme.code || "SKEMA"}
                        </Badge>
                        <Badge className="font-mono px-3 py-1 rounded-md" color="slate" size="xs">
                          {scheme.unit_count} Unit
                        </Badge>
                      </div>

                      <h3 className="font-bold text-slate-800 group-hover:text-indigo-700 text-lg mb-2 line-clamp-2 leading-snug">{scheme.title}</h3>

                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{scheme.description || "Tidak ada deskripsi tersedia untuk skema ini."}</p>

                      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <FiUser />
                          <span className="truncate max-w-[150px]">{user?.nama_lengkap}</span>
                        </div>
                        <span className="text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-lg shadow-md shadow-indigo-200 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1">
                          Pilih <FiCheckCircle />
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </Grid>
            )}
          </div>

          {/* FOOTER */}
          <div className="p-4 bg-white border-t border-gray-200 text-center text-xs text-gray-400">Menampilkan {filtered.length} skema sertifikasi tersedia.</div>
        </DialogPanel>
      </Dialog>

      <ConfirmationAgreement
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, scheme: null })}
        onConfirm={handleConfirmProceed}
        title="Konfirmasi Pilihan Skema"
        message={
          <span>
            Anda akan memulai sesi asesmen untuk skema:
            <br />
            <strong className="text-indigo-600 block mt-2 text-lg font-bold bg-indigo-50 p-2 rounded-lg border border-indigo-100">{confirmState.scheme?.title}</strong>
            <br />
            <span className="text-xs text-gray-500">Sistem akan otomatis membuat lembar kerja baru untuk Anda.</span>
          </span>
        }
        confirmText="Ya, Mulai Sekarang"
        cancelText="Batal"
      />
    </>
  );
}
