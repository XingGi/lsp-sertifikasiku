// frontend/src/features/admin/components/EditUserModal.jsx

import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, Title, Text, TextInput, Button, Select, SelectItem, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, NumberInput } from "@tremor/react";
import { FiUser, FiMail, FiPhone, FiHome, FiSave, FiX, FiKey, FiLoader, FiEdit, FiBriefcase, FiInfo, FiCheckCircle } from "react-icons/fi";
import apiClient from "../../../api/api";
import { toast } from "sonner";

// --- REUSE ROLE SELECTOR ---
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
            className={`cursor-pointer p-4 rounded-xl border-l-4 transition-all duration-200 flex flex-col gap-2 select-none shadow-sm hover:shadow-md ${
              isSelected ? `${theme.bg} ${theme.border} ring-1 ring-black/5` : "bg-white border-gray-200 hover:border-gray-300"
            }`}
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

const fetchDepartmentsByInstitution = async (institution) => {
  if (!institution) return [];
  try {
    const { data } = await apiClient.get(`/admin/departments-list?institution=${encodeURIComponent(institution)}`);
    return data;
  } catch (err) {
    return [];
  }
};

function EditUserModal({ isOpen, onClose, userId, allRoles = [], onSaveSuccess }) {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      setIsLoading(true);
      setDepartments([]);
      apiClient
        .get(`/admin/users/${userId}`)
        .then((res) => {
          const fetchedUser = res.data;
          const limits = fetchedUser.assessment_limits || {};
          ["dasar", "madya", "ai", "template_peta", "horizon"].forEach((key) => {
            if (!limits[key]) limits[key] = { count: 0, limit: null };
          });

          const qrcStd = fetchedUser.limit_qrc_standard !== undefined ? fetchedUser.limit_qrc_standard : 2;
          const qrcEssay = fetchedUser.limit_qrc_essay !== undefined ? fetchedUser.limit_qrc_essay : 1;

          setUserData({ ...fetchedUser, assessment_limits: limits, limit_qrc_standard: qrcStd, limit_qrc_essay: qrcEssay, department_id: fetchedUser.department_id?.toString() || "" });
          setSelectedRoleIds(fetchedUser.role_ids?.map(String) || []);
        })
        .catch(() => toast.error("Gagal memuat data user."))
        .finally(() => setIsLoading(false));
    } else {
      setUserData(null);
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (userData?.institution) {
      setIsLoadingDepts(true);
      fetchDepartmentsByInstitution(userData.institution)
        .then(setDepartments)
        .finally(() => setIsLoadingDepts(false));
    } else {
      setDepartments([]);
    }
  }, [userData?.institution]);

  const handleChange = (e) => setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (val, name) => setUserData((prev) => ({ ...prev, [name]: val }));
  const handleLimitChange = (key, val) =>
    setUserData((prev) => ({
      ...prev,
      assessment_limits: { ...prev.assessment_limits, [key]: { ...prev.assessment_limits[key], limit: val === "" ? null : Number(val) } },
    }));

  const handleQrcLimitChange = (key, val) => {
    setUserData((prev) => ({
      ...prev,
      [key]: val === "" ? 0 : Number(val),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      ...userData,
      role_ids: selectedRoleIds.map(Number),
      department_id: userData.department_id ? Number(userData.department_id) : null,
      limit_qrc_standard: userData.limit_qrc_standard,
      limit_qrc_essay: userData.limit_qrc_essay,
    };
    try {
      const res = await apiClient.put(`/admin/users/${userId}`, payload);
      toast.success("User berhasil diupdate.");
      onSaveSuccess(res.data.user);
      onClose();
    } catch (err) {
      toast.error("Gagal update user.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={() => !isSaving && onClose()} static={true}>
      <DialogPanel className="max-w-7xl h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-white shadow-2xl transform transition-all">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 bg-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
              <FiEdit size={24} />
            </div>
            <div>
              <Title className="text-2xl text-slate-800 font-bold">Edit User</Title>
              <Text className="text-sm text-gray-500 mt-0.5">{userData?.email || "Loading..."}</Text>
            </div>
          </div>
          <Button icon={FiX} variant="light" color="slate" onClick={onClose} disabled={isSaving} className="rounded-full hover:bg-gray-100 p-2" />
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto p-8 bg-gray-50/50">
          {isLoading ? (
            <div className="flex justify-center py-20 text-gray-500 gap-2">
              <FiLoader className="animate-spin" /> Memuat...
            </div>
          ) : userData ? (
            <form id="edit-user-form" onSubmit={handleSave} className="space-y-8">
              {/* ROW 1: 3 Kolom (Info, Org, Limit) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* COL 1: Info Dasar (Biru) */}
                <div className="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm ring-1 ring-gray-200/50 h-full">
                  <h3 className="text-sm font-bold text-slate-700 mb-5 flex items-center gap-2 uppercase tracking-wider border-b border-gray-100 pb-3">
                    <FiUser className="text-blue-500" /> Informasi Dasar
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nama Lengkap</label>
                      <TextInput name="nama_lengkap" value={userData.nama_lengkap || ""} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email (Read-only)</label>
                      <TextInput icon={FiMail} value={userData.email || ""} disabled className="bg-gray-50 text-gray-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">No. Telepon</label>
                      <TextInput icon={FiPhone} name="phone_number" value={userData.phone_number || ""} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                {/* COL 2: Organisasi (Indigo) */}
                <div className="bg-white p-6 rounded-xl border-l-4 border-indigo-500 shadow-sm ring-1 ring-gray-200/50 h-full">
                  <h3 className="text-sm font-bold text-slate-700 mb-5 flex items-center gap-2 uppercase tracking-wider border-b border-gray-100 pb-3">
                    <FiBriefcase className="text-indigo-500" /> Organisasi
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Institusi</label>
                      <TextInput icon={FiHome} name="institution" value={userData.institution || ""} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Departemen</label>
                      <Select icon={FiBriefcase} value={userData.department_id} onValueChange={(v) => handleSelectChange(v, "department_id")} disabled={!userData.institution} placeholder="Pilih...">
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>

                {/* COL 3: Limit (Rose) */}
                <div className="bg-white p-6 rounded-xl border-l-4 border-rose-500 shadow-sm ring-1 ring-gray-200/50 h-full">
                  <h3 className="text-sm font-bold text-slate-700 mb-5 flex items-center gap-2 uppercase tracking-wider border-b border-gray-100 pb-3">
                    <FiInfo className="text-rose-500" /> Batas Kuota
                  </h3>
                  <Table className="mt-0">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell className="p-2 text-[10px] font-bold uppercase">Fitur</TableHeaderCell>
                        <TableHeaderCell className="p-2 text-[10px] font-bold uppercase text-right">Used</TableHeaderCell>
                        <TableHeaderCell className="p-2 text-[10px] font-bold uppercase text-right">Limit</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {["dasar", "madya", "ai", "horizon", "template_peta"].map((key) => (
                        <TableRow key={key} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="p-2 text-xs font-medium capitalize text-slate-700">{key.replace("_", " ")}</TableCell>
                          <TableCell className="p-2 text-xs text-right text-slate-500">{userData.assessment_limits[key]?.count || 0}</TableCell>
                          <TableCell className="p-2 text-right">
                            <NumberInput className="max-w-[70px]" value={userData.assessment_limits[key]?.limit ?? ""} onValueChange={(v) => handleLimitChange(key, v)} min={0} placeholder="∞" />
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="hover:bg-gray-50 transition-colors border-t border-gray-100">
                        <TableCell className="p-2 text-xs font-bold text-indigo-700">QRC Standard</TableCell>
                        <TableCell className="p-2 text-xs text-right text-slate-500 font-medium">{userData.usage_qrc_standard || 0}</TableCell>
                        <TableCell className="p-2 text-right">
                          <NumberInput className="max-w-[70px]" value={userData.limit_qrc_standard} onValueChange={(v) => handleQrcLimitChange("limit_qrc_standard", v)} min={0} />
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50 transition-colors">
                        <TableCell className="p-2 text-xs font-bold text-indigo-700">QRC Essay</TableCell>
                        <TableCell className="p-2 text-xs text-right text-slate-500 font-medium">{userData.usage_qrc_essay || 0}</TableCell>
                        <TableCell className="p-2 text-right">
                          <NumberInput className="max-w-[70px]" value={userData.limit_qrc_essay} onValueChange={(v) => handleQrcLimitChange("limit_qrc_essay", v)} min={0} />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* ROW 2: Hak Akses (Amber) */}
              <div className="bg-white p-6 rounded-xl border-l-4 border-amber-500 shadow-sm ring-1 ring-gray-200/50">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wider border-b border-gray-100 pb-3">
                  <FiKey className="text-amber-500" /> Hak Akses
                </h3>
                <RoleSelector allRoles={allRoles} selectedIds={selectedRoleIds} onChange={setSelectedRoleIds} />
              </div>
            </form>
          ) : (
            <div className="text-center py-10">Error memuat data.</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-200 bg-white flex justify-end gap-4">
          <Button variant="secondary" color="rose" onClick={onClose} disabled={isSaving} className="px-6 rounded-md">
            Batal
          </Button>
          <Button type="submit" form="edit-user-form" loading={isSaving} className="text-white bg-indigo-600 hover:bg-indigo-700 border-indigo-600 shadow-lg shadow-indigo-100 px-8 rounded-md">
            Simpan Perubahan
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default EditUserModal;
