import React, { useState } from "react"; // 1. Import useState
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
  // 2. Buat state untuk melacak kondisi sidebar (default: terbuka)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 3. Buat fungsi untuk mengubah state (toggle)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 4. Kirim state dan fungsi toggle ke Sidebar via props */}
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
