// frontend/src/features/admin/RolePermissionPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Card, Title, Text, Button, Dialog, DialogPanel, TextInput, Textarea, MultiSelect, MultiSelectItem, Badge, Accordion, AccordionHeader, AccordionBody, Select, SelectItem } from "@tremor/react";
import apiClient from "../../api/api";
import { FiPlus, FiEdit2, FiTrash2, FiKey, FiShield, FiX, FiSearch, FiFilter, FiCheck } from "react-icons/fi";
import { toast } from "sonner";
import AppResourceTable from "../../components/common/AppResourceTable";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";

// --- HELPER GROUPING ---
const groupPermissions = (permissions) => {
  const groups = {
    Dashboard: [],
    "Risk Management AI": [],
    "Risk Management Levels": [],
    "Quick Risk Scan (QRC)": [],
    "Modul RSCA": [],
    "Modul BPR": [],
    "Modul BIA": [],
    "Modul Horizon": [],
    "Admin Area": [],
    Lainnya: [],
  };

  const categoryMap = {
    dashboard: "Dashboard",

    risk_assessment_ai: "Risk Management AI",
    risk_register_main: "Risk Management AI",

    risk_dasar: "Risk Management Levels",
    risk_madya: "Risk Management Levels",
    risk_templates: "Risk Management Levels",

    qrc: "Quick Risk Scan (QRC)",

    rsca: "Modul RSCA",
    bpr: "Modul BPR",
    bia: "Modul BIA",
    critical_assets: "Modul BIA",
    horizon: "Modul Horizon",
    cba: "Lainnya",
    monte_carlo: "Lainnya",

    admin_area: "Admin Area",
    users: "Admin Area",
    roles: "Admin Area",
    master_data: "Admin Area",
    regulations: "Admin Area",
    departments: "Admin Area",
    rsca_cycles: "Admin Area",
    mitigation_monitor: "Modul RSCA",
  };

  permissions.forEach((perm) => {
    let assigned = false;
    for (const key in categoryMap) {
      if (perm.name.includes(key)) {
        groups[categoryMap[key]].push(perm);
        assigned = true;
        break;
      }
    }
    if (!assigned) groups["Lainnya"].push(perm);
  });

  // Bersihkan grup kosong
  Object.keys(groups).forEach((key) => {
    if (groups[key].length === 0) delete groups[key];
    else groups[key].sort((a, b) => a.name.localeCompare(b.name));
  });

  return groups;
};

function RolePermissionPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Form
  const [formData, setFormData] = useState({ name: "", description: "", permission_ids: [] });

  // State Filter (Halaman Utama)
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");

  // State Delete
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permissionsRes] = await Promise.all([apiClient.get("/admin/roles"), apiClient.get("/admin/permissions")]);
      setRoles(rolesRes.data);
      setPermissions(permissionsRes.data);
    } catch (error) {
      toast.error("Gagal memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupedPermissions = useMemo(() => groupPermissions(permissions), [permissions]);

  // --- LOGIC FILTER ROLES (Halaman Utama) ---
  const filteredRoles = useMemo(() => {
    let result = [...roles];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(lower) || (r.description || "").toLowerCase().includes(lower));
    }

    result.sort((a, b) => {
      if (sortOption === "name-asc") return a.name.localeCompare(b.name);
      if (sortOption === "name-desc") return b.name.localeCompare(a.name);
      if (sortOption === "perms-desc") return b.permission_ids.length - a.permission_ids.length;
      return 0;
    });

    return result;
  }, [roles, searchTerm, sortOption]);

  // --- HANDLERS ---
  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || "",
        permission_ids: role.permission_ids.map(String),
      });
    } else {
      setEditingRole(null);
      setFormData({ name: "", description: "", permission_ids: [] });
    }
    setIsModalOpen(true);
  };

  const handlePermissionToggle = (id) => {
    const strId = String(id);
    setFormData((prev) => {
      const exists = prev.permission_ids.includes(strId);
      if (exists) {
        return { ...prev, permission_ids: prev.permission_ids.filter((pid) => pid !== strId) };
      } else {
        return { ...prev, permission_ids: [...prev.permission_ids, strId] };
      }
    });
  };

  const handleSelectGroup = (groupPerms, select) => {
    const idsToToggle = groupPerms.map((p) => String(p.id));
    setFormData((prev) => {
      const currentIds = new Set(prev.permission_ids);
      if (select) {
        idsToToggle.forEach((id) => currentIds.add(id));
      } else {
        idsToToggle.forEach((id) => currentIds.delete(id));
      }
      return { ...prev, permission_ids: Array.from(currentIds) };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...formData,
      permission_ids: formData.permission_ids.map(Number),
    };

    try {
      if (editingRole) {
        await apiClient.put(`/admin/roles/${editingRole.id}`, payload);
        toast.success("Role berhasil diperbarui.");
      } else {
        await apiClient.post("/admin/roles", payload);
        toast.success("Role berhasil dibuat.");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal menyimpan role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (role) => {
    setDeleteConfirm({ isOpen: true, id: role.id, name: role.name });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/admin/roles/${deleteConfirm.id}`);
      toast.success("Role dihapus.");
      fetchData();
      setDeleteConfirm({ isOpen: false, id: null, name: "" });
    } catch (error) {
      toast.error("Gagal menghapus role.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Kolom Tabel
  const columns = [
    {
      key: "name",
      header: "Nama Role",
      cell: (role) => (
        <div className="flex items-center gap-2">
          <Text className="font-bold text-slate-700">{role.name}</Text>
          {role.name.toLowerCase() === "admin" && (
            <Badge size="xs" className="rounded-md px-2 py-1" color="rose" icon={FiShield}>
              System
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "description",
      header: "Deskripsi",
      cell: (role) => <Text className="text-sm text-slate-500">{role.description || "-"}</Text>,
    },
    {
      key: "permissions",
      header: "Permissions",
      cell: (role) => (
        <Badge size="xs" color="blue" className="rounded-md px-2 py-1">
          {role.permission_ids.length} Akses
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (role) => {
        const isAdmin = role.name.toLowerCase() === "admin";
        return (
          <div className="flex justify-end gap-2">
            <Button size="xs" variant="light" icon={FiEdit2} onClick={() => handleOpenModal(role)} disabled={isAdmin} title={isAdmin ? "Role Admin tidak dapat diedit" : "Edit Role"} />
            <Button size="xs" variant="light" color="rose" icon={FiTrash2} onClick={() => handleDeleteClick(role)} disabled={isAdmin} title={isAdmin ? "Role Admin tidak dapat dihapus" : "Hapus Role"} />
          </div>
        );
      },
      className: "text-right w-32",
    },
  ];

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
            <FiKey size={28} />
          </div>
          <div>
            <Title className="text-2xl text-slate-800">Role & Permission</Title>
            <Text className="text-slate-500">Kelola hak akses pengguna untuk setiap fitur aplikasi.</Text>
          </div>
        </div>
        <Button size="lg" icon={FiPlus} onClick={() => handleOpenModal()} className="shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all rounded-xl">
          Tambah Role Baru
        </Button>
      </div>

      {/* --- FILTER BAR (HALAMAN UTAMA) --- */}
      <Card className="p-4 shadow-sm border border-gray-100 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          <div className="relative flex-grow w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari role..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-56 flex-shrink-0">
            <Select value={sortOption} onValueChange={setSortOption} icon={FiFilter} placeholder="Urutkan..." className="h-[42px]">
              <SelectItem value="name-asc">Nama (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nama (Z-A)</SelectItem>
              <SelectItem value="perms-desc">Akses Terbanyak</SelectItem>
            </Select>
          </div>
        </div>
      </Card>

      {/* --- TABLE CARD --- */}
      <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl">
        <AppResourceTable data={filteredRoles} isLoading={isLoading} columns={columns} emptyMessage="Belum ada role yang dibuat." />
      </Card>

      {/* --- MODAL FORM (VISUAL PERMISSION CARD, TANPA FILTER DALAM MODAL) --- */}
      <Dialog open={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} static={true}>
        <DialogPanel className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl bg-white shadow-2xl">
          {/* Header Modal */}
          <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm border border-blue-100">{editingRole ? <FiEdit2 size={22} /> : <FiPlus size={22} />}</div>
              <div>
                <Title className="text-xl text-slate-800 font-bold">{editingRole ? "Edit Role" : "Role Baru"}</Title>
                <Text className="text-xs text-gray-500 mt-0.5">Konfigurasi profil dan hak akses secara detail.</Text>
              </div>
            </div>
            <Button icon={FiX} variant="light" color="slate" onClick={() => setIsModalOpen(false)} className="rounded-full hover:bg-gray-200 p-2" />
          </div>

          {/* Body Form (Scrollable) */}
          <div className="flex-grow overflow-y-auto p-8 bg-slate-50">
            <form id="role-form" onSubmit={handleFormSubmit} className="space-y-8">
              {/* SECTION 1: INFO DASAR */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                      Nama Role <span className="text-red-500">*</span>
                    </label>
                    <TextInput value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Contoh: Risk Officer" disabled={isSubmitting} className="hover:shadow-sm transition-shadow" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Deskripsi</label>
                    <TextInput value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Penjelasan singkat..." disabled={isSubmitting} />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PERMISSIONS (VISUAL CARD - TANPA FILTER) */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <FiShield className="text-blue-500" /> Hak Akses ({formData.permission_ids.length})
                  </h3>
                </div>

                {/* Permission Groups Grid */}
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([groupName, perms]) => {
                    if (perms.length === 0) return null;

                    const selectedCount = perms.filter((p) => formData.permission_ids.includes(String(p.id))).length;
                    const isAllSelected = selectedCount === perms.length;

                    return (
                      <div key={groupName} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Group Header */}
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                          <div className="flex items-center gap-2">
                            <Text className="font-bold text-slate-700">{groupName}</Text>
                            <Badge size="xs" color="blue" className="rounded-md px-2 py-1">
                              {selectedCount}/{perms.length}
                            </Badge>
                          </div>
                          <button type="button" onClick={() => handleSelectGroup(perms, !isAllSelected)} className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                            {isAllSelected ? "Deselect All" : "Select All"}
                          </button>
                        </div>

                        {/* Permission Items (Grid Card) */}
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {perms.map((perm) => {
                            const isSelected = formData.permission_ids.includes(String(perm.id));
                            return (
                              <div
                                key={perm.id}
                                onClick={() => handlePermissionToggle(perm.id)}
                                className={`
                                                            cursor-pointer p-3 rounded-lg border transition-all duration-200 flex items-start gap-3 select-none group
                                                            ${isSelected ? "bg-blue-50/50 border-blue-200 ring-1 ring-blue-100" : "bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm"}
                                                        `}
                              >
                                <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-transparent group-hover:bg-gray-200"}`}>
                                  <FiCheck size={14} strokeWidth={3} />
                                </div>
                                <div>
                                  <div className={`text-sm font-medium leading-snug ${isSelected ? "text-blue-800" : "text-slate-700"}`}>{perm.name}</div>
                                  {perm.description && (
                                    <div className="text-xs text-gray-400 mt-0.5 line-clamp-1" title={perm.description}>
                                      {perm.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-10">
            <Button variant="secondary" className="rounded-md" color="rose" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleFormSubmit} loading={isSubmitting} className="text-white bg-blue-600 hover:bg-blue-700 border-blue-600 shadow-lg shadow-blue-100 rounded-md">
              {editingRole ? "Simpan Perubahan" : "Buat Role"}
            </Button>
          </div>
        </DialogPanel>
      </Dialog>

      {/* --- CONFIRM DELETE --- */}
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: "" })}
        onConfirm={handleConfirmDelete}
        title="Hapus Role"
        message={`Yakin ingin menghapus role "${deleteConfirm.name}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default RolePermissionPage;
