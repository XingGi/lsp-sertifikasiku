// frontend/src/features/uji-kompetensi/components/StudioStepper.jsx
import React from "react";
import { FiCheck, FiCircle, FiLoader } from "react-icons/fi";

export default function StudioStepper({ stages, currentStageId }) {
  if (!stages || stages.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto py-4 px-2">
      <div className="flex items-center min-w-max mx-auto justify-center">
        {stages.map((stage, idx) => {
          // Logic status visual
          // is_completed dan is_active dikirim dari backend API /context
          const isActive = stage.is_active;
          const isCompleted = stage.is_completed;
          const isPending = !isActive && !isCompleted;

          return (
            <div key={stage.id} className="flex items-center">
              {/* Garis Penghubung (Kiri) */}
              {idx > 0 && <div className={`h-1 w-12 sm:w-20 mx-2 rounded ${isCompleted ? "bg-indigo-500" : "bg-gray-200"}`} />}

              {/* Lingkaran Stage */}
              <div className="flex flex-col items-center gap-2 relative group">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all z-10
                    ${isCompleted ? "bg-indigo-500 border-indigo-500 text-white" : ""}
                    ${isActive ? "bg-white border-indigo-600 text-indigo-600 shadow-lg shadow-indigo-200 scale-110" : ""}
                    ${isPending ? "bg-white border-gray-300 text-gray-300" : ""}
                  `}
                >
                  {isCompleted ? <FiCheck size={16} /> : isActive ? <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                </div>

                {/* Label (Absolute biar gak ngerusak layout garis) */}
                <div className="absolute top-10 w-32 text-center">
                  <p className={`text-xs font-bold ${isActive ? "text-indigo-700" : "text-gray-500"}`}>{stage.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Spacer buat label di bawah */}
      <div className="h-8"></div>
    </div>
  );
}
