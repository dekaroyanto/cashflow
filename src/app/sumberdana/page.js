"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import LayoutWrapper from "../../components/LayoutWrapper";

const SumberDanaForm = dynamic(
  () => import("../../components/SumberDanaForm"),
  { ssr: false },
);

const SaldoCard = dynamic(() => import("../../components/SaldoCard"), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <p className="text-center text-gray-500">Memuat saldo...</p>
    </div>
  ),
});

export default function SumberDanaPage() {
  const [refresh, setRefresh] = useState(0);

  const handleSuccess = () => {
    setRefresh((prev) => prev + 1);
  };

  return (
    <LayoutWrapper>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-800">
          Kelola Sumber Dana 🏦
        </h1>
        <p className="text-gray-500">Tambah dan lihat saldo sumber dana</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SumberDanaForm onSuccess={handleSuccess} />
        </div>
        <div>
          <SaldoCard key={refresh} refreshTrigger={refresh} />
        </div>
      </div>
    </LayoutWrapper>
  );
}
