// frontend/src/features/risk-ai/components/CreateAssessmentForm.jsx

import React, { useState, useEffect } from "react";
import apiClient from "../../../api/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AsyncSelect from "react-select/async";
import { components } from "react-select";
import { Card, Title, Text, Button, TextInput, Textarea, Select, SearchSelect, SelectItem, SearchSelectItem, ProgressBar, Dialog, DialogPanel, Switch } from "@tremor/react";
import { FiCpu, FiArchive, FiBriefcase, FiFlag, FiCheckSquare, FiPlusSquare, FiHome, FiShield, FiDollarSign, FiTarget, FiBookOpen, FiUsers, FiClipboard, FiCheckCircle, FiGlobe } from "react-icons/fi";
import { toast } from "sonner";
import NotificationModal from "../../../components/common/NotificationModal";

// Data Kategori Risiko
const RISK_CATEGORIES = [
  { name: "Credit Risk", desc: "Default, concentration, counterparty risks" },
  { name: "Market Risk", desc: "Price, volatility, liquidity risks" },
  { name: "Liquidity Risk", desc: "Funding and cash flow risks" },
  { name: "Operational Risk", desc: "Process, people, system risks" },
  { name: "Strategic Risk", desc: "Business model and competitive" },
  { name: "Legal Risk", desc: "Contract, regulatory, litigation" },
  { name: "Compliance Risk", desc: "Regulatory and policy violations" },
  { name: "Reputation Risk", desc: "Brand and stakeholder perception" },
  { name: "Insurance Risk", desc: "Coverage gaps and claims risks" },
  { name: "Intra Group Risk", desc: "Internal group transaction risks" },
];

const requiredFields = ["nama_asesmen", "project_objective", "involved_departments", "additional_risk_context", "risk_categories"];

const RegulationOption = (props) => {
  return (
    <components.Option {...props}>
      <div className="flex flex-col">
        <span className="font-semibold text-gray-800">{props.data.label}</span>
        <span className="text-xs text-gray-500 mt-0.5">{props.data.description}</span>
      </div>
    </components.Option>
  );
};

