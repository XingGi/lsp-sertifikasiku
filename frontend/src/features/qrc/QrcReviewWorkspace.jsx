// frontend/src/features/qrc/QrcReviewWorkspace.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSave, FiCpu, FiCheckCircle, FiFileText, FiZap, FiPrinter, FiEdit3, FiUserCheck, FiAlertTriangle, FiSliders, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { toast } from "sonner";
import { qrcService } from "./api/qrcService";
import QrcAiSuccessModal from "./components/QrcAiSuccessModal";

const QrcReviewWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [questionsMap, setQuestionsMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");

  const [notes, setNotes] = useState("");
  const [finalReport, setFinalReport] = useState("");
  const [status, setStatus] = useState("submitted");

  const [manualScore, setManualScore] = useState(0);
  const [manualLevel, setManualLevel] = useState("High Risk");

  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    if (id) fetchDetailAndQuestions();
  }, [id]);

  const calculateLevel = (score) => {
    if (score >= 80) return "Low Risk (Optimized)";
    if (score >= 50) return "Medium Risk (Managed)";
    return "High Risk (Vulnerable)";
  };

  const fetchDetailAndQuestions = async () => {
    try {
      setLoading(true);

      // 1. Ambil Detail Asesmen
      const data = await qrcService.getAssessmentDetail(id);
      setAssessment(data);
      setNotes(data.consultant_notes || "");
      setFinalReport(data.final_report_content || "");
      setStatus(data.status);

      setManualScore(data.risk_score || 0);
      setManualLevel(data.risk_level || "High Risk (Vulnerable)");

      if (data.status === "submitted") setStatus("in_review");

      const qData = await qrcService.getConsultantQuestionsReference(data.assessment_type || "standard");
      const map = {};

      if (Array.isArray(qData)) {
        qData.forEach((q) => {
          map[String(q.id)] = q;
        });
      }
      setQuestionsMap(map);
    } catch (error) {
      console.error("Error loading workspace:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    setManualScore(val);
    setManualLevel(calculateLevel(val));
  };

  const handleSave = async (newStatus = null) => {
    setSaving(true);
    try {
      const payload = {
        consultant_notes: notes,
        final_report_content: finalReport,
        status: newStatus || status,
        risk_score: manualScore,
        risk_level: manualLevel,
      };

      await qrcService.updateReview(id, payload);

      if (newStatus) setStatus(newStatus);

      setAssessment((prev) => ({ ...prev, risk_score: manualScore, risk_level: manualLevel }));
      toast.success("Berhasil disimpan!");
    } catch (error) {
      toast.error("Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    setGeneratingAI(true);
    setLoadingStep("Memulai analisis AI...");

    const timers = [
      setTimeout(() => setLoadingStep("Menganalisis pola jawaban responden..."), 1500),
      setTimeout(() => setLoadingStep("Mengidentifikasi risiko kritikal & kelemahan..."), 3500),
      setTimeout(() => setLoadingStep("Menyusun draf laporan strategis..."), 6000),
    ];

    try {
      const result = await qrcService.generateAIAnalysis(id);
      const newContent = result.analysis;

      setFinalReport((prev) => (prev ? prev + "\n\n--- [AI GENERATED ANALYSIS] ---\n\n" + newContent : newContent));

      setGeneratingAI(false);
      setShowAiModal(true);
      toast.success("Analisis AI berhasil dibuat!");
    } catch (error) {
      toast.error("Gagal generate AI.");
      setGeneratingAI(false);
    } finally {
      timers.forEach(clearTimeout);
    }
  };

  const handleExportPDF = () => {
    if (!assessment) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return alert("Popup blocked. Please allow popups for this site.");

    const scoreToPrint = assessment.assessment_type === "essay" ? manualScore : assessment.risk_score;
    const levelToPrint = assessment.assessment_type === "essay" ? manualLevel : assessment.risk_level;
    const reportContent = finalReport ? finalReport.replace(/\n/g, "<br>") : "<p><em>Belum ada analisis final.</em></p>";

    // 3. Tulis Dokumen HTML yang Rapi
    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Risiko - ${assessment.client_name}</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; padding: 40px; max-width: 800px; mx-auto; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #1a202c; font-size: 24px; }
            .header p { color: #718096; font-size: 14px; margin-top: 5px; }
            .meta-table { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
            .meta-table td { padding: 8px; border-bottom: 1px solid #f0f0f0; }
            .meta-label { font-weight: bold; color: #4a5568; width: 150px; }
            .score-box { background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 30px; text-align: center; border: 1px solid #e2e8f0; }
            .score-val { font-size: 32px; font-weight: bold; color: #2d3748; }
            .score-lvl { font-size: 14px; color: #4a5568; font-weight: bold; text-transform: uppercase; }
            .content-section { margin-top: 30px; }
            .content-section h2 { font-size: 18px; border-left: 4px solid #4c51bf; padding-left: 10px; margin-bottom: 15px; color: #2d3748; }
            .report-body { white-space: pre-wrap; font-family: 'Georgia', serif; font-size: 14px; text-align: justify; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #eee; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LAPORAN QUICK RISK CHECK</h1>
            <p>Generated by SIRICO Risk Management System</p>
          </div>

          <table class="meta-table">
            <tr><td class="meta-label">Nama Klien</td><td>${assessment.client_name}</td></tr>
            <tr><td class="meta-label">Institusi</td><td>${assessment.institution || "-"}</td></tr>
            <tr><td class="meta-label">Tanggal</td><td>${new Date(assessment.submission_date + "Z").toLocaleDateString("id-ID", { dateStyle: "full" })}</td></tr>
            <tr><td class="meta-label">Tipe Asesmen</td><td style="text-transform:capitalize">${assessment.assessment_type}</td></tr>
          </table>

          <div class="score-box">
            <div class="score-val">${scoreToPrint} / 100</div>
            <div class="score-lvl">${levelToPrint}</div>
          </div>

          <div class="content-section">
            <h2>Analisis & Rekomendasi Ahli</h2>
            <div class="report-body">${reportContent}</div>
          </div>

          <div class="footer">
            Dokumen ini bersifat rahasia dan hanya untuk kalangan internal.<br/>
            Dicetak pada: ${new Date().toLocaleString("id-ID")}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // 4. Trigger Print (User bisa pilih Save as PDF)
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Helper Aman untuk Ambil Data Pertanyaan
  const getQuestionData = (qId) => {
    return questionsMap[String(qId)];
  };

  // Helper Label Jawaban
  const getAnswerLabel = (question, val) => {
    if (!question?.options) return val;
    const opt = question.options.find((o) => o.value == val);
    return opt ? opt.label : val;
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500 font-medium">Memuat ruang kerja...</div>;
  if (!assessment) return <div className="flex items-center justify-center h-screen text-red-500 font-medium">Data tidak ditemukan.</div>;

  const FullscreenEditor = () => {
    if (!isEditorOpen) return null;

    return (
      <div className="fixed inset-0 z-[80] bg-white flex flex-col animate-fadeIn">
        {/* Toolbar Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FiEdit3 /> Editor Laporan Final
            </h2>
            <p className="text-xs text-gray-500">Mode layar penuh untuk penulisan leluasa.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsEditorOpen(false)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md transition-all">
              <FiCheckCircle /> Selesai & Tutup
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-8 bg-gray-50 overflow-hidden flex justify-center">
          <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl border border-gray-200 flex flex-col overflow-hidden h-full">
            {/* Simple Toolbar (Visual Only for now, or implement real rich text if needed) */}
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex gap-2 overflow-x-auto">
              {/* Tombol dummy agar terlihat seperti editor profesional */}
              <div className="flex gap-1 border-r border-gray-300 pr-2">
                <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600 font-bold">B</button>
                <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600 italic">I</button>
                <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600 underline">U</button>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600 text-xs">• List</button>
                <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600 text-xs">1. List</button>
              </div>
            </div>

            <textarea
              className="flex-1 w-full p-8 text-base border-none outline-none resize-none font-serif leading-relaxed text-gray-800"
              placeholder="Tulis laporan lengkap di sini..."
              value={finalReport}
              onChange={(e) => setFinalReport(e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-20 flex justify-between items-center">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate("/qrc/consultant")} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <FiArrowLeft size={22} />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <FiUserCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">{assessment.client_name}</h1>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${assessment.assessment_type === "essay" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                  {assessment.assessment_type === "essay" ? "Essay" : "Standard"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 font-medium flex items-center gap-2">
                {assessment.institution || "Institusi -"} <span className="text-gray-300">•</span>{" "}
                {new Date(assessment.submission_date + "Z").toLocaleString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right mr-4 hidden md:block">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Status</p>
            <span className={`font-bold text-sm ${status === "completed" ? "text-emerald-600" : "text-indigo-600"}`}>{status === "completed" ? "Selesai" : status === "in_review" ? "Sedang Review" : "Baru"}</span>
          </div>

          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 hover:text-gray-900 active:scale-95 transition-all"
          >
            <FiSave size={14} /> {saving ? "Saving..." : "Draft"}
          </button>

          <button
            onClick={() => handleSave("completed")}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <FiCheckCircle size={14} /> Finalisasi
          </button>
        </div>
      </div>

      {/* --- MAIN WORKSPACE --- */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* LEFT PANEL: Jawaban User */}
        <div className="w-1/2 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
              <FiFileText className="text-indigo-600" /> Jawaban Responden
            </h3>
            {assessment.assessment_type === "standard" && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Skor:</span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${assessment.risk_score >= 80 ? "bg-emerald-100 text-emerald-700" : assessment.risk_score >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                  {assessment.risk_score} ({assessment.risk_level})
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {Object.entries(assessment.answers_data || {}).map(([qId, val], idx) => {
              const question = getQuestionData(qId);

              // Handling Data Lama (ID Mismatch)
              if (!question) {
                return (
                  <div key={qId} className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                    <div className="flex gap-3 items-start">
                      <FiAlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-amber-700 font-bold mb-1">Pertanyaan ID: {qId} (Data Legacy)</p>
                        <p className="text-[10px] text-amber-600 mb-1">ID ini tidak ditemukan di database pertanyaan saat ini.</p>
                        <div className="p-2 bg-white rounded border border-amber-200 text-xs font-mono text-gray-600">Jawaban Raw: {String(val)}</div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={qId} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-[10px]">{idx + 1}</span>
                    <div className="flex-1">
                      {question.category && <span className="inline-block px-2 py-0.5 mb-2 rounded text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200">{question.category}</span>}
                      <p className="text-sm font-medium text-gray-800 mb-3 leading-relaxed">{question.text}</p>

                      {assessment.assessment_type === "essay" ? (
                        <div className="p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-serif leading-relaxed">{val}</div>
                      ) : (
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${val >= 10 ? "bg-emerald-500" : val >= 5 ? "bg-amber-500" : "bg-red-500"}`}></span>
                            <span className="text-sm font-bold text-indigo-700">{getAnswerLabel(question, val)}</span>
                          </div>
                          <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 font-mono font-bold">Poin: {val}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL: Consultant Tools */}
        <div className="w-1/2 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
          {/* 1. PENILAIAN MANUAL (Hanya Muncul jika Essay) */}
          {assessment.assessment_type === "essay" && (
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
              <h3 className="font-bold text-amber-700 flex items-center gap-2 text-sm mb-4">
                <FiSliders /> Penilaian Ahli (Manual)
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Skor Risiko (0-100)</label>
                  <input type="range" min="0" max="100" step="5" value={manualScore} onChange={handleScoreChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600" />
                </div>
                <div className="text-center w-24">
                  <div className="text-2xl font-bold text-gray-800">{manualScore}</div>
                  <div className="text-[10px] font-bold text-amber-600 uppercase">{manualLevel.split(" ")[0]}</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 italic">*Geser slider untuk menentukan tingkat risiko berdasarkan analisis kualitatif Anda.</p>
            </div>
          )}
          {/* AI Assistant */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-5 relative overflow-hidden group flex-shrink-0">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <FiCpu size={70} className="text-indigo-600" />
            </div>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <h3 className="font-bold text-indigo-900 flex items-center gap-2 text-sm">
                  <FiCpu /> AI Risk Assistant
                </h3>
                <p className="text-xs text-indigo-500 mt-0.5">Generate analisis otomatis.</p>
              </div>
              <button onClick={handleGenerateAI} disabled={generatingAI} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md active:scale-95 transition-all">
                <FiZap /> {generatingAI ? "..." : "Generate"}
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <FiEdit3 className="text-gray-500" /> Laporan & Rekomendasi
              </h3>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Catatan Internal</label>
                <textarea
                  className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  rows={4}
                  placeholder="Catatan untuk tim..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="flex-1 flex flex-col relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Laporan Final</label>
                  <button onClick={() => setIsEditorOpen(true)} className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-2 py-1 rounded transition-colors" title="Buka Fullscreen Editor">
                    <FiMaximize2 size={12} /> Expand
                  </button>
                </div>

                <textarea
                  className="w-full flex-1 p-4 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-serif leading-relaxed text-gray-800 resize-none"
                  placeholder="Klik 'Expand' untuk editor lebih besar..."
                  value={finalReport}
                  onChange={(e) => setFinalReport(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Export */}
          {status === "completed" && (
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex justify-between items-center shadow-sm animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <FiCheckCircle />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-800">Asesmen Selesai</p>
                  <p className="text-xs text-emerald-600">Laporan siap diekspor.</p>
                </div>
              </div>
              <button
                onClick={handleExportPDF} // PANGGIL FUNGSI PDF
                className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors shadow-sm"
              >
                <FiPrinter size={14} /> Export PDF
              </button>
            </div>
          )}
        </div>
      </div>
      <QrcAiSuccessModal isOpen={showAiModal} onClose={() => setShowAiModal(false)} onReview={() => setShowAiModal(false)} />
      <FullscreenEditor />
      {generatingAI && (
        <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-indigo-100 max-w-sm w-full text-center relative overflow-hidden">
            {/* Dekorasi Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-60 translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              {/* Icon CPU Berdenyut */}
              <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-indigo-50/50">
                <FiCpu className="text-indigo-600 text-3xl animate-pulse" />
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2">AI Sedang Bekerja</h3>

              {/* Teks Step yang Berubah */}
              <p className="text-sm text-slate-500 mb-8 font-medium min-h-[24px] transition-all duration-500">{loadingStep}</p>

              {/* Progress Bar Indeterminate (Animasi Jalan) */}
              <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                {/* Kita gunakan style inline untuk animasi sederhana jika class custom tidak ada */}
                <div
                  className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  style={{
                    animation: "shimmer 1.5s infinite linear",
                    backgroundSize: "200% 100%",
                  }}
                ></div>
                {/* Fallback animasi css sederhana */}
                <style>{`
                  @keyframes shimmer {
                    0% { left: -30%; }
                    100% { left: 100%; }
                  }
                `}</style>
              </div>

              <p className="text-xs text-slate-400 mt-4">Proses ini memakan waktu ±5-10 detik.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QrcReviewWorkspace;
