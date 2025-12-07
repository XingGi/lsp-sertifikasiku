// frontend/src/features/admin/competency/components/UnitSelectionWidget.jsx
import React, { useState, useMemo } from "react";
import { TextInput, Badge, Text } from "@tremor/react";
import { FiSearch, FiCheckSquare, FiSquare } from "react-icons/fi";

export default function UnitSelectionWidget({ allUnits, selectedUnitIds, onChange }) {
  const [search, setSearch] = useState("");

  // Filter unit berdasarkan search (Client side filtering biar cepet di modal)
  const filteredUnits = useMemo(() => {
    if (!search) return allUnits;
    const lower = search.toLowerCase();
    return allUnits.filter((u) => u.code.toLowerCase().includes(lower) || u.title.toLowerCase().includes(lower));
  }, [allUnits, search]);

  const handleToggle = (unitId) => {
    const newSelection = selectedUnitIds.includes(unitId)
      ? selectedUnitIds.filter((id) => id !== unitId) // Uncheck
      : [...selectedUnitIds, unitId]; // Check
    onChange(newSelection);
  };

  const handleSelectAllFiltered = () => {
    const idsToAdd = filteredUnits.map((u) => u.id);
    // Gabungkan yang sudah dipilih dengan hasil filter, hilangkan duplikat
    const newSet = new Set([...selectedUnitIds, ...idsToAdd]);
    onChange(Array.from(newSet));
  };

  const handleClearFiltered = () => {
    const idsToRemove = filteredUnits.map((u) => u.id);
    const newSelection = selectedUnitIds.filter((id) => !idsToRemove.includes(id));
    onChange(newSelection);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[400px]">
      {/* Header Widget */}
      <div className="bg-gray-50 p-3 border-b border-gray-200 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Text className="font-bold text-gray-700">Pilih Unit Kompetensi</Text>
          <Badge className="rounded-md px-3 py-1" color="indigo">
            {selectedUnitIds.length} Dipilih
          </Badge>
        </div>
        <TextInput icon={FiSearch} placeholder="Cari kode atau judul unit..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex gap-2 text-xs">
          <button type="button" onClick={handleSelectAllFiltered} className="text-indigo-600 hover:underline font-medium">
            Pilih Semua ({filteredUnits.length})
          </button>
          <span className="text-gray-300">|</span>
          <button type="button" onClick={handleClearFiltered} className="text-rose-600 hover:underline font-medium">
            Hapus Pilihan
          </button>
        </div>
      </div>

      {/* List Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-2 bg-white custom-scrollbar">
        {filteredUnits.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">Unit tidak ditemukan.</div>
        ) : (
          <div className="space-y-1">
            {filteredUnits.map((unit) => {
              const isSelected = selectedUnitIds.includes(unit.id);
              return (
                <div
                  key={unit.id}
                  onClick={() => handleToggle(unit.id)}
                  className={`
                                cursor-pointer p-3 rounded-lg border transition-all flex items-start gap-3
                                ${isSelected ? "bg-indigo-50 border-indigo-200 shadow-sm" : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"}
                            `}
                >
                  <div className={`mt-1 ${isSelected ? "text-indigo-600" : "text-gray-300"}`}>{isSelected ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{unit.code}</span>
                      <span className="text-[10px] text-gray-400 px-1 border border-gray-100 rounded">{unit.standard_type}</span>
                    </div>
                    <p className={`text-sm font-medium leading-snug ${isSelected ? "text-indigo-900" : "text-gray-700"}`}>{unit.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
