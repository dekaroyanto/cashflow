"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import LayoutWrapper from "../components/LayoutWrapper";
import { PlusCircle, MinusCircle } from "lucide-react";

// Import komponen secara dinamis tanpa SSR
const SaldoCard = dynamic(() => import("../components/SaldoCard"), {
  ssr: false,
  loading: () => (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
      <p className="text-center">Memuat saldo...</p>
    </div>
  ),
});

const PemasukanForm = dynamic(() => import("../components/PemasukanForm"), {
  ssr: false,
});

const PengeluaranForm = dynamic(() => import("../components/PengeluaranForm"), {
  ssr: false,
});

export default function DashboardPage() {
  const [refresh, setRefresh] = useState(0);
  const [isPemasukanModalOpen, setIsPemasukanModalOpen] = useState(false);
  const [isPengeluaranModalOpen, setIsPengeluaranModalOpen] = useState(false);

  const handleSuccess = () => {
    setRefresh((prev) => prev + 1);
  };

  return (
    <LayoutWrapper>
      {/* Header Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-800">Dashboard 👋</h1>
        <p className="text-gray-500">Ringkasan keuangan Anda</p>
      </motion.div>

      {/* Saldo Section */}
      <div className="mb-6">
        <SaldoCard key={refresh} refreshTrigger={refresh} />
      </div>

      {/* Quick Actions Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setIsPemasukanModalOpen(true)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg"
          >
            <PlusCircle className="h-5 w-5" />+ Catat Pemasukan
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setIsPengeluaranModalOpen(true)}
            className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg"
          >
            <MinusCircle className="h-5 w-5" />- Catat Pengeluaran
          </button>
        </motion.div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-2">💡 Tips Keuangan</h3>
          <p className="text-sm text-gray-600">
            Catat setiap pemasukan dan pengeluaran secara rutin untuk mengontrol
            keuangan dengan lebih baik.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-2">
            📊 Statistik Cepat
          </h3>
          <p className="text-sm text-gray-600">
            Lihat grafik cashflow di menu Grafik untuk analisis keuangan yang
            lebih mendalam.
          </p>
        </motion.div>
      </div>

      {/* Modals */}
      {isPemasukanModalOpen && (
        <PemasukanForm
          isOpen={isPemasukanModalOpen}
          onClose={() => setIsPemasukanModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}

      {isPengeluaranModalOpen && (
        <PengeluaranForm
          isOpen={isPengeluaranModalOpen}
          onClose={() => setIsPengeluaranModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </LayoutWrapper>
  );
}
