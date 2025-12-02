// frontend/src/features/admin/components/rsca/QuestionnaireEditor.jsx

import React, { useState, useRef } from "react";
import { Card, Title, Text, Button, TextInput, Select, SelectItem, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge, Grid, Flex } from "@tremor/react";
import { FiArrowLeft, FiPlus, FiTrash2, FiSave, FiEdit, FiSettings, FiX, FiLoader, FiList, FiCheckCircle } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../../api/api";
import { toast } from "sonner";
import ConfirmationDialog from "../../../../components/common/ConfirmationDialog";

// --- API CALLS ---
const fetchQuestions = async (cycleId) => {
  const { data } = await apiClient.get(`/admin/rsca-cycles/${cycleId}/questionnaire`);
  return data;
};

const addQuestion = ({ cycleId, questionData }) => {
  return apiClient.post(`/admin/rsca-cycles/${cycleId}/questionnaire`, questionData);
};

const updateQuestion = ({ id, questionData }) => {
  return apiClient.put(`/admin/rsca-questionnaire/${id}`, questionData);
};

const deleteQuestion = (questionId) => {
  return apiClient.delete(`/admin/rsca-questionnaire/${questionId}`);
};

function QuestionnaireEditor({ cycle, onBack }) {
  const queryClient = useQueryClient();
  const [newPertanyaan, setNewPertanyaan] = useState("");
  const [newKategori, setNewKategori] = useState("");
  const [newType, setNewType] = useState("text");
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, questionId: null });
  const formRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const queryKey = ["rscaQuestions", cycle.id];

  const { data: questions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: queryKey,
    queryFn: () => fetchQuestions(cycle.id),
  });

  const resetForm = () => {
    setNewPertanyaan("");
    setNewKategori("");
    setNewType("text");
    setEditingQuestion(null);
  };

  const addMutation = useMutation({ mutationFn: addQuestion });
  const updateMutation = useMutation({ mutationFn: updateQuestion });
  const deleteMutation = useMutation({ mutationFn: deleteQuestion });

  const handleSaveOrUpdate = async () => {
    if (!newPertanyaan || !newType) {
      toast.warning("Pertanyaan dan tipe wajib diisi.");
      return;
    }

    const questionData = {
      pertanyaan: newPertanyaan,
      kategori: newKategori,
      question_type: newType,
    };

    setIsSaving(true);
    try {
      if (editingQuestion) {
        await updateMutation.mutateAsync({ id: editingQuestion.id, questionData });
        toast.success("Pertanyaan diperbarui.");
      } else {
        await addMutation.mutateAsync({ cycleId: cycle.id, questionData });
        toast.success("Pertanyaan ditambahkan.");
      }
      queryClient.invalidateQueries({ queryKey: queryKey });
      resetForm();
    } catch (err) {
      toast.error("Gagal menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (question) => {
    setEditingQuestion(question);
    setNewPertanyaan(question.pertanyaan);
    setNewKategori(question.kategori || "");
    setNewType(question.question_type);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const openDeleteConfirm = (questionId) => {
    setDeleteConfirm({ isOpen: true, questionId: questionId });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(deleteConfirm.questionId);
      toast.success("Pertanyaan dihapus.");
      queryClient.invalidateQueries({ queryKey: queryKey });
      setDeleteConfirm({ isOpen: false, questionId: null });
    } catch (err) {
      toast.error("Gagal menghapus.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen space-y-8">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="light" icon={FiArrowLeft} onClick={onBack} className="rounded-full p-2 hover:bg-slate-200" />
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
            <FiSettings size={28} />
          </div>
          <div>
            <Title className="text-2xl text-slate-800">Editor Kuesioner</Title>
            <Text className="text-slate-500">
              Atur pertanyaan untuk siklus: <span className="font-semibold text-blue-600">{cycle.nama_siklus}</span>
            </Text>
          </div>
        </div>
      </div>

      <Grid numItemsLg={3} className="gap-8 items-start">
        {/* --- KOLOM KIRI: DAFTAR PERTANYAAN --- */}
        <div className="lg:col-span-2">
          <Card className="border-t-4 border-blue-500 shadow-md ring-1 ring-gray-100">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
              <div className="p-1.5 bg-blue-50 rounded text-blue-600">
                <FiList size={18} />
              </div>
              <Title>Daftar Pertanyaan ({questions?.length || 0})</Title>
            </div>

            <Table className="mt-2">
              <TableHead>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHeaderCell className="text-center w-16 text-gray-500">No</TableHeaderCell>
                  <TableHeaderCell className="text-gray-500">Pertanyaan</TableHeaderCell>
                  <TableHeaderCell className="w-40 text-gray-500">Tipe</TableHeaderCell>
                  <TableHeaderCell className="text-right text-gray-500">Aksi</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingQuestions ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      <Flex justifyContent="center" className="gap-2 text-gray-400">
                        <FiLoader className="animate-spin" /> Memuat...
                      </Flex>
                    </TableCell>
                  </TableRow>
                ) : questions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-gray-400 italic">
                      Belum ada pertanyaan. Tambahkan di sebelah kanan.
                    </TableCell>
                  </TableRow>
                ) : (
                  questions?.map((q, index) => (
                    <TableRow key={q.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="text-center text-gray-500 font-medium">{index + 1}</TableCell>
                      <TableCell className="whitespace-normal">
                        <Text className="font-medium text-slate-700">{q.pertanyaan}</Text>
                        {q.kategori && <Text className="text-xs text-gray-400 mt-1">Kategori: {q.kategori}</Text>}
                      </TableCell>
                      <TableCell>
                        <Badge size="xs" className="rounded-md px-2" color={q.question_type === "text" ? "slate" : "blue"}>
                          {q.question_type === "text" ? "Teks Bebas" : "Penilaian Kontrol"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="xs" variant="light" icon={FiEdit} color="indigo" onClick={() => handleEditClick(q)} disabled={isSaving} />
                          <Button size="xs" variant="light" icon={FiTrash2} color="rose" onClick={() => openDeleteConfirm(q.id)} disabled={isSaving} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* --- KOLOM KANAN: FORM EDITOR --- */}
        <div className="lg:col-span-1 sticky top-6" ref={formRef}>
          <Card className={`shadow-lg ring-1 ring-gray-100 border-t-4 ${editingQuestion ? "border-amber-500" : "border-blue-500"}`}>
            <div className="flex items-center gap-2 mb-6">
              <div className={`p-2 rounded-lg ${editingQuestion ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>{editingQuestion ? <FiEdit size={20} /> : <FiPlus size={20} />}</div>
              <Title>{editingQuestion ? "Edit Pertanyaan" : "Tambah Baru"}</Title>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  Pertanyaan <span className="text-red-500">*</span>
                </label>
                <TextInput placeholder="Contoh: Apakah kontrol akses sudah diterapkan?" value={newPertanyaan} onValueChange={setNewPertanyaan} disabled={isSaving} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Kategori (Opsional)</label>
                <TextInput placeholder="Contoh: Keamanan Fisik" value={newKategori} onValueChange={setNewKategori} disabled={isSaving} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  Tipe Jawaban <span className="text-red-500">*</span>
                </label>
                <Select value={newType} onValueChange={setNewType} disabled={isSaving}>
                  <SelectItem value="text" icon={FiList}>
                    Teks Bebas
                  </SelectItem>
                  <SelectItem value="control_assessment" icon={FiCheckCircle}>
                    Penilaian Kontrol (Efektif/Tidak)
                  </SelectItem>
                </Select>
              </div>

              <div className="pt-4 flex gap-2">
                {editingQuestion && (
                  <Button icon={FiX} variant="secondary" color="slate" onClick={resetForm} disabled={isSaving} className="flex-1 rounded-md hover:bg-rose-600 hover:text-white">
                    Batal
                  </Button>
                )}
                <Button
                  icon={editingQuestion ? FiSave : FiPlus}
                  onClick={handleSaveOrUpdate}
                  loading={isSaving}
                  disabled={isSaving}
                  className={`flex-1 ${editingQuestion ? "bg-amber-500 hover:bg-amber-600 border-amber-500 text-white rounded-md" : "bg-blue-500 text-white rounded-md hover:bg-blue-700 hover:text-white border-blue-600"}`}
                >
                  {editingQuestion ? "Simpan Perubahan" : "Tambah Pertanyaan"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Grid>

      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, questionId: null })}
        onConfirm={handleConfirmDelete}
        title="Hapus Pertanyaan"
        message="Apakah Anda yakin ingin menghapus pertanyaan ini? Data jawaban terkait mungkin akan hilang."
        isLoading={isDeleting}
      />
    </div>
  );
}

export default QuestionnaireEditor;
