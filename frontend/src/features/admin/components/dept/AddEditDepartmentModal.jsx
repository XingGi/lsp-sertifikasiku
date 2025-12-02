// frontend/src/features/admin/components/dept/AddEditDepartmentModal.jsx

import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, Title, Text, Button, TextInput } from "@tremor/react";
import { FiX, FiBriefcase, FiEdit, FiPlus } from "react-icons/fi";

function AddEditDepartmentModal({ isOpen, onClose, onSave, department, isLoading }) {
  const [name, setName] = useState("");
  const isEditMode = !!department;

  // Efek untuk mengisi form saat mode 'Edit'
  useEffect(() => {
    if (department) {
      setName(department.name);
    } else {
      setName(""); // Reset saat mode 'Tambah'
    }
  }, [department, isOpen]);

  const handleSubmit = () => {
    const data = { name };
    if (department) {
      data.id = department.id;
    }
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onClose={() => !isLoading && onClose()} static={true}>
      <DialogPanel className="max-w-lg p-0 overflow-hidden rounded-xl bg-white shadow-xl transform transition-all">
        {/* --- HEADER --- */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl shadow-sm border ${isEditMode ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}>{isEditMode ? <FiEdit size={22} /> : <FiPlus size={22} />}</div>
            <div>
              <Title className="text-xl text-slate-800 font-bold">{isEditMode ? "Edit Departemen" : "Departemen Baru"}</Title>
              <Text className="text-xs text-gray-500 mt-0.5">{isEditMode ? "Perbarui informasi departemen." : "Tambahkan unit kerja baru ke sistem."}</Text>
            </div>
          </div>
          <Button icon={FiX} variant="light" color="slate" onClick={onClose} disabled={isLoading} className="rounded-full hover:bg-gray-200 p-2" />
        </div>

        {/* --- BODY FORM --- */}
        <div className="p-8">
          <div className="group">
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 transition-colors ${isEditMode ? "text-gray-500 group-hover:text-indigo-600" : "text-gray-500 group-hover:text-blue-600"}`}>
              <div className="flex items-center gap-1.5">
                <FiBriefcase size={14} /> Nama Departemen <span className="text-red-500">*</span>
              </div>
            </label>
            <TextInput placeholder="Contoh: Keuangan, IT, Sumber Daya Manusia" value={name} onValueChange={setName} disabled={isLoading} className="hover:shadow-sm transition-shadow" />
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" className="text-white bg-rose-300 rounded-md hover:bg-rose-500" color="slate" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isLoading}
            className={`shadow-lg border-transparent ${isEditMode ? "text-white bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 rounded-md" : "text-white bg-blue-600 hover:bg-blue-700 shadow-blue-200 rounded-md"}`}
          >
            {isEditMode ? "Simpan Perubahan" : "Simpan Departemen"}
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default AddEditDepartmentModal;
