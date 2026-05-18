"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import LayoutWrapper from "../../components/LayoutWrapper";
import FilterBulanTahun from "../../components/FilterBulanTahun";

// Import komponen Grafik secara dinamis tanpa SSR
const GrafikCashflow = dynamic(
  () => import("../../components/GrafikCashflow"),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex justify-center items-center h-64 md:h-96">
          <div className="text-gray-500">Memuat grafik...</div>
        </div>
      </div>
    ),
  },
);

export default function GrafikPage() {
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  return (
    <LayoutWrapper>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 md:mb-6"
      >
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Grafik Cashflow 📊
        </h1>
        <p className="text-sm md:text-base text-gray-500">
          Visualisasi pemasukan dan pengeluaran
        </p>
      </motion.div>

      <div className="mb-4 md:mb-6">
        <FilterBulanTahun
          bulan={bulan}
          tahun={tahun}
          onBulanChange={setBulan}
          onTahunChange={setTahun}
        />
      </div>

      <GrafikCashflow bulan={bulan} tahun={tahun} key={`${bulan}-${tahun}`} />
    </LayoutWrapper>
  );
}
