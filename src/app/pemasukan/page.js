"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import LayoutWrapper from "../../components/LayoutWrapper";
import PemasukanForm from "../../components/PemasukanForm";

export default function PemasukanPage() {
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
        <h1 className="text-2xl font-bold text-gray-800">Catat Pemasukan 📈</h1>
        <p className="text-gray-500">Tambahkan pemasukan ke sumber dana Anda</p>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        <PemasukanForm onSuccess={handleSuccess} />
      </div>
    </LayoutWrapper>
  );
}
