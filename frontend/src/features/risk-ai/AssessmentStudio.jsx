// frontend/src/features/risk-ai/AssessmentStudio.jsx

import React from "react";
import { Title, Text, Button } from "@tremor/react";
import { FiArrowLeft, FiCpu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import CreateAssessmentForm from "./components/CreateAssessmentForm";

function AssessmentStudio() {
  const navigate = useNavigate();

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4">
          <Button variant="light" icon={FiArrowLeft} onClick={() => navigate("/risk-ai/assessments")} className="hover:bg-slate-200 rounded-full p-2" />
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <FiCpu size={24} />
              </div>
              <Title className="text-2xl text-slate-800">Assessment Studio</Title>
            </div>
            <Text className="text-slate-500 mt-1 ml-1">Mulai evaluasi risiko baru dengan bantuan AI Generatif.</Text>
          </div>
        </div>
      </div>

      {/* Form Container - Centered & Constrained Width for Focus */}
      <div className="w-full">
        <CreateAssessmentForm />
      </div>
    </div>
  );
}

export default AssessmentStudio;
