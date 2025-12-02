// frontend/src/features/risk-management/madya/components/StrukturOrganisasiCard.jsx
import React, { useState, useRef } from "react";
import { Card, Title, Text, Button } from "@tremor/react";
import { FiPlus, FiUpload, FiImage, FiTrash2, FiLoader, FiEye, FiLayers } from "react-icons/fi";
import StrukturOrganisasiTable from "./StrukturOrganisasiTable";
import StrukturOrganisasiFormModal from "./StrukturOrganisasiFormModal";
import ImageViewModal from "./ImageViewModal";
import apiClient from "../../../../api/api";
import { toast } from "sonner";

const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function StrukturOrganisasiCard({ assessmentId, initialData, initialImageUrl, onDataChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const entries = initialData;
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const API_BASE_URL_FOR_IMAGE = apiClient.defaults.baseURL;
  const [editingEntry, setEditingEntry] = useState(null);

  const handleSaveEntry = (savedEntry, isUpdate) => {
    let updatedEntries;
    if (isUpdate) {
      updatedEntries = entries.map((entry) => (entry.id === savedEntry.id ? savedEntry : entry));
    } else {
      updatedEntries = [...entries, savedEntry];
    }
    onDataChange(updatedEntries);
    setEditingEntry(null);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm("Anda yakin ingin menghapus data struktur ini?")) {
      try {
        await apiClient.delete(`/structure-entries/${entryId}`);
        const updatedEntries = entries.filter((entry) => entry.id !== entryId);
        onDataChange(updatedEntries);
        toast.success("Data berhasil dihapus.");
      } catch (error) {
        toast.error("Gagal menghapus data: " + (error.response?.data?.msg || "Error"));
      }
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(`Ukuran file melebihi batas ${MAX_FILE_SIZE_MB}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadError("");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("struktur_organisasi_image", file);

    try {
      const response = await apiClient.post(`/madya-assessments/${assessmentId}/structure-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(response.data.image_url);
      toast.success(response.data.msg);
    } catch (error) {
      setUploadError(error.response?.data?.msg || "Gagal mengupload gambar.");
      toast.error("Gagal upload gambar");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleDeleteImage = async () => {
    if (window.confirm("Hapus gambar struktur organisasi?")) {
      setIsUploading(true);
      setUploadError("");
      try {
        await apiClient.delete(`/madya-assessments/${assessmentId}/structure-image`);
        setImageUrl(null);
        toast.success("Gambar berhasil dihapus.");
      } catch (error) {
        setUploadError(error.response?.data?.msg || "Gagal menghapus gambar.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <>
      <Card className="border-l-4 border-blue-500 shadow-md ring-1 ring-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <FiLayers size={24} />
            </div>
            <div>
              <Title>1. Struktur Organisasi</Title>
              <Text>Definisikan struktur organisasi dan upload gambar (opsional).</Text>
            </div>
          </div>
          <Button
            icon={FiPlus}
            onClick={() => {
              setEditingEntry(null);
              setIsModalOpen(true);
            }}
            variant="secondary"
            color="blue"
            className="rounded-md w-full sm:w-auto"
          >
            Tambah Data
          </Button>
        </div>

        {/* Bagian Upload Gambar */}
        <Card className="bg-slate-50 p-4 border border-slate-200 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-md border border-slate-200 text-slate-500">
                <FiImage size={20} />
              </div>
              <div>
                <Text className="font-medium text-slate-700">Gambar Struktur Organisasi</Text>
                <Text className="text-xs text-slate-500">Opsional, Max {MAX_FILE_SIZE_MB}MB</Text>
              </div>
              {isUploading && <FiLoader className="animate-spin text-blue-500 ml-2" />}
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              {imageUrl && (
                <>
                  <Button icon={FiEye} variant="secondary" onClick={() => setIsImageModalOpen(true)} size="xs">
                    Lihat
                  </Button>
                  <Button icon={FiTrash2} variant="light" color="red" onClick={handleDeleteImage} size="xs" disabled={isUploading}>
                    Hapus
                  </Button>
                </>
              )}
              <Button icon={FiUpload} onClick={triggerFileInput} disabled={isUploading} size="xs" variant="secondary">
                {imageUrl ? "Ganti Gambar" : "Upload Gambar"}
              </Button>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          {uploadError && <Text className="text-red-500 mt-2 text-sm">{uploadError}</Text>}
        </Card>

        {/* Tabel Data */}
        <StrukturOrganisasiTable data={entries} onEdit={handleEditEntry} onDelete={handleDeleteEntry} />
      </Card>

      <StrukturOrganisasiFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
        }}
        assessmentId={assessmentId}
        onSaveSuccess={handleSaveEntry}
        initialData={editingEntry}
      />
      <ImageViewModal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} imageUrl={imageUrl ? `${API_BASE_URL_FOR_IMAGE.replace("/api", "")}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}` : null} />
    </>
  );
}

export default StrukturOrganisasiCard;
