// frontend/src/features/risk-management/templates/TemplateEditorPage.jsx
import React, { useState, useEffect } from "react";
import { Card, Title, Text, Button, TextInput, Textarea, Grid, NumberInput, Badge } from "@tremor/react";
import { FiSave, FiPlus, FiTrash2, FiArrowLeft, FiInfo, FiGrid, FiTag, FiList, FiLoader } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../api/api";
import { toast } from "sonner";

// Komponen untuk satu sel di matriks
const MatrixCellInput = ({ likelihood, impact, score, color, onScoreChange }) => (
  <div className="h-14 w-full rounded-md flex items-center justify-center p-1 shadow-sm border border-gray-200 transition-all hover:scale-105" style={{ backgroundColor: color || "#f3f4f6" }} title={`Prob: ${likelihood}, Dampak: ${impact}`}>
    <input type="number" value={score} onChange={(e) => onScoreChange(likelihood, impact, parseInt(e.target.value) || 0)} className="w-full h-full bg-transparent text-center font-bold text-gray-800 focus:outline-none text-lg" />
  </div>
);

const generateInitialState = () => {
  const scores = [];
  for (let l = 1; l <= 5; l++) {
    for (let i = 1; i <= 5; i++) {
      scores.push({ likelihood_level: l, impact_level: i, score: l * i });
    }
  }
  return {
    name: "",
    description: "",
    likelihood_labels: [
      { level: 5, label: "Hampir Pasti Terjadi" },
      { level: 4, label: "Sangat Mungkin Terjadi" },
      { level: 3, label: "Bisa Terjadi" },
      { level: 2, label: "Jarang Terjadi" },
      { level: 1, label: "Sangat Jarang Terjadi" },
    ],
    impact_labels: [
      { level: 1, label: "Sangat Rendah" },
      { level: 2, label: "Rendah" },
      { level: 3, label: "Moderat" },
      { level: 4, label: "Tinggi" },
      { level: 5, label: "Sangat Tinggi" },
    ],
    level_definitions: [
      { level_name: "Sangat Rendah", color_hex: "#00B050", min_score: 1, max_score: 2 },
      { level_name: "Rendah", color_hex: "#92D050", min_score: 3, max_score: 6 },
      { level_name: "Moderat", color_hex: "#FFFF00", min_score: 7, max_score: 12 },
      { level_name: "Tinggi", color_hex: "#FFC000", min_score: 13, max_score: 19 },
      { level_name: "Sangat Tinggi", color_hex: "#FF0000", min_score: 20, max_score: 25 },
    ],
    scores: scores,
  };
};

