// frontend/src/features/account/AccountSettingPage.jsx

import React, { useState, useEffect } from "react";
import { Card, Title, Text, TextInput, Button, Grid, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, NumberInput, Badge } from "@tremor/react";
import { FiUser, FiMail, FiPhone, FiHome, FiSave, FiInfo, FiBriefcase, FiShield, FiActivity, FiGlobe, FiMap, FiCpu, FiFileText, FiEdit3 } from "react-icons/fi";
import apiClient from "../../api/api";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

function AccountSettingPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    nama_lengkap: "",
    email: "",
    phone_number: "",
    institution: "",
    department_name: "",
    assessment_limits: {
      dasar: { count: 0, limit: 0 },
      madya: { count: 0, limit: 0 },
      ai: { count: 0, limit: 0 },
      template_peta: { count: 0, limit: 0 },
      horizon: { count: 0, limit: 0 },
      qrc_standard: { count: 0, limit: 0 },
      qrc_essay: { count: 0, limit: 0 },
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get("/account/details")
      .then((response) => {
        const data = response.data;
        const limits = response.data.assessment_limits || {};
        for (const key in limits) {
          limits[key].limit = limits[key].limit !== null ? Number(limits[key].limit) : null;
        }
        limits.qrc_standard = {
          count: data.usage_qrc_standard || 0,
          limit: data.limit_qrc_standard !== null && data.limit_qrc_standard !== undefined ? Number(data.limit_qrc_standard) : 2, // Default jika null
        };

        limits.qrc_essay = {
          count: data.usage_qrc_essay || 0,
          limit: data.limit_qrc_essay !== null && data.limit_qrc_essay !== undefined ? Number(data.limit_qrc_essay) : 1, // Default jika null
        };
        setUserData({ ...response.data, assessment_limits: limits });
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat data akun.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // --- 1. VALIDASI INPUT NOMOR TELEPON (Hanya Angka) ---
    if (name === "phone_number") {
      // Hanya izinkan angka
      const numericValue = value.replace(/\D/g, "");
      setUserData({ ...userData, [name]: numericValue });
      return;
    }

    setUserData({ ...userData, [name]: value });
  };

  const handleLimitChange = (key, value) => {
    const numericValue = value === "" || value === null ? null : Number(value);
    setUserData((prev) => ({
      ...prev,
      assessment_limits: {
        ...prev.assessment_limits,
        [key]: { ...prev.assessment_limits[key], limit: numericValue },
      },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    // --- 2. VALIDASI PANJANG NOMOR TELEPON (10-13 Digit) ---
    if (userData.phone_number) {
      if (userData.phone_number.length < 10 || userData.phone_number.length > 13) {
        toast.error("Nomor telepon harus terdiri dari 10 hingga 13 digit angka.");
        return;
      }
    }

    setIsSaving(true);
    const payload = {
      nama_lengkap: userData.nama_lengkap,
      phone_number: userData.phone_number,
    };

    if (user?.role === "admin") {
      const { qrc_standard, qrc_essay, ...jsonLimits } = userData.assessment_limits;

      payload.assessment_limits = jsonLimits;
      payload.limit_qrc_standard = qrc_standard?.limit;
      payload.limit_qrc_essay = qrc_essay?.limit;
    }

    try {
      await apiClient.put("/account/update", payload);
      toast.success("Profil berhasil disimpan!");
    } catch (err) {
      setError(err.response?.data?.msg || "Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-gray-500">Memuat data Anda...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  const isAdmin = user?.role === "admin";

  // Helper Konfigurasi Ikon & Warna untuk Tabel Limit
  const getFeatureConfig = (key) => {
    const map = {
      dasar: { label: "Asesmen Dasar", icon: FiBriefcase, color: "blue" },
      madya: { label: "Asesmen Madya", icon: FiShield, color: "emerald" },
      ai: { label: "Risk AI", icon: FiCpu, color: "purple" },
      template_peta: { label: "Template Peta", icon: FiMap, color: "amber" },
      horizon: { label: "Horizon Scanner", icon: FiGlobe, color: "indigo" },
      qrc_standard: { label: "QRC Standard", icon: FiFileText, color: "cyan" },
      qrc_essay: { label: "QRC Essay", icon: FiEdit3, color: "rose" },
    };
    return map[key] || { label: key, icon: FiActivity, color: "slate" };
  };

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
          <FiUser size={28} />
        </div>
        <div>
          <Title className="text-2xl text-slate-800">Pengaturan Akun</Title>
          <Text className="text-slate-500">Kelola informasi profil dan preferensi Anda.</Text>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <Grid numItemsMd={2} className="gap-8 items-start">
          {/* KARTU 1: INFORMASI PENGGUNA (Blue Accent) */}
          <Card className="border-t-4 border-blue-500 shadow-md ring-1 ring-gray-100 h-full flex flex-col bg-white">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <FiUser size={20} />
              </div>
              <div>
                <Title className="text-lg font-bold text-slate-800">Profil Saya</Title>
                <Text className="text-xs text-gray-500">Detail identitas dan kontak.</Text>
              </div>
            </div>

            <div className="space-y-8 flex-grow">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nama Lengkap</label>
                <TextInput name="nama_lengkap" value={userData.nama_lengkap || ""} onChange={handleChange} required placeholder="Nama Anda" className="font-medium text-slate-700" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email</label>
                  <TextInput icon={FiMail} value={userData.email || ""} disabled className="bg-gray-50 text-gray-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">No. Telepon</label>
                  <TextInput
                    icon={FiPhone}
                    name="phone_number"
                    value={userData.phone_number || ""}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    error={userData.phone_number && (userData.phone_number.length < 10 || userData.phone_number.length > 13)}
                    errorMessage="Harus 10-13 digit"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-gray-50">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Institusi</label>
                  <TextInput icon={FiHome} value={userData.institution || ""} disabled className="bg-gray-50 text-gray-500" placeholder="-" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Departemen</label>
                  <TextInput icon={FiBriefcase} value={userData.department_name || ""} disabled className="bg-gray-50 text-gray-500" placeholder="-" />
                </div>
              </div>
            </div>
          </Card>

          {/* KARTU 2: KUOTA & BATASAN (Modern & Colorful) */}
          <Card className="border-t-4 border-indigo-500 shadow-md ring-1 ring-gray-100 h-full flex flex-col bg-white">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <FiActivity size={20} />
              </div>
              <div>
                <Title className="text-lg font-bold text-slate-800">Kuota & Batasan</Title>
                <Text className="text-xs text-gray-500">Status penggunaan fitur aplikasi.</Text>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200">
              <Table>
                <TableHead>
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHeaderCell className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fitur</TableHeaderCell>
                    <TableHeaderCell className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Terpakai</TableHeaderCell>
                    <TableHeaderCell className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Batas Max</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {["dasar", "madya", "ai", "template_peta", "horizon", "qrc_standard", "qrc_essay"].map((key) => {
                    const value = userData.assessment_limits?.[key] || { count: 0, limit: null };
                    const config = getFeatureConfig(key);
                    const Icon = config.icon;

                    return (
                      <TableRow key={key} className="hover:bg-indigo-50/30 transition-colors border-b border-gray-50 last:border-0">
                        <TableCell className="p-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg bg-${config.color}-50 text-${config.color}-600 shrink-0 border border-${config.color}-100`}>
                              <Icon size={14} />
                            </div>
                            <span className="font-bold text-slate-700 text-xs sm:text-sm">{config.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="p-3 text-right">
                          <Badge size="xs" color="slate" className="rounded-md px-2 py-1 font-mono shadow-sm">
                            {value.count}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-3 text-right">
                          {isAdmin ? (
                            <NumberInput className="max-w-[80px] ml-auto h-8 text-sm" value={value.limit ?? ""} onValueChange={(val) => handleLimitChange(key, val)} min={0} placeholder="∞" />
                          ) : (
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${value.limit === null ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                              {value.limit === null ? "Unlimited" : value.limit}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-start gap-2 p-3 bg-indigo-50 text-indigo-800 text-xs rounded-lg border border-indigo-100 leading-relaxed">
              <FiInfo className="mt-0.5 shrink-0" />
              <span>{isAdmin ? "Sebagai Admin, Anda dapat mengubah batas maksimum ini." : "Hubungi administrator institusi Anda jika membutuhkan penambahan kuota untuk fitur tertentu."}</span>
            </div>
          </Card>
        </Grid>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-end border-t border-gray-200 pt-6">
          <Button
            type="submit"
            icon={FiSave}
            loading={isSaving}
            disabled={isSaving || isLoading}
            size="lg"
            className="text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all rounded-xl bg-blue-600 hover:bg-blue-700 border-blue-600"
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AccountSettingPage;
