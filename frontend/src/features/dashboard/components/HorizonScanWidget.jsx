// frontend/src/features/dashboard/components/HorizonScanWidget.jsx
import React, { useEffect, useState } from "react";
import { Card, Title, Text, Button, Badge } from "@tremor/react";
import { FiSearch, FiArrowRight, FiTrendingUp, FiLoader } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/api";
import { formatDate } from "../../../utils/formatters";

function HorizonScanWidget() {
  const navigate = useNavigate();
  const [recentScans, setRecentScans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await apiClient.get("/horizon").catch(() => ({ data: [] }));
        setRecentScans((response.data || []).slice(0, 3)); // PASTIKAN LIMIT 3
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScans();
  }, []);

  return (
    <Card className="border-t-4 border-indigo-500 h-full flex flex-col shadow-md bg-white">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 rounded text-indigo-600">
            <FiSearch size={18} />
          </div>
          <Title className="text-lg">Horizon Scanning</Title>
        </div>
        <Badge className="rounded-md px-2 py-1" color="indigo" size="xs">
          Add-on
        </Badge>
      </div>

      <div className="flex-grow space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <FiLoader className="animate-spin text-indigo-400" />
          </div>
        ) : recentScans.length > 0 ? (
          recentScans.map((scan) => (
            <div key={scan.id} className="p-2.5 rounded-lg border border-gray-100 bg-gray-50 hover:bg-indigo-50 transition-colors cursor-pointer" onClick={() => navigate(`/addons/horizon/${scan.id}`)}>
              <div className="flex justify-between items-center">
                <Text className="font-medium text-slate-700 truncate w-32 text-xs" title={scan.topic}>
                  {scan.topic || "Scan Tanpa Judul"}
                </Text>
                <Badge color="blue" size="xs" className="scale-90">
                  AI
                </Badge>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                <FiTrendingUp size={10} />
                <span>{formatDate(scan.scan_date)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-400 text-xs italic">Belum ada data.</div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100">
        <Button size="xs" variant="light" icon={FiArrowRight} iconPosition="right" className="w-full justify-between text-indigo-600" onClick={() => navigate("/addons/horizon-scanner")}>
          Lihat Semua
        </Button>
      </div>
    </Card>
  );
}
export default HorizonScanWidget;