function TemplateEditorPage() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const isEditMode = Boolean(templateId);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [template, setTemplate] = useState(generateInitialState());

  useEffect(() => {
    if (isEditMode) {
      setIsLoading(true);
      apiClient
        .get(`/risk-maps/${templateId}`)
        .then((response) => {
          if (!response.data.scores || response.data.scores.length === 0) {
            response.data.scores = generateInitialState().scores;
          }
          setTemplate(response.data);
        })
        .catch((error) => {
          console.error("Gagal memuat data template:", error);
          toast.error("Gagal memuat template.");
          navigate("/risk-management/templates");
        })
        .finally(() => setIsLoading(false));
    }
  }, [templateId, isEditMode, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemplate((prev) => ({ ...prev, [name]: value }));
  };

  const handleLabelChange = (type, level, value) => {
    setTemplate((prev) => ({
      ...prev,
      [type]: prev[type].map((item) => (item.level === level ? { ...item, label: value } : item)),
    }));
  };

  const handleScoreChange = (likelihood, impact, newScore) => {
    setTemplate((prev) => ({
      ...prev,
      scores: prev.scores.map((s) => (s.likelihood_level === likelihood && s.impact_level === impact ? { ...s, score: newScore } : s)),
    }));
  };

  const handleDefinitionChange = (index, field, value) => {
    setTemplate((prev) => ({
      ...prev,
      level_definitions: prev.level_definitions.map((def, i) => (i === index ? { ...def, [field]: value } : def)),
    }));
  };

  const addLevelDefinition = () => {
    setTemplate((prev) => ({
      ...prev,
      level_definitions: [...prev.level_definitions, { level_name: "", color_hex: "#cccccc", min_score: 0, max_score: 0 }],
    }));
  };

  const removeLevelDefinition = (indexToRemove) => {
    setTemplate((prev) => ({
      ...prev,
      level_definitions: prev.level_definitions.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSaveTemplate = async () => {
    if (!template.name.trim()) return toast.error("Nama template wajib diisi.");

    setIsSaving(true);
    try {
      if (isEditMode) {
        await apiClient.put(`/risk-maps/${templateId}`, template);
        toast.success("Template berhasil diperbarui!");
      } else {
        await apiClient.post("/risk-maps", template);
        toast.success("Template berhasil dibuat!");
      }
      navigate("/risk-management/templates");
    } catch (error) {
      toast.error("Gagal menyimpan template: " + (error.response?.data?.msg || "Terjadi kesalahan"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin h-10 w-10 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4">
          <Button variant="light" icon={FiArrowLeft} onClick={() => navigate("/risk-management/templates")} title="Kembali" />
          <div>
            <div className="flex items-center gap-2">
              <Title className="text-2xl text-slate-800">{isEditMode ? "Edit Template" : "Template Baru"}</Title>
              <Badge className="rounded-md" color="indigo">
                {isEditMode ? "Mode Edit" : "Draft"}
              </Badge>
            </div>
            <Text className="text-slate-500 mt-1">Kustomisasi matriks, label, dan definisi level risiko.</Text>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="rounded-md" color="rose" onClick={() => navigate("/risk-management/templates")}>
            Batal
          </Button>
          <Button icon={FiSave} onClick={handleSaveTemplate} loading={isSaving} className="shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all rounded-xl">
            {isEditMode ? "Simpan Perubahan" : "Simpan Template"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Informasi & Label */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card Identitas */}
          <Card className="border-l-4 border-indigo-500 shadow-md ring-1 ring-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <FiInfo size={20} />
              </div>
              <Title as="h3">Informasi Dasar</Title>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Nama Template <span className="text-red-500">*</span>
                </label>
                <TextInput name="name" value={template.name} onChange={handleInputChange} placeholder="Contoh: Peta Risiko Proyek IT" className="mt-1" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Deskripsi</label>
                <Textarea name="description" value={template.description} onChange={handleInputChange} placeholder="Deskripsi singkat..." className="mt-1" rows={3} />
              </div>
            </div>
          </Card>

          {/* Card Label Sumbu */}
          <Card className="border-l-4 border-purple-500 shadow-md ring-1 ring-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <FiTag size={20} />
              </div>
              <Title as="h3">Label Sumbu</Title>
            </div>

            <div className="space-y-6">
              <div>
                <Text className="font-medium text-purple-700 mb-2">Sumbu Y (Probabilitas)</Text>
                <div className="space-y-2 pl-2 border-l-2 border-purple-100">
                  {template.likelihood_labels
                    .sort((a, b) => b.level - a.level)
                    .map(({ level, label }) => (
                      <div key={level} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-6">L{level}</span>
                        <TextInput value={label} onChange={(e) => handleLabelChange("likelihood_labels", level, e.target.value)} className="h-8 text-sm" />
                      </div>
                    ))}
                </div>
              </div>
              <div>
                <Text className="font-medium text-purple-700 mb-2">Sumbu X (Dampak)</Text>
                <div className="space-y-2 pl-2 border-l-2 border-purple-100">
                  {template.impact_labels
                    .sort((a, b) => a.level - b.level)
                    .map(({ level, label }) => (
                      <div key={level} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-6">L{level}</span>
                        <TextInput value={label} onChange={(e) => handleLabelChange("impact_labels", level, e.target.value)} className="h-8 text-sm" />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Kolom Kanan: Matriks & Definisi */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Matriks Skor */}
          <Card className="border-l-4 border-teal-500 shadow-md ring-1 ring-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                <FiGrid size={20} />
              </div>
              <div>
                <Title as="h3">Peta Skor Risiko</Title>
                <Text>Sesuaikan nilai skor di setiap sel matriks.</Text>
              </div>
            </div>

            <div className="flex items-stretch mt-4 bg-gray-50/50 p-4 rounded-xl border border-gray-200">
              {/* Label Sumbu Y Rotated */}
              <div className="flex items-center justify-center mr-4 w-8">
                <span className="font-bold text-gray-400 tracking-widest text-xs" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                  PROBABILITAS
                </span>
              </div>

              <div className="flex-1 overflow-x-auto">
                <div className="min-w-[500px]">
                  {" "}
                  {/* Ensure scroll on small screens */}
                  {/* Labels X Top */}
                  <div className="grid grid-cols-5 gap-2 ml-24 mb-2">
                    {template.impact_labels
                      .sort((a, b) => a.level - b.level)
                      .map((l) => (
                        <div key={l.level} className="text-xs font-medium text-center text-gray-500 truncate px-1" title={l.label}>
                          {l.label}
                        </div>
                      ))}
                  </div>
                  <div className="flex">
                    {/* Labels Y Left */}
                    <div className="flex flex-col justify-around w-24 mr-2 space-y-2">
                      {template.likelihood_labels
                        .sort((a, b) => b.level - a.level)
                        .map((l) => (
                          <div key={l.level} className="h-14 flex items-center justify-end text-xs font-medium text-gray-500 text-right leading-tight" title={l.label}>
                            {l.label}
                          </div>
                        ))}
                    </div>

                    {/* The Grid */}
                    <div className="flex-1 grid grid-cols-5 gap-2">
                      {Array.from({ length: 5 }, (_, i) => 5 - i).flatMap((l_level) =>
                        Array.from({ length: 5 }, (_, j) => j + 1).map((i_level) => {
                          const cell = template.scores?.find((s) => s.likelihood_level === l_level && s.impact_level === i_level);
                          const def = template.level_definitions.find((d) => cell?.score >= d.min_score && cell?.score <= d.max_score);
                          return <MatrixCellInput key={`${l_level}-${i_level}`} likelihood={l_level} impact={i_level} score={cell?.score || 0} color={def?.color_hex} onScoreChange={handleScoreChange} />;
                        })
                      )}
                    </div>
                  </div>
                  {/* Label X Bottom */}
                  <div className="mt-3 text-center font-bold text-gray-400 tracking-widest text-xs ml-24">DAMPAK</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Card Definisi Level */}
          <Card className="border-l-4 border-orange-500 shadow-md ring-1 ring-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                  <FiList size={20} />
                </div>
                <Title as="h3">Definisi Level Risiko</Title>
              </div>
              <Button icon={FiPlus} onClick={addLevelDefinition} size="xs" variant="secondary" className="rounded-md" color="orange">
                Tambah Level
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">Nama Level</th>
                    <th className="px-4 py-2">Warna</th>
                    <th className="px-4 py-2 w-24">Min</th>
                    <th className="px-4 py-2 w-24">Max</th>
                    <th className="px-4 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {template.level_definitions.map((def, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <TextInput value={def.level_name} onChange={(e) => handleDefinitionChange(index, "level_name", e.target.value)} placeholder="Nama..." />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <input type="color" value={def.color_hex} onChange={(e) => handleDefinitionChange(index, "color_hex", e.target.value)} className="h-8 w-8 rounded cursor-pointer border-0 p-0" />
                          <TextInput value={def.color_hex} onChange={(e) => handleDefinitionChange(index, "color_hex", e.target.value)} className="w-24" />
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <NumberInput value={def.min_score} onValueChange={(v) => handleDefinitionChange(index, "min_score", v)} />
                      </td>
                      <td className="px-4 py-2">
                        <NumberInput value={def.max_score} onValueChange={(v) => handleDefinitionChange(index, "max_score", v)} />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button icon={FiTrash2} variant="light" color="red" onClick={() => removeLevelDefinition(index)} size="xs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TemplateEditorPage;
