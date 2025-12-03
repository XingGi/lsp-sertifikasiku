// frontend/src/features/uji-kompetensi/UjiKompetensiStudioPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Title, Text, Button, Badge } from "@tremor/react";
import { FiArrowLeft, FiSave, FiCpu, FiLayers } from "react-icons/fi";
import apiClient from "../../api/api";
import { toast } from "sonner";

function UjiKompetensiStudioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API endpoint English
    apiClient
      .get(`/competency-tests/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        toast.error("Gagal memuat detail uji kompetensi");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10 text-center text-gray-500">Memuat Studio...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <Button variant="light" icon={FiArrowLeft} onClick={() => navigate("/uji-kompetensi")} />

          <div>
            {/* Judul Kegiatan */}
            <Title className="text-xl text-slate-800">{data?.title}</Title>

            {/* Meta Info Bar (ID, Skema, Status) */}
            <div className="flex items-center gap-3 text-xs mt-1.5">
              {/* Badge ID */}
              <span className="font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">ID: {data?.id}</span>

              {/* Badge Skema (Penting!) */}
              <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded border border-indigo-100 font-medium">
                <FiLayers className="w-3.5 h-3.5" />
                <span>{data?.scheme_name || "Memuat Skema..."}</span>
              </div>

              {/* Badge Status */}
              <Badge size="xs" color={data?.status === "DRAFT" ? "gray" : "emerald"}>
                {data?.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => toast.info("Simpan logic nanti")}>
            Simpan Draft
          </Button>
          <Button icon={FiCpu}>Generate Soal (AI)</Button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="grid grid-cols-12 gap-6 flex-1">
        <div className="col-span-3">
          <Card className="h-full border-l-4 border-indigo-500">
            <Title>Struktur Uji</Title>
            <Text className="mt-2 text-sm text-gray-500">
              Konfigurasi skema dan unit kompetensi untuk <strong>{data?.scheme_name}</strong>.
            </Text>
          </Card>
        </div>

        <div className="col-span-9">
          <Card className="h-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50/50">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
              <FiCpu size={32} className="text-indigo-400" />
            </div>
            <Title className="text-gray-500">Area Kerja Studio</Title>
            <Text className="text-gray-400 max-w-md text-center mt-2">Siap untuk integrasi Form Builder / RJSF.</Text>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default UjiKompetensiStudioPage;
