// frontend/src/features/bpr/components/ProcessStepNode.jsx

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { FiAlertTriangle, FiShield, FiActivity } from "react-icons/fi";

const ProcessStepNode = memo(({ data }) => {
  return (
    <div className="relative group">
      {/* Card Container */}
      <div className="px-4 py-3 shadow-sm rounded-xl bg-white border border-slate-200 min-w-[180px] text-center hover:shadow-md hover:border-blue-400 transition-all duration-200">
        {/* Handles (Titik Sambung) */}
        <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-slate-400 group-hover:bg-blue-500 transition-colors" />

        {/* Label */}
        <div className="font-bold text-slate-700 text-sm mb-2 line-clamp-2 leading-tight">{data.label}</div>

        {/* Indicators (Pills) */}
        <div className="flex justify-center gap-1.5">
          {/* Badge Risiko */}
          {data.riskCount > 0 ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-md border border-rose-100 text-[10px] font-bold shadow-sm">
              <FiAlertTriangle size={10} /> {data.riskCount}
            </div>
          ) : (
            <div className="w-full h-1 bg-slate-100 rounded-full mx-4 mt-2" title="No Risks"></div>
          )}

          {/* Badge Kontrol (Opsional jika ada data) */}
          {data.controlCount > 0 && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 text-[10px] font-bold shadow-sm">
              <FiShield size={10} /> {data.controlCount}
            </div>
          )}
        </div>

        <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-slate-400 group-hover:bg-blue-500 transition-colors" />
      </div>
    </div>
  );
});

export default ProcessStepNode;
