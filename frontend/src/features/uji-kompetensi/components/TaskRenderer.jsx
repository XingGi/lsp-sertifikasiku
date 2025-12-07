// frontend/src/features/uji-kompetensi/components/TaskRenderer.jsx
import React from "react";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { Button, Card, Title, Badge } from "@tremor/react";
import { FiArrowRight, FiCheckCircle, FiInfo, FiLock } from "react-icons/fi";

/**
 * TaskRenderer
 * Menerima config task dan merender komponen yang sesuai.
 */
export default function TaskRenderer({ task, userResponse, onSubmit, isSubmitting, readOnly = false }) {
  if (!task) return <div>No Task Data</div>;

  // --- TIPE 1: INFO (Bacaan / HTML) ---
  if (task.type === "INFO") {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="p-8 border border-gray-200 shadow-sm relative overflow-hidden">
          {/* Badge Read Only */}
          {readOnly && (
            <div className="absolute top-4 right-4">
              <Badge color="orange" icon={FiLock}>
                Mode Pantau (Read Only)
              </Badge>
            </div>
          )}

          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FiInfo size={24} />
            </div>
            <Title className="text-xl">{task.title}</Title>
          </div>

          <div className="prose prose-indigo max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: task.config?.html || "<p>Tidak ada konten.</p>" }} />
        </Card>

        {/* Tombol Lanjut Disembunyikan kalau Read Only */}
        {!readOnly && (
          <div className="flex justify-end">
            <Button size="lg" icon={FiArrowRight} loading={isSubmitting} onClick={() => onSubmit({ read: true })} className="shadow-lg shadow-indigo-200">
              Saya Mengerti & Lanjut
            </Button>
          </div>
        )}
      </div>
    );
  }

  // --- TIPE 2: FORM (Input Data via RJSF) ---
  if (task.type === "FORM") {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm relative">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <Title>{task.title}</Title>
              <p className="text-sm text-gray-500">{readOnly ? "Anda sedang melihat jawaban peserta." : "Silakan lengkapi formulir di bawah ini dengan benar."}</p>
            </div>
            {readOnly && (
              <Badge color="orange" icon={FiLock}>
                Read Only
              </Badge>
            )}
          </div>

          <div className="p-6">
            <Form
              schema={task.config?.schema || {}}
              uiSchema={task.config?.uiSchema || {}}
              formData={userResponse || {}}
              validator={validator}
              onSubmit={({ formData }) => !readOnly && onSubmit(formData)}
              // KUNCI FORM DISINI
              disabled={readOnly || isSubmitting}
              className={readOnly ? "rjsf-readonly" : ""}
            >
              {/* Sembunyikan Tombol Submit default RJSF dengan children kosong jika readOnly */}
              {readOnly ? (
                <></>
              ) : (
                <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
                  <Button type="submit" size="lg" loading={isSubmitting} icon={FiCheckCircle} className="shadow-lg shadow-indigo-200">
                    Simpan & Lanjutkan
                  </Button>
                </div>
              )}
            </Form>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
      <p className="text-gray-500">
        Tipe Task <strong>{task.type}</strong> belum didukung.
      </p>
    </div>
  );
}
