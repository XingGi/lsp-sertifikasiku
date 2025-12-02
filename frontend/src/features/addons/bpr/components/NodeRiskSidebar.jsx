// frontend/src/features/bpr/components/NodeRiskSidebar.jsx

import React, { useState, useEffect } from "react";
import { Title, Text, Button, TextInput, Textarea, Select, SelectItem, Badge } from "@tremor/react";
import { FiX, FiPlus, FiTrash2, FiSave, FiAlertTriangle, FiCheckCircle, FiXCircle, FiMessageSquare, FiEdit3 } from "react-icons/fi";
import apiClient from "../../../../api/api";
import { toast } from "sonner";
import { useAuth } from "../../../../context/AuthContext";

export default function NodeRiskSidebar({ isOpen, onClose, selectedNode, onDataChange, onLabelChange }) {
  const { user } = useAuth();
  const [risks, setRisks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nodeLabel, setNodeLabel] = useState("");

  const [newRisk, setNewRisk] = useState({
    risk_description: "",
    risk_cause: "",
    risk_impact: "",
    existing_control: "",
    inherent_risk_level: "Low",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [reviewNotes, setReviewNotes] = useState({});

  // Permission Check
  const isReviewer = user?.role === "Admin" || user?.permissions?.includes("approve_bpr");

  useEffect(() => {
    if (isOpen && selectedNode) {
      setNodeLabel(selectedNode.data?.label || "");
      if (selectedNode.db_id) {
        fetchRisks(selectedNode.db_id);
      } else {
        setRisks([]);
      }
      setIsAdding(false);
    }
  }, [selectedNode, isOpen]);

  const handleLabelChange = (e) => setNodeLabel(e.target.value);

  const handleLabelBlur = () => {
    if (selectedNode && onLabelChange) {
      onLabelChange(selectedNode.id, nodeLabel);
    }
  };

  const fetchRisks = async (nodeId) => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/bpr/nodes-db/${nodeId}/risks`);
      setRisks(res.data);
      const notesInit = {};
      res.data.forEach((r) => {
        notesInit[r.id] = r.reviewer_notes || "";
      });
      setReviewNotes(notesInit);
    } catch (error) {
      toast.error("Gagal memuat risiko.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRisk = async () => {
    if (!newRisk.risk_description) {
      toast.error("Deskripsi wajib diisi.");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post(`/bpr/nodes-db/${selectedNode.db_id}/risks`, newRisk);
      toast.success("Risiko ditambahkan.");
      setIsAdding(false);
      setNewRisk({ risk_description: "", risk_cause: "", risk_impact: "", existing_control: "", inherent_risk_level: "Low" });
      fetchRisks(selectedNode.db_id);
      onDataChange();
    } catch (error) {
      toast.error("Gagal menyimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRisk = async (riskId) => {
    if (!confirm("Hapus risiko ini?")) return;
    try {
      await apiClient.delete(`/bpr/risks/${riskId}`);
      toast.success("Terhapus.");
      fetchRisks(selectedNode.db_id);
      onDataChange();
    } catch (error) {
      toast.error("Gagal menghapus.");
    }
  };

  const handleApproval = async (riskId, status) => {
    const note = reviewNotes[riskId] || "";
    if (status === "Rejected" && !note.trim()) {
      toast.error("Berikan catatan penolakan.");
      return;
    }
    try {
      await apiClient.put(`/bpr/risks/${riskId}`, { approval_status: status, reviewer_notes: note });
      toast.success(`Status: ${status}`);
      fetchRisks(selectedNode.db_id);
    } catch (error) {
      toast.error("Gagal update status.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return { color: "emerald", icon: FiCheckCircle, text: "Approved" };
      case "Rejected":
        return { color: "rose", icon: FiXCircle, text: "Rejected" };
      default:
        return { color: "slate", icon: FiAlertTriangle, text: "Draft" };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-200 bg-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-700">
          <FiEdit3 />
          <span className="font-bold text-sm uppercase tracking-wide">Detail Langkah</span>
        </div>
        <Button icon={FiX} variant="light" color="slate" onClick={onClose} className="rounded-full hover:bg-gray-200 p-1" />
      </div>

      {/* LABEL EDITOR */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Nama Langkah</label>
        <TextInput value={nodeLabel} onChange={handleLabelChange} onBlur={handleLabelBlur} placeholder="Contoh: Verifikasi Dokumen" className="font-semibold text-slate-800 border-slate-200 focus:border-blue-500" />
      </div>

      {/* CONTENT */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {!selectedNode?.db_id ? (
          <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 text-sm flex gap-3 items-start">
            <FiAlertTriangle className="shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">Belum Disimpan</span>
              Simpan diagram terlebih dahulu untuk mulai menambahkan risiko.
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Daftar Risiko ({risks.length})</h3>
            </div>

            {/* RISK LIST */}
            <div className="space-y-4">
              {isLoading ? (
                <Text className="text-center py-4 text-gray-400 italic">Memuat data...</Text>
              ) : risks.length === 0 && !isAdding ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                  <FiCheckCircle className="mx-auto mb-2 w-8 h-8 text-gray-300" />
                  <Text className="text-gray-400 text-sm">Belum ada risiko teridentifikasi.</Text>
                </div>
              ) : (
                risks.map((risk) => {
                  const statusInfo = getStatusBadge(risk.approval_status);
                  const borderColor = risk.approval_status === "Rejected" ? "border-rose-500" : risk.approval_status === "Approved" ? "border-emerald-500" : "border-slate-300";

                  return (
                    <div key={risk.id} className={`bg-white p-4 rounded-lg border-l-4 shadow-sm relative group ${borderColor} hover:shadow-md transition-shadow`}>
                      {/* Delete Button */}
                      {(isReviewer || risk.approval_status !== "Approved") && (
                        <button onClick={() => handleDeleteRisk(risk.id)} className="absolute top-2 right-2 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                          <FiTrash2 size={14} />
                        </button>
                      )}

                      {/* Badges */}
                      <div className="flex gap-2 mb-3">
                        <Badge size="xs" className="rounded-md px-2 py-1" color={risk.inherent_risk_level === "High" ? "rose" : "orange"}>
                          {risk.inherent_risk_level}
                        </Badge>
                        <Badge size="xs" className="rounded-md px-2 py-1" color={statusInfo.color} icon={statusInfo.icon}>
                          {statusInfo.text}
                        </Badge>
                      </div>

                      <Text className="font-bold text-slate-800 text-sm mb-3 leading-relaxed">{risk.risk_description}</Text>

                      {/* --- PERBAIKAN TAMPILAN SEBAB & AKIBAT (Block Layout) --- */}
                      <div className="text-xs bg-gray-50 p-3 rounded border border-gray-100 space-y-2 text-slate-600">
                        {risk.risk_cause && (
                          <div>
                            <span className="font-bold text-gray-500 uppercase text-[10px] block mb-0.5">Sebab:</span>
                            <span className="leading-relaxed">{risk.risk_cause}</span>
                          </div>
                        )}
                        {risk.risk_impact && (
                          <div className="pt-2 border-t border-gray-200">
                            <span className="font-bold text-gray-500 uppercase text-[10px] block mb-0.5">Akibat:</span>
                            <span className="leading-relaxed">{risk.risk_impact}</span>
                          </div>
                        )}
                      </div>

                      {/* Reviewer Section */}
                      {isReviewer && (
                        <div className="mt-3 pt-3 border-t border-gray-100 bg-slate-50/50 -mx-4 -mb-4 p-3 rounded-b-lg">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 mb-1 uppercase">
                            <FiMessageSquare /> Reviewer Action
                          </div>
                          <Textarea placeholder="Catatan..." className="text-xs mb-2 min-h-[50px] bg-white" value={reviewNotes[risk.id] || ""} onChange={(e) => setReviewNotes((prev) => ({ ...prev, [risk.id]: e.target.value }))} />
                          <div className="flex gap-2 justify-end">
                            <Button size="xs" className="rounded-md" variant="secondary" color="rose" onClick={() => handleApproval(risk.id, "Rejected")}>
                              Tolak
                            </Button>
                            <Button size="xs" className="rounded-md" color="emerald" onClick={() => handleApproval(risk.id, "Approved")}>
                              Setuju
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Reviewer Note for User */}
                      {!isReviewer && risk.reviewer_notes && (
                        <div className="mt-2 text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-100">
                          <span className="font-bold">Note:</span> {risk.reviewer_notes}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* FORM TAMBAH RISIKO */}
            {isAdding ? (
              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-md ring-2 ring-blue-50">
                <h4 className="text-sm font-bold text-blue-800 mb-3">Risiko Baru</h4>
                <div className="space-y-4">
                  {" "}
                  {/* Tambah spacing */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Deskripsi</label>
                    <Textarea placeholder="Deskripsi risiko..." rows={2} value={newRisk.risk_description} onChange={(e) => setNewRisk({ ...newRisk, risk_description: e.target.value })} />
                  </div>
                  {/* --- PERBAIKAN LAYOUT FORM (Grid atau Stack) --- */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Sebab (Cause)</label>
                      <TextInput placeholder="..." value={newRisk.risk_cause} onChange={(e) => setNewRisk({ ...newRisk, risk_cause: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Akibat (Impact)</label>
                      <TextInput placeholder="..." value={newRisk.risk_impact} onChange={(e) => setNewRisk({ ...newRisk, risk_impact: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Level</label>
                    <Select value={newRisk.inherent_risk_level} onValueChange={(val) => setNewRisk({ ...newRisk, inherent_risk_level: val })}>
                      {["Low", "Medium", "High", "Extreme"].map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 mt-2">
                    <Button size="xs" variant="secondary" className="rounded-md" color="rose" onClick={() => setIsAdding(false)}>
                      Batal
                    </Button>
                    <Button size="xs" className="rounded-md" color="emerald" loading={isSubmitting} onClick={handleAddRisk}>
                      Simpan
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full py-3 border-2 border-dashed border-blue-200 rounded-lg text-blue-500 font-medium text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center justify-center gap-2"
              >
                <FiPlus /> Tambah Risiko
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
