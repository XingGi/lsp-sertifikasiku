import React from "react";

function SimulationResult({ result, isSimulating }) {
  if (isSimulating) {
    return (
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md animate-pulse">
        <p className="text-center font-semibold text-gray-600">AI sedang menganalisis dampak...</p>
      </div>
    );
  }

  if (!result) {
    return null; // Jangan tampilkan apa-apa jika tidak ada hasil
  }

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Hasil Analisis Dampak</h3>
      {/* Hasil dari AI akan ditampilkan di sini nanti */}
      <div className="prose max-w-none">
        <p>{result}</p>
      </div>
    </div>
  );
}

export default SimulationResult;
