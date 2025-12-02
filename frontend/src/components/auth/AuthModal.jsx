// frontend/src/components/AuthModal.jsx

import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, Card, Title, Text, Button, TextInput } from "@tremor/react";
import { FiX, FiUser, FiMail, FiLock, FiLogIn } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/api";

function AuthModal({ isOpen, onClose, initialView = "login" }) {
  const [view, setView] = useState(initialView);
  const { login } = useAuth();
  const navigate = useNavigate();

  // State untuk form
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ nama_lengkap: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset state saat modal ditutup atau view berubah
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError("");
      setLoginData({ email: "", password: "" });
      setRegisterData({ nama_lengkap: "", email: "", password: "" });
    }
  }, [isOpen, initialView]);

  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await apiClient.post("/login", loginData);
      login(response.data.access_token);
      onClose(); // Tutup modal setelah berhasil
      navigate("/dashboard"); // Arahkan ke dashboard
    } catch (err) {
      setError(err.response?.data?.msg || "Email atau password salah.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await apiClient.post("/register", registerData);
      alert("Registrasi berhasil! Silakan login dengan akun Anda.");
      setView("login"); // Arahkan ke tampilan login setelah berhasil daftar
    } catch (err) {
      setError(err.response?.data?.msg || "Gagal melakukan registrasi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onClose={onClose} static={true}>
          {/* Backdrop dengan blur */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

          {/* Panel Modal dengan animasi */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center p-4"
          >
            <DialogPanel as={Card} className="max-w-md w-full p-0 overflow-hidden">
              <div className="absolute top-3 right-3 z-10">
                <Button icon={FiX} variant="light" className="rounded-full" onClick={onClose} />
              </div>

              {/* 1. Header dengan Ikon dan Warna Latar */}
              <div className="bg-slate-50 p-6 border-b text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <FiLogIn className="w-6 h-6 text-blue-600" />
                </div>
                <Title className="text-slate-800">Selamat Datang di SIRICO</Title>
                <Text>{view === "login" ? "Login untuk melanjutkan" : "Buat akun baru Anda"}</Text>
              </div>

              <div className="p-6">
                {error && (
                  <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}

                {/* 2. Form dengan Ikon pada setiap Input */}
                {view === "login" ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-5">
                    <div>
                      <TextInput icon={FiMail} type="email" name="email" value={loginData.email} onChange={handleLoginChange} placeholder="Alamat Email" required />
                    </div>
                    <div>
                      <TextInput icon={FiLock} type="password" name="password" value={loginData.password} onChange={handleLoginChange} placeholder="Password" required />
                    </div>
                    <Button type="submit" className="w-full" loading={isLoading}>
                      Login
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-5">
                    <div>
                      <TextInput icon={FiUser} name="nama_lengkap" value={registerData.nama_lengkap} onChange={handleRegisterChange} placeholder="Nama Lengkap" required />
                    </div>
                    <div>
                      <TextInput icon={FiMail} type="email" name="email" value={registerData.email} onChange={handleRegisterChange} placeholder="Alamat Email" required />
                    </div>
                    <div>
                      <TextInput icon={FiLock} type="password" name="password" value={registerData.password} onChange={handleRegisterChange} placeholder="Password" required />
                    </div>
                    <Button type="submit" className="w-full" loading={isLoading}>
                      Daftar Akun
                    </Button>
                  </form>
                )}
              </div>

              {/* 3. Footer untuk beralih antara Login dan Register */}
              <div className="bg-slate-50 p-4 text-center border-t">
                <Text>
                  {view === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
                  <button type="button" onClick={() => setView(view === "login" ? "register" : "login")} className="text-blue-600 font-semibold hover:underline focus:outline-none">
                    {view === "login" ? "Daftar di sini" : "Login di sini"}
                  </button>
                </Text>
              </div>
            </DialogPanel>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

export default AuthModal;
