import React, { useState, useEffect } from "react";
import apiClient from "../../api/api";
import SimulationResult from "./components/SimulationResult";

function BIA() {
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [downtimeDuration, setDowntimeDuration] = useState(4); // Default 4 jam
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  // Mengambil daftar aset kritis saat halaman dimuat
  useEffect(() => {
    apiClient
      .get("/critical-assets")
      .then((response) => {
        setAssets(response.data);
        if (response.data.length > 0) {
          setSelectedAssetId(response.data[0].id); // Pilih aset pertama sebagai default
        }
      })
      .catch((error) => console.error("Gagal memuat aset:", error));
  }, []);

  const handleRunSimulation = async () => {
    // <-- Ubah menjadi async
    if (!selectedAssetId) {
      alert("Silakan pilih aset terlebih dahulu.");
      return;
    }
    setIsSimulating(true);
    setSimulationResult(null);

    try {
      // Panggil API backend yang baru kita buat
      const response = await apiClient.post("/bia/simulate", {
        asset_id: parseInt(selectedAssetId),
        duration: parseInt(downtimeDuration),
      });
      setSimulationResult(response.data.analysis);
    } catch (error) {
      console.error("Gagal menjalankan simulasi:", error);
      setSimulationResult("Terjadi kesalahan saat berkomunikasi dengan AI. Silakan coba lagi.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Business Impact Analysis</h1>
      <p className="text-gray-600 mb-8">Jalankan simulasi untuk memahami dampak dari gangguan pada aset kritis.</p>

      <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Panel Simulasi</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label htmlFor="asset" className="block text-sm font-bold text-gray-700 mb-2">
              Pilih Aset Kritis untuk Simulasi 'Lumpuh'
            </label>
            <select id="asset" value={selectedAssetId} onChange={(e) => setSelectedAssetId(e.target.value)} className="w-full p-2 border rounded-md shadow-sm">
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.nama_aset} ({asset.tipe_aset})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-bold text-gray-700 mb-2">
              Durasi (dalam jam)
            </label>
            <input type="number" id="duration" value={downtimeDuration} onChange={(e) => setDowntimeDuration(e.target.value)} className="w-full p-2 border rounded-md shadow-sm" min="1" />
          </div>
        </div>

        <div className="mt-6">
          <button onClick={handleRunSimulation} disabled={isSimulating} className="w-full bg-red-600 hover:bg-red-800 text-white font-bold py-3 px-4 rounded-md disabled:bg-gray-400">
            {isSimulating ? "Menjalankan Simulasi..." : "Jalankan Simulasi Dampak"}
          </button>
        </div>
      </div>

      <SimulationResult result={simulationResult} isSimulating={isSimulating} />
    </div>
  );
}

export default BIA;
