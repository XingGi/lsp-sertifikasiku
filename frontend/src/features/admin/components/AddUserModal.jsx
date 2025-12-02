// frontend/src/features/admin/components/AddUserModal.jsx

import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, Title, Text, TextInput, Button, Select, SelectItem } from "@tremor/react";
import { FiUser, FiMail, FiPhone, FiHome, FiSave, FiX, FiKey, FiLock, FiBriefcase, FiPlus, FiCheck, FiShield } from "react-icons/fi";
import apiClient from "../../../api/api";
import { toast } from "sonner";

// --- KOMPONEN ROLE SELECTOR (Visual Card) ---
const RoleSelector = ({ allRoles, selectedIds, onChange }) => {
  const toggleRole = (id) => {
    const strId = String(id);
    onChange(selectedIds.includes(strId) ? selectedIds.filter((rid) => rid !== strId) : [...selectedIds, strId]);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3">
      {allRoles.map((role) => {
        const isSelected = selectedIds.includes(String(role.id));
        const isAdmin = role.name.toLowerCase() === "admin";
        const theme = isAdmin ? { bg: "bg-rose-50", border: "border-rose-500", text: "text-rose-800", icon: "text-rose-600" } : { bg: "bg-amber-50", border: "border-amber-500", text: "text-amber-800", icon: "text-amber-600" };

        return (
          <div
            key={role.id}
            onClick={() => toggleRole(role.id)}
            className={`
                            cursor-pointer p-4 rounded-xl border-l-4 transition-all duration-200 flex flex-col gap-2 select-none shadow-sm hover:shadow-md
                            ${isSelected ? `${theme.bg} ${theme.border} ring-1 ring-black/5` : "bg-white border-gray-200 hover:border-gray-300"}
                        `}
          >
            <div className="flex justify-between items-start">
              <span className={`font-bold text-sm ${isSelected ? theme.text : "text-slate-700"}`}>{role.name}</span>
              {isSelected && <FiCheckCircle className={theme.icon} />}
            </div>
            <span className="text-xs text-gray-500 line-clamp-2">{role.description || "-"}</span>
          </div>
        );
      })}
    </div>
  );
};
import { FiCheckCircle } from "react-icons/fi";

const fetchDepartmentsByInstitution = async (institution, setDepartments, setIsLoading) => {
  if (!institution) {
    setDepartments([]);
    return;
  }
  setIsLoading(true);
  try {
    const { data } = await apiClient.get(`/admin/departments-list?institution=${encodeURIComponent(institution)}`);
    setDepartments(data);
  } catch (err) {
    setDepartments([]);
  }
  setIsLoading(false);
};

function AddUserModal({ isOpen, onClose, allRoles, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    institution: "",
    department_id: "",
  });
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState(false);

  useEffect(() => {
    fetchDepartmentsByInstitution(formData.institution, setDepartments, setIsLoadingDepts);
  }, [formData.institution, isOpen]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (value, name) => setFormData((prev) => ({ ...prev, [name]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return toast.error("Password tidak cocok.");
    if (formData.password.length < 8) return toast.error("Password minimal 8 karakter.");
    if (selectedRoleIds.length === 0) return toast.error("Pilih minimal satu role.");

    setIsSaving(true);
    const payload = {
      ...formData,
      role_ids: selectedRoleIds.map(Number),
      department_id: formData.department_id ? Number(formData.department_id) : null,
    };

    try {
      const response = await apiClient.post("/admin/users", payload);
      toast.success("User berhasil ditambahkan!");
      onSaveSuccess(response.data.user);
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Gagal menyimpan user.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({ nama_lengkap: "", email: "", password: "", confirmPassword: "", phone_number: "", institution: "", department_id: "" });
    setSelectedRoleIds([]);
    setDepartments([]);
  };

  return (
    <Dialog open={isOpen} onClose={() => !isSaving && handleClose()} static={true}>
      <DialogPanel className="max-w-7xl p-0 overflow-hidden rounded-2xl bg-gray-50/50 shadow-2xl transform transition-all">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 bg-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
              <FiPlus size={24} />
            </div>
            <div>
              <Title className="text-2xl text-slate-800 font-bold">Tambah User Baru</Title>
              <Text className="text-sm text-gray-500">Lengkapi formulir di bawah untuk mendaftarkan pengguna.</Text>
            </div>
          </div>
          <Button icon={FiX} variant="light" color="slate" onClick={handleClose} disabled={isSaving} className="rounded-full p-2 hover:bg-gray-100" />
        </div>

        {/* Body Form - Layout 3 Kolom Atas, 1 Kolom Bawah */}
        <form onSubmit={handleSave} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* ROW 1: 3 Kolom Sejajar (Identitas - Organisasi - Keamanan) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COL 1: Identitas (Biru) */}
            <div className="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm ring-1 ring-gray-200/50 h-full">
              <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 uppercase tracking-wider border-b border-gray-100 pb-3">
                <FiUser className="text-blue-500" /> Identitas Diri
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Nama Lengkap *</label>
                  <TextInput name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required placeholder="Nama Lengkap" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Email *</label>
                  <TextInput icon={FiMail} name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="email@perusahaan.com" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">No. Telepon</label>
                  <TextInput icon={FiPhone} name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="08..." />
                </div>
              </div>
            </div>

            {/* COL 2: Organisasi (Indigo) */}
            <div className="bg-white p-6 rounded-xl border-l-4 border-indigo-500 shadow-sm ring-1 ring-gray-200/50 h-full">
              <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 uppercase tracking-wider border-b border-gray-100 pb-3">
                <FiBriefcase className="text-indigo-500" /> Organisasi
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Institusi</label>
                  <TextInput icon={FiHome} name="institution" value={formData.institution} onChange={handleChange} placeholder="Nama Institusi" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Departemen</label>
                  <Select value={formData.department_id} onValueChange={(v) => handleSelectChange(v, "department_id")} disabled={!formData.institution || isLoadingDepts} placeholder="Pilih...">
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* COL 3: Keamanan (Rose) */}
            <div className="bg-white p-6 rounded-xl border-l-4 border-rose-500 shadow-sm ring-1 ring-gray-200/50 h-full">
              <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 uppercase tracking-wider border-b border-gray-100 pb-3">
                <FiLock className="text-rose-500" /> Keamanan
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Password *</label>
                  <TextInput icon={FiLock} name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Min. 8 karakter" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Konfirmasi *</label>
                  <TextInput icon={FiLock} name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required placeholder="Ulangi password" />
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: Full Width (Hak Akses - Amber) */}
          <div className="bg-white p-6 rounded-xl border-l-4 border-amber-500 shadow-sm ring-1 ring-gray-200/50">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider border-b border-gray-100 pb-3">
              <FiKey className="text-amber-500" /> Hak Akses (Roles) <span className="text-red-500">*</span>
            </h3>
            <RoleSelector allRoles={allRoles} selectedIds={selectedRoleIds} onChange={setSelectedRoleIds} />
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-200 bg-white flex justify-end gap-4">
          <Button variant="secondary" color="rose" onClick={handleClose} disabled={isSaving} className="px-6 rounded-md">
            Batal
          </Button>
          <Button onClick={handleSave} loading={isSaving} className="text-white bg-blue-600 hover:bg-blue-700 border-blue-600 shadow-lg shadow-blue-100 px-8 rounded-md">
            Simpan User
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default AddUserModal;
