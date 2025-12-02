// frontend/src/features/risk-management/templates/TemplateListPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Title, Text, Button, Badge, Grid } from "@tremor/react";
import { FiPlus, FiShield, FiEdit, FiTrash2, FiEye, FiLoader, FiLayout, FiCheckCircle } from "react-icons/fi";
import apiClient from "../../../api/api";
import TemplateViewModal from "./components/TemplateViewModal";
import NotificationModal from "../../../components/common/NotificationModal";
import { useAuth } from "../../../context/AuthContext";

function TemplateListPage() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // State kontrol modal & loading
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [userLimits, setUserLimits] = useState(null);
  const [limitModal, setLimitModal] = useState({ isOpen: false, message: "" });

  const fetchTemplates = () => {
    setIsLoading(true);
    apiClient
      .get("/risk-maps")
      .then((response) => setTemplates(response.data))
      .catch((error) => console.error("Gagal memuat template:", error))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTemplates();
    apiClient
      .get("/account/details")
      .then((response) => setUserLimits(response.data.assessment_limits))
      .catch((err) => console.error("Gagal memuat limit user:", err));
  }, []);

  const handleViewClick = (templateId) => {
    setIsDetailLoading(true);
    setIsViewModalOpen(true);
    apiClient
      .get(`/risk-maps/${templateId}`)
      .then((response) => setViewingTemplate(response.data))
      .catch((error) => {
        console.error("Gagal memuat detail:", error);
        setIsViewModalOpen(false);
      })
      .finally(() => setIsDetailLoading(false));
  };

  const handleDeleteTemplate = async (templateId, templateName) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus template "${templateName}"?`)) {
      setIsDeleting(templateId);
      try {
        await apiClient.delete(`/risk-maps/${templateId}`);
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      } catch (error) {
        alert(`Gagal menghapus template: ${error.response?.data?.msg || "Terjadi kesalahan."}`);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleNewTemplateClick = () => {
    if (user && user.role === "Admin") {
      navigate("/risk-management/templates/new");
      return;
    }
    if (!userLimits) {
      alert("Sedang memuat data limit...");
      return;
    }
    const currentCount = templates.filter((t) => !t.is_default).length;
    const limit = userLimits.template_peta?.limit;

    if (limit !== null && currentCount >= limit) {
      setLimitModal({
        isOpen: true,
        message: `Batas pembuatan Template Peta Risiko kustom Anda telah tercapai (${currentCount}/${limit}). Hubungi admin untuk menambah kuota.`,
      });
    } else {
      navigate("/risk-management/templates/new");
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600 shadow-sm">
            <FiLayout size={28} />
          </div>
          <div>
            <Title className="text-2xl text-slate-800">Template Peta Risiko</Title>
            <Text className="text-slate-500">Atur matriks risiko kustom untuk standarisasi asesmen.</Text>
          </div>
        </div>
        <Button size="lg" icon={FiPlus} onClick={handleNewTemplateClick} disabled={isLoading || !userLimits} className="shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all rounded-xl">
          Buat Template Baru
        </Button>
      </div>

      {/* Content Grid */}
      <div className="mt-6">
        {isLoading ? (
          <div className="text-center py-20">
            <FiLoader className="animate-spin h-8 w-8 mx-auto text-gray-400" />
            <Text className="mt-2">Memuat template...</Text>
          </div>
        ) : (
          <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="flex flex-col hover:shadow-lg transition-all duration-200 border-t-4 border-t-indigo-500 group cursor-default h-full justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <Title className="text-lg font-bold text-slate-800 line-clamp-2" title={template.name}>
                      {template.name}
                    </Title>
                    {template.is_default ? (
                      <Badge icon={FiShield} className="rounded-md px-2 py-1" color="blue" size="xs">
                        Default
                      </Badge>
                    ) : (
                      <div className="p-1.5 bg-indigo-50 rounded text-indigo-600">
                        <FiLayout size={16} />
                      </div>
                    )}
                  </div>

                  <Text className="text-sm text-gray-500 line-clamp-3 mb-4 min-h-[3rem]">{template.description || "Tidak ada deskripsi tersedia."}</Text>
                </div>

                <div className="pt-4 mt-auto border-t border-gray-100 flex justify-end gap-2 opacity-90 hover:opacity-100 transition-opacity">
                  <Button size="xs" variant="secondary" className="rounded-md" icon={FiEye} onClick={() => handleViewClick(template.id)} title="Lihat Detail">
                    Lihat
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    className="rounded-md"
                    icon={FiEdit}
                    disabled={template.is_default}
                    onClick={() => navigate(`/risk-management/templates/edit/${template.id}`)}
                    title={template.is_default ? "Template default tidak dapat diedit" : "Edit Template"}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    color="rose"
                    icon={FiTrash2}
                    disabled={template.is_default || isDeleting === template.id}
                    loading={isDeleting === template.id}
                    onClick={() => handleDeleteTemplate(template.id, template.name)}
                    title="Hapus Template"
                  />
                </div>
              </Card>
            ))}

            {/* Empty State jika tidak ada template */}
            {templates.length === 0 && (
              <div className="col-span-full text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                <Text>Belum ada template yang dibuat.</Text>
              </div>
            )}
          </Grid>
        )}
      </div>

      <TemplateViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} templateData={isDetailLoading ? null : viewingTemplate} />
      <NotificationModal isOpen={limitModal.isOpen} onClose={() => setLimitModal({ isOpen: false, message: "" })} title="Batas Kuota Tercapai" message={limitModal.message} />
    </div>
  );
}

export default TemplateListPage;