function CreateAssessmentForm() {
  const [formData, setFormData] = useState({
    nama_asesmen: "",
    company_industry: "",
    company_type: "",
    company_assets: "",
    currency: "IDR",
    risk_limit: null,
    risk_categories: [],
    project_objective: "",
    relevant_regulations: "",
    involved_departments: "",
    completed_actions: "",
    additional_risk_context: "",
  });

  const [options, setOptions] = useState({
    industry: [],
    companyType: [],
    companyAssets: [],
    currency: [],
  });
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);

  const [displayRiskLimit, setDisplayRiskLimit] = useState("");
  const [outputLanguage, setOutputLanguage] = useState("ID");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [hasAgreedTerms, setHasAgreedTerms] = useState(false);
  const [hasAgreedUsage, setHasAgreedUsage] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    assessmentId: null,
  });

  // useEffect Fetch Data
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [industryRes, typeRes, assetsRes, currencyRes] = await Promise.all([
          apiClient.get("/master-data?category=INDUSTRY"),
          apiClient.get("/master-data?category=COMPANY_TYPE"),
          apiClient.get("/master-data?category=COMPANY_ASSETS"),
          apiClient.get("/master-data?category=CURRENCY"),
        ]);
        setOptions({
          industry: industryRes.data,
          companyType: typeRes.data,
          companyAssets: assetsRes.data,
          currency: currencyRes.data,
        });
      } catch (error) {
        console.error("Gagal memuat pilihan dropdown:", error);
      } finally {
        setIsOptionsLoading(false);
      }
    };
    fetchOptions();
  }, []);

  // useEffect Progress
  useEffect(() => {
    let completed = 0;
    requiredFields.forEach((field) => {
      if (field === "risk_categories") {
        if (formData[field].length > 0) completed++;
      } else {
        if (formData[field]) completed++;
      }
    });
    setProgress(Math.round((completed / requiredFields.length) * 100));
  }, [formData]);

  // Handlers
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSelectChange = (value, name) => setFormData({ ...formData, [name]: value });

  const handleRiskLimitChange = (event) => {
    const rawValue = event.target.value.replace(/,/g, "");
    if (!isNaN(rawValue) && rawValue !== "") {
      const numValue = parseInt(rawValue, 10);
      setFormData({ ...formData, risk_limit: numValue });
      setDisplayRiskLimit(numValue.toLocaleString("en-US"));
    } else if (rawValue === "") {
      setFormData({ ...formData, risk_limit: null });
      setDisplayRiskLimit("");
    }
  };

  const handleCategoryChange = (categoryName) => {
    const currentCategories = formData.risk_categories;
    const newCategories = currentCategories.includes(categoryName) ? currentCategories.filter((c) => c !== categoryName) : [...currentCategories, categoryName];
    setFormData({ ...formData, risk_categories: newCategories });
  };

  const loadRegulationOptions = (inputValue, callback) => {
    if (inputValue.length < 2) {
      callback([]);
      return;
    }
    apiClient.get(`/regulations/search?q=${inputValue}`).then((response) => {
      callback(response.data);
    });
  };

  const handleRegulationChange = (selectedOptions) => {
    const regulationNames = selectedOptions.map((option) => option.label).join(", ");
    setFormData({ ...formData, relevant_regulations: regulationNames });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.risk_categories.length === 0) {
      toast.warning("Validasi Gagal", { description: "Harap pilih minimal satu kategori risiko." });
      return;
    }
    setIsAgreementModalOpen(true);
  };

  const handleConfirmAndAnalyze = async () => {
    setIsAgreementModalOpen(false);
    setIsLoading(true);
    try {
      // Logic POST ke Backend
      const response = await apiClient.post("/assessments/analyze", { ...formData, output_language: outputLanguage });
      setIsLoading(false);
      setSuccessModal({
        isOpen: true,
        assessmentId: response.data.assessment_id,
      });
    } catch (error) {
      setIsLoading(false);
      toast.error("Analisis AI Gagal", {
        description: error.response?.data?.msg || "Gagal membuat dan menganalisis asesmen.",
      });
    }
  };

  const handleCloseSuccessModal = () => {
    const { assessmentId } = successModal;
    setSuccessModal({ isOpen: false, assessmentId: null });
    if (assessmentId) navigate(`/risk-ai/assessments/${assessmentId}`);
  };

  const canProceed = hasAgreedTerms && hasAgreedUsage;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. PROJECT NAME (Blue Accent) */}
        <Card className="border-l-4 border-blue-500 shadow-md ring-1 ring-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <FiArchive size={24} />
            </div>
            <div>
              <Title>Nama Proyek</Title>
              <Text className="text-xs text-gray-500">Identitas utama asesmen risiko ini.</Text>
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700">
              Nama Asesmen <span className="text-red-500">*</span>
            </label>
            <TextInput name="nama_asesmen" value={formData.nama_asesmen} onChange={handleChange} required className="mt-2" placeholder="Contoh: Asesmen Risiko IT Q3 2025" />
          </div>
        </Card>

        {/* 2. COMPANY INFORMATION (Indigo Accent) */}
        <Card className="border-l-4 border-indigo-500 shadow-md ring-1 ring-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <FiBriefcase size={24} />
            </div>
            <div>
              <Title>Informasi Perusahaan</Title>
              <Text className="text-xs text-gray-500">Konteks organisasi dan skala bisnis.</Text>
            </div>
          </div>

          {/* Grid Responsif: 1 kolom di HP, 2 kolom di Tablet/Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FiHome /> Industri *
              </label>
              <SearchSelect onValueChange={(v) => handleSelectChange(v, "company_industry")} placeholder="Pilih Industri..." disabled={isOptionsLoading}>
                {options.industry.map((item) => (
                  <SearchSelectItem key={item.key} value={item.key}>
                    {item.value}
                  </SearchSelectItem>
                ))}
              </SearchSelect>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FiShield /> Tipe Perusahaan *
              </label>
              <SearchSelect onValueChange={(v) => handleSelectChange(v, "company_type")} placeholder="Pilih Tipe..." disabled={isOptionsLoading}>
                {options.companyType.map((item) => (
                  <SearchSelectItem key={item.key} value={item.key}>
                    {item.value}
                  </SearchSelectItem>
                ))}
              </SearchSelect>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FiDollarSign /> Aset Perusahaan *
              </label>
              <SearchSelect onValueChange={(v) => handleSelectChange(v, "company_assets")} placeholder="Rentang Aset..." disabled={isOptionsLoading}>
                {options.companyAssets.map((item) => (
                  <SearchSelectItem key={item.key} value={item.key}>
                    {item.value}
                  </SearchSelectItem>
                ))}
              </SearchSelect>
            </div>
            <div className="flex gap-4">
              <div className="w-1/3">
                <label className="text-sm font-bold text-gray-700 mb-2 block">Mata Uang</label>
                <Select defaultValue="IDR" onValueChange={(v) => handleSelectChange(v, "currency")} disabled={isOptionsLoading}>
                  {options.currency.map((item) => (
                    <SelectItem key={item.key} value={item.key}>
                      {item.value}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="w-2/3">
                <label className="text-sm font-bold text-gray-700 mb-2 block">Batas Risiko (Risk Limit)</label>
                <TextInput name="risk_limit" value={displayRiskLimit} onChange={handleRiskLimitChange} placeholder="Rp" />
              </div>
            </div>
          </div>
        </Card>

        {/* 3. RISK CATEGORIES (Orange Accent) */}
        <Card className="border-l-4 border-orange-500 shadow-md ring-1 ring-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <FiFlag size={24} />
            </div>
            <div>
              <Title>Kategori Risiko</Title>
              <Text className="text-xs text-gray-500">Pilih jenis risiko yang relevan untuk dianalisis.</Text>
            </div>
          </div>
          <div className="p-4 bg-orange-50/30 rounded-lg mb-4 border border-orange-100">
            <Text className="text-orange-800 text-sm flex items-center gap-2">
              <FiCheckCircle /> Pilih minimal 1 kategori.
            </Text>
          </div>

          {/* Grid Kategori: 1 col (HP), 2 col (Tablet), 3 col (Desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {RISK_CATEGORIES.map((category) => {
              const isSelected = formData.risk_categories.includes(category.name);
              return (
                <motion.div
                  key={category.name}
                  onClick={() => handleCategoryChange(category.name)}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative p-4 border rounded-xl cursor-pointer transition-all duration-200 flex flex-col gap-2
                    ${isSelected ? "border-orange-500 bg-orange-50 shadow-sm ring-1 ring-orange-200" : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm"}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <p className={`font-bold ${isSelected ? "text-orange-800" : "text-gray-700"}`}>{category.name}</p>
                    {isSelected ? <FiCheckSquare className="text-orange-600" size={20} /> : <div className="w-5 h-5 border-2 border-gray-300 rounded flex-shrink-0" />}
                  </div>
                  <p className={`text-xs ${isSelected ? "text-orange-700" : "text-gray-500"}`}>{category.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* 4. PROJECT CONTEXT (Emerald Accent) */}
        <Card className="border-l-4 border-emerald-500 shadow-md ring-1 ring-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <FiCheckSquare size={24} />
            </div>
            <div>
              <Title>Konteks Proyek</Title>
              <Text className="text-xs text-gray-500">Detail tujuan dan regulasi yang melingkupi proyek.</Text>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FiTarget /> Tujuan Proyek (Objectives) *
              </label>
              <Textarea name="project_objective" value={formData.project_objective} onChange={handleChange} required rows={3} placeholder="Jelaskan tujuan utama proyek ini..." />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FiUsers /> Departemen Terlibat *
              </label>
              <Textarea name="involved_departments" value={formData.involved_departments} onChange={handleChange} required rows={3} placeholder="Divisi IT, Keuangan, Operasional..." />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FiClipboard /> Tindakan yang Sudah Dilakukan
              </label>
              <Textarea name="completed_actions" value={formData.completed_actions} onChange={handleChange} rows={3} placeholder="Contoh: Asesmen awal keamanan, due diligence vendor..." />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FiBookOpen /> Regulasi Terkait
              </label>
              <AsyncSelect
                isMulti
                cacheOptions
                defaultOptions
                loadOptions={loadRegulationOptions}
                onChange={handleRegulationChange}
                placeholder="Ketik untuk mencari regulasi..."
                className="text-sm"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderRadius: "0.5rem",
                    borderColor: state.isFocused ? "#10b981" : "#e5e7eb",
                    boxShadow: state.isFocused ? "0 0 0 1px #10b981" : "none",
                    "&:hover": { borderColor: "#d1d5db" },
                    minHeight: "50px",
                  }),
                  option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? "#ecfdf5" : "white", color: "black" }),
                }}
                components={{ Option: RegulationOption }}
              />
            </div>
          </div>
        </Card>

        {/* 5. ADDITIONAL CONTEXT (Purple Accent) */}
        <Card className="border-l-4 border-purple-500 shadow-md ring-1 ring-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <FiPlusSquare size={24} />
            </div>
            <div>
              <Title>Konteks Tambahan</Title>
              <Text className="text-xs text-gray-500">Informasi spesifik lainnya untuk AI.</Text>
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Konteks Risiko Tambahan *</label>
            <Textarea name="additional_risk_context" value={formData.additional_risk_context} onChange={handleChange} required rows={4} placeholder="Jelaskan kekhawatiran khusus, batasan waktu, atau integrasi pihak ketiga..." />
          </div>
        </Card>

        {/* ACTION BAR */}
        <div className="sticky bottom-6 z-10">
          <Card className="shadow-2xl border-t-4 border-blue-600 rounded-xl bg-white/95 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="w-full md:w-1/3">
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                  <span>Kelengkapan Data</span>
                  <span>{progress}%</span>
                </div>
                <ProgressBar value={progress} color="blue" className="h-2" />
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setOutputLanguage("ID")}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${outputLanguage === "ID" ? "bg-white shadow text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputLanguage("EN")}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${outputLanguage === "EN" ? "bg-white shadow text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    EN
                  </button>
                </div>

                <Button type="submit" icon={FiCpu} size="lg" loading={isLoading} disabled={isLoading || progress < 100} className="shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all">
                  Mulai Analisis AI
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </form>

      {/* --- MODALS --- */}
      <Dialog open={isAgreementModalOpen} onClose={() => setIsAgreementModalOpen(false)} static={true}>
        <DialogPanel className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <FiCpu size={24} />
            </div>
            <Title>Kebijakan Penggunaan AI</Title>
          </div>

          <div className="mt-4 border border-gray-200 rounded-lg p-4 h-64 overflow-y-auto space-y-4 bg-gray-50 text-sm">
            <h3 className="font-bold text-gray-800">1. Penggunaan yang Dilarang</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1 pl-2">
              <li>Melanggar regulasi OJK, BI, atau regulator keuangan lainnya.</li>
              <li>Manipulasi input untuk menghasilkan risk level yang tidak akurat.</li>
              <li>Penyalahgunaan data sensitif tanpa consent yang proper.</li>
            </ul>

            <h3 className="font-bold text-gray-800">2. Persyaratan Khusus Risk Management</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1 pl-2">
              <li>Data Governance: Pastikan data akurat dan maintain audit trail.</li>
              <li>Model Validation: Lakukan back-testing dan stress testing.</li>
              <li>Business Continuity: Maintain alternative assessment methods.</li>
            </ul>
          </div>

          <div className="mt-6 space-y-3 bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <Switch id="terms" checked={hasAgreedTerms} onChange={setHasAgreedTerms} color="blue" />
              <label htmlFor="terms" className="text-sm font-medium text-gray-700 cursor-pointer">
                Saya telah membaca dan memahami kebijakan AI
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Switch id="usage" checked={hasAgreedUsage} onChange={setHasAgreedUsage} color="blue" />
              <label htmlFor="usage" className="text-sm font-medium text-gray-700 cursor-pointer">
                Saya menyetujui penggunaan AI sesuai kebijakan
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 border-t pt-4">
            <Button variant="secondary" onClick={() => setIsAgreementModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleConfirmAndAnalyze} disabled={!canProceed} icon={FiCheckCircle}>
              Setuju & Lanjutkan
            </Button>
          </div>
        </DialogPanel>
      </Dialog>

      <Dialog open={isLoading} onClose={() => {}} static={true}>
        <DialogPanel className="text-center max-w-sm">
          <div className="mx-auto w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4 relative">
            <FiCpu className="h-8 w-8 text-indigo-600 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin"></div>
          </div>
          <Title className="text-xl">AI Sedang Bekerja</Title>
          <Text className="mt-2">Menganalisis profil risiko berdasarkan data yang Anda berikan...</Text>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-6 overflow-hidden">
            <motion.div className="bg-indigo-600 h-2 rounded-full" initial={{ width: "0%" }} animate={{ width: "90%" }} transition={{ duration: 15, ease: "linear" }} />
          </div>
        </DialogPanel>
      </Dialog>

      <NotificationModal
        isOpen={successModal.isOpen}
        onClose={handleCloseSuccessModal}
        title="Analisis Selesai!"
        message="Analisis AI berhasil! Daftar risiko awal telah dibuat. Anda akan diarahkan ke halaman hasil."
        icon={<FiCheckCircle className="w-10 h-10 text-green-500" />}
      />
    </>
  );
}

export default CreateAssessmentForm;
