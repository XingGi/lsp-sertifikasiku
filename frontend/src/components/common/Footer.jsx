// frontend/src/components/Footer.jsx

import React from "react";

function Footer() {
  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; {new Date().getFullYear()} LSP Sertifikasiku. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
