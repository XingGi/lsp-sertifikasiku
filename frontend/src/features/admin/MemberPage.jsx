// frontend/src/features/admin/MemberPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Card, Title, Text, Button, Badge, Dialog, DialogPanel, MultiSelect, MultiSelectItem, Select, SelectItem } from "@tremor/react";
import apiClient from "../../api/api";
import { FiUsers, FiEdit, FiSliders, FiSave, FiX, FiSearch, FiLoader, FiPlus, FiTrash2, FiCheckSquare, FiSquare, FiShield, FiFilter, FiBriefcase, FiHome, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import AppResourceTable from "../../components/common/AppResourceTable";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import EditUserModal from "./components/EditUserModal";
import AddUserModal from "./components/AddUserModal";
import { toast } from "sonner";

// --- MODAL BULK EDIT ---
const BulkEditRolesModal = ({ isOpen, onClose, selectedUsers, allRoles, onSave, isLoading }) => {
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  useEffect(() => {
    if (isOpen) setSelectedRoleIds([]);
  }, [isOpen]);

  const handleSave = () => {
    const userIds = selectedUsers.map((u) => u.id);
    onSave(userIds, selectedRoleIds.map(Number));
  };

  return (
    <Dialog open={isOpen} onClose={() => !isLoading && onClose()} static={true}>
      <DialogPanel className="max-w-lg p-0 overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg border border-indigo-200">
              <FiSliders size={20} />
            </div>
            <div>
              <Title className="text-lg font-bold text-slate-800">Bulk Edit Roles</Title>
              <Text className="text-xs text-gray-500">{selectedUsers.length} Users Selected</Text>
            </div>
          </div>
          <Button icon={FiX} variant="light" color="slate" onClick={onClose} disabled={isLoading} className="rounded-full hover:bg-gray-200" />
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Assign Roles <span className="text-red-500">*</span>
            </label>
            <MultiSelect value={selectedRoleIds} onValueChange={setSelectedRoleIds} placeholder="Pilih role..." className="w-full">
              {allRoles.map((role) => (
                <MultiSelectItem key={role.id} value={String(role.id)}>
                  {role.name}
                </MultiSelectItem>
              ))}
            </MultiSelect>
            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700 leading-relaxed">
              ⚠️ <strong>Perhatian:</strong> Roles yang Anda pilih di sini akan <strong>menggantikan seluruh role</strong> yang dimiliki user saat ini.
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" className="rounded-md" color="rose" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={handleSave} loading={isLoading} icon={FiSave} className="text-white bg-indigo-600 border-indigo-600 hover:bg-indigo-700 rounded-md">
            Terapkan
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

function MemberPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State UI
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State Filter & Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());

  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    total_pages: 1,
    total_items: 0,
    per_page: 10,
  });

  // State Bulk & Delete
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, userId: null, userName: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        apiClient.get("/admin/users", {
          params: {
            page: page,
            per_page: meta.per_page,
            search: searchTerm,
          },
        }),
        apiClient.get("/admin/roles"),
      ]);

      if (usersRes.data.data) {
        setUsers(usersRes.data.data);
        setMeta(usersRes.data.meta);
      } else {
        // Fallback jika backend belum update (masih array biasa)
        setUsers(usersRes.data);
      }

      setRoles(rolesRes.data);
    } catch (error) {
      toast.error("Gagal memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // --- FILTER & SORT ---
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    // 2. Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.nama_lengkap.localeCompare(b.nama_lengkap);
        case "name-desc":
          return b.nama_lengkap.localeCompare(a.nama_lengkap);
        case "inst-asc":
          return (a.institution || "").localeCompare(b.institution || "");
        case "dept-asc":
          return (a.department_name || "").localeCompare(b.department_name || "");
        default:
          return 0;
      }
    });

    return result;
  }, [users, sortOption]);

  // --- HANDLERS SELECTION ---
  const handleSelectUser = (userId, checked) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      checked ? newSet.add(userId) : newSet.delete(userId);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const currentPageUserIds = filteredAndSortedUsers.map((u) => u.id);

    // Cek apakah semua di halaman ini sudah terpilih
    const isPageAllSelected = currentPageUserIds.every((id) => selectedUserIds.has(id));

    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (isPageAllSelected) {
        // Unselect semua di halaman ini
        currentPageUserIds.forEach((id) => newSet.delete(id));
      } else {
        // Select semua di halaman ini
        currentPageUserIds.forEach((id) => newSet.add(id));
      }
      return newSet;
    });
  };

  const isAllSelected = filteredAndSortedUsers.length > 0 && selectedUserIds.size === filteredAndSortedUsers.length;
  const selectedUsersData = users.filter((u) => selectedUserIds.has(u.id));

  // --- HANDLERS MODAL ---
  const handleOpenEditModal = (userId) => {
    setEditingUserId(userId);
    setIsEditModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setIsBulkEditModalOpen(false);
    setIsAddModalOpen(false);
    setEditingUserId(null);
  };

  // --- HANDLERS DATA ---
  const handleSaveUserSuccess = (updatedUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };
  const handleAddUserSuccess = (newUser) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  // --- HANDLERS DELETE ---
  const handleDeleteClick = (userId, userName) => setDeleteConfirm({ isOpen: true, userId, userName });

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.userId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/admin/users/${deleteConfirm.userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteConfirm.userId));
      toast.success(`User "${deleteConfirm.userName}" dihapus.`);
      setDeleteConfirm({ isOpen: false, userId: null, userName: "" });
    } catch (error) {
      toast.error("Gagal menghapus user.");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- HANDLER BULK ---
  const handleBulkSaveRoles = async (userIds, newRoleIds) => {
    setIsSubmittingBulk(true);
    const payload = { role_ids: newRoleIds };
    let successCount = 0;

    for (const userId of userIds) {
      try {
        const res = await apiClient.put(`/admin/users/${userId}/roles`, payload);
        handleSaveUserSuccess(res.data.user);
        successCount++;
      } catch (error) {
        console.error(error);
      }
    }

    setIsSubmittingBulk(false);
    toast.success(`${successCount} user berhasil diupdate.`);
    handleCloseModal();
    setSelectedUserIds(new Set());
  };

  // --- COLUMNS ---
  const columns = [
    {
      key: "select",
      header: (
        <div className="flex justify-center">
          <button onClick={handleSelectAll} className="text-gray-400 hover:text-indigo-600 transition-colors">
            {isAllSelected ? <FiCheckSquare size={18} className="text-indigo-600" /> : <FiSquare size={18} />}
          </button>
        </div>
      ),
      cell: (user) => (
        <div className="flex justify-center">
          <input type="checkbox" checked={selectedUserIds.has(user.id)} onChange={(e) => handleSelectUser(user.id, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
        </div>
      ),
      className: "w-12 text-center",
    },
    {
      key: "name",
      header: "Profil Pengguna",
      cell: (user) => (
        <div>
          <Text className="font-bold text-slate-700">{user.nama_lengkap}</Text>
          <Text className="text-xs text-gray-400">{user.email}</Text>
        </div>
      ),
    },
    {
      key: "institution",
      header: "Institusi",
      cell: (user) => (
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <FiHome size={14} className="text-gray-400" />
          <span className="font-medium">{user.institution || "-"}</span>
        </div>
      ),
    },
    {
      key: "department",
      header: "Departemen",
      cell: (user) => (
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <FiBriefcase size={14} className="text-gray-400" />
          <span>{user.department_name || "-"}</span>
        </div>
      ),
    },
    {
      key: "roles",
      header: "Roles",
      cell: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles?.length > 0 ? (
            user.roles.map((r) => (
              <Badge key={r} size="xs" color={r.toLowerCase() === "admin" ? "rose" : "blue"} icon={r.toLowerCase() === "admin" ? FiShield : null} className="rounded-md px-2 py-1">
                {r}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic bg-gray-50 px-2 py-0.5 rounded-full">No Roles</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (user) => (
        <div className="flex justify-end gap-2">
          <Button size="xs" variant="light" icon={FiEdit} color="indigo" onClick={() => handleOpenEditModal(user.id)} title="Edit" />
          <Button size="xs" variant="light" icon={FiTrash2} color="rose" onClick={() => handleDeleteClick(user.id, user.nama_lengkap)} disabled={user.email.toLowerCase() === "admin@admin.com"} title="Hapus" />
        </div>
      ),
      className: "text-right w-32",
    },
  ];

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600 shadow-sm">
            <FiUsers size={28} />
          </div>
          <div>
            <Title className="text-2xl text-slate-800">Member Management</Title>
            <Text className="text-slate-500">Kelola pengguna, institusi, departemen, dan hak akses.</Text>
          </div>
        </div>
        <Button size="lg" icon={FiPlus} onClick={() => setIsAddModalOpen(true)} className="shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all rounded-xl">
          Tambah User
        </Button>
      </div>

      {/* --- FILTER BAR --- */}
      <Card className="p-4 shadow-sm border border-gray-100 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-grow w-full md:w-auto">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama, email, atau institusi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className="w-full md:w-56 flex-shrink-0">
            <Select value={sortOption} onValueChange={setSortOption} icon={FiFilter} placeholder="Urutkan..." className="h-[42px]">
              <SelectItem value="name-asc">Nama (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nama (Z-A)</SelectItem>
              <SelectItem value="inst-asc">Institusi (A-Z)</SelectItem>
              <SelectItem value="dept-asc">Departemen (A-Z)</SelectItem>
            </Select>
          </div>

          {/* Bulk Action */}
          {selectedUserIds.size > 0 && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
              <Button size="md" variant="secondary" color="indigo" icon={FiSliders} onClick={() => setIsBulkEditModalOpen(true)} className="shadow-sm">
                Bulk Edit ({selectedUserIds.size})
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* --- TABLE CARD --- */}
      <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl min-h-[500px] flex flex-col">
        <div className="flex-grow">
          <AppResourceTable data={filteredAndSortedUsers} isLoading={isLoading} columns={columns} emptyMessage="Tidak ada pengguna ditemukan." />
        </div>

        {/* --- FOOTER PAGINATION BARU --- */}
        {!isLoading && meta.total_items > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-500">
              Menampilkan{" "}
              <span className="font-bold text-slate-700">
                {(page - 1) * meta.per_page + 1} - {Math.min(page * meta.per_page, meta.total_items)}
              </span>{" "}
              dari <span className="font-bold text-slate-700">{meta.total_items}</span> user
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft size={18} />
              </button>

              {/* Indikator Halaman Sederhana */}
              <span className="text-sm font-medium text-slate-600 px-2">
                Halaman {page} dari {meta.total_pages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
                disabled={page === meta.total_pages}
                className="p-2 rounded-lg border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* --- MODALS --- */}
      <AddUserModal isOpen={isAddModalOpen} onClose={handleCloseModal} allRoles={roles} onSaveSuccess={handleAddUserSuccess} />
      <EditUserModal isOpen={isEditModalOpen} onClose={handleCloseModal} userId={editingUserId} allRoles={roles} onSaveSuccess={handleSaveUserSuccess} />

      {selectedUsersData.length > 0 && <BulkEditRolesModal isOpen={isBulkEditModalOpen} onClose={handleCloseModal} selectedUsers={selectedUsersData} allRoles={roles} onSave={handleBulkSaveRoles} isLoading={isSubmittingBulk} />}

      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, userId: null, userName: "" })}
        onConfirm={handleConfirmDelete}
        title="Hapus User"
        message={`Yakin ingin menghapus user "${deleteConfirm.userName}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default MemberPage;
