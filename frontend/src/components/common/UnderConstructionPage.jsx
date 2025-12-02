// frontend/src/components/common/UnderConstructionPage.jsx
import React from "react";
import { Card, Title, Text, Button, Flex } from "@tremor/react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCpu, FiTool, FiActivity } from "react-icons/fi";
import { motion } from "framer-motion";

function UnderConstructionPage({ title, description, icon: Icon = FiTool }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute -top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-3xl" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-100 rounded-full opacity-50 blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="z-10 max-w-lg w-full">
        <Card decoration="top" decorationColor="blue" className="text-center shadow-xl border-none ring-1 ring-gray-100">
          <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 relative">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-blue-100 rounded-full opacity-50" />
            <Icon className="w-10 h-10 text-blue-600 relative z-10" />
          </div>

          <Title className="text-3xl font-bold text-slate-800 mb-2">{title}</Title>
          <Text className="text-slate-500 mb-8 text-lg leading-relaxed">{description || "Fitur ini sedang dirancang dengan teliti untuk memberikan pengalaman manajemen risiko terbaik. Segera hadir!"}</Text>

          <div className="flex justify-center gap-4">
            <Button variant="secondary" className="rounded-md hover:bg-gray-400" color="gray" icon={FiArrowLeft} onClick={() => navigate(-1)}>
              Kembali
            </Button>
            <Button variant="primary" className="rounded-md hover:bg-blue-800" color="blue" onClick={() => navigate("/dashboard")}>
              Ke Dashboard
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Text className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Progress Status</Text>
            <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "30%" }} transition={{ duration: 1, delay: 0.5 }} className="bg-blue-500 h-1.5 rounded-full" />
            </div>
            <Text className="text-xs text-right mt-1 text-gray-400">Coming Soon</Text>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default UnderConstructionPage;
