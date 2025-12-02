// frontend/src/features/account/PasswordSettingPage.jsx

import React, { useState } from "react";
import { Card, Title, Text, TextInput, Button, Flex } from "@tremor/react";
import { FiLock, FiSave, FiAlertCircle, FiCheckCircle, FiKey } from "react-icons/fi";
import apiClient from "../../api/api";
import { toast } from "sonner";

function PasswordSettingPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Semua field wajib diisi.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Password baru dan konfirmasi tidak cocok.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await apiClient.put("/account/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      });

      setSuccessMessage(response.data.msg || "Password berhasil diperbarui!");
      toast.success("Password berhasil diperbarui!");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Gagal memperbarui password.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen space-y-8">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-rose-100 rounded-xl text-rose-600 shadow-sm">
          <FiLock size={28} />
        </div>
        <div>
          <Title className="text-2xl text-slate-800">Password Setting</Title>
          <Text className="text-slate-500">Perbarui kata sandi akun Anda secara berkala.</Text>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="border-t-4 border-rose-500 shadow-lg ring-1 ring-gray-100 bg-white p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <FiKey size={20} />
            </div>
            <Title className="text-lg font-bold text-slate-800">Ganti Password</Title>
          </div>

          {/* Pesan Error / Sukses Inline */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
              <FiAlertCircle className="text-red-600 mt-0.5 shrink-0" />
              <Text className="text-red-700 text-sm">{error}</Text>
            </div>
          )}
          {successMessage && (
            <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-start gap-3">
              <FiCheckCircle className="text-emerald-600 mt-0.5 shrink-0" />
              <Text className="text-emerald-700 text-sm">{successMessage}</Text>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Old Password */}
            <div className="group">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block group-hover:text-rose-600 transition-colors">Password Lama</label>
              <TextInput type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Masukkan password lama..." required icon={FiLock} className="transition-shadow hover:shadow-sm" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* New Password */}
              <div className="group">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block group-hover:text-rose-600 transition-colors">Password Baru</label>
                <TextInput type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 karakter" required icon={FiLock} />
              </div>

              {/* Confirm Password */}
              <div className="group">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block group-hover:text-rose-600 transition-colors">Konfirmasi Password</label>
                <TextInput
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  required
                  icon={FiLock}
                  error={newPassword && confirmPassword && newPassword !== confirmPassword}
                  errorMessage="Password tidak cocok"
                />
              </div>
            </div>

            <div className="pt-6 mt-2 border-t border-gray-100 flex justify-end">
              <Button
                type="submit"
                icon={FiSave}
                loading={isSaving}
                disabled={isSaving}
                size="lg"
                className="text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all rounded-xl bg-rose-600 hover:bg-rose-700 border-rose-600"
              >
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default PasswordSettingPage;
