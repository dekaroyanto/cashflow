"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import LayoutWrapper from "../../components/LayoutWrapper";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const PengeluaranForm = dynamic(
  () => import("../../components/PengeluaranForm"),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-center text-gray-500">Memuat form...</p>
      </div>
    ),
  },
);

export default function PengeluaranPage() {
  const [refresh, setRefresh] = useState(0);

  const handleSuccess = () => {
    setRefresh((prev) => prev + 1);
  };

  return (
    <LayoutWrapper>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Link
          href="/"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Catat Pengeluaran 📉
          </h1>
          <p className="text-sm text-gray-500">
            Tambahkan pengeluaran dari sumber dana
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto"
      >
        <PengeluaranForm onSuccess={handleSuccess} />
      </motion.div>
    </LayoutWrapper>
  );
}
