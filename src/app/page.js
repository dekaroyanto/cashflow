"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusCircle, MinusCircle, Filter } from "lucide-react";
import LayoutWrapper from "../components/LayoutWrapper";
import SaldoCard from "../components/SaldoCard";
import PemasukanForm from "../components/PemasukanForm";
import PengeluaranForm from "../components/PengeluaranForm";
import { supabase } from "../lib/supabase";

export default function DashboardPage() {
  const [refresh, setRefresh] = useState(0);
  const [isPemasukanModalOpen, setIsPemasukanModalOpen] = useState(false);
  const [isPengeluaranModalOpen, setIsPengeluaranModalOpen] = useState(false);
  const [sumberDanaList, setSumberDanaList] = useState([]);
  const [selectedSumberDana, setSelectedSumberDana] = useState("all");

  useEffect(() => {
    fetchSumberDana();
  }, []);

  const fetchSumberDana = async () => {
    const { data } = await supabase
      .from("sumberdana")
      .select("id, nama_bank")
      .order("nama_bank");
    if (data) {
      setSumberDanaList(data);
    }
  };

  const handleSuccess = () => {
    setRefresh((prev) => prev + 1);
  };

  return (
    <LayoutWrapper>
      {/* Filter Sumber Dana */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter Sumber Dana
              </label>
              <select
                value={selectedSumberDana}
                onChange={(e) => setSelectedSumberDana(e.target.value)}
                className="w-full md:w-64 border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
              >
                <option value="all">Semua Sumber Dana</option>
                {sumberDanaList.map((sd) => (
                  <option key={sd.id} value={sd.id}>
                    {sd.nama_bank}
                  </option>
                ))}
              </select>
            </div>
            {selectedSumberDana !== "all" && (
              <button
                onClick={() => setSelectedSumberDana("all")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Saldo Section */}
      <div className="mb-6">
        <SaldoCard
          key={refresh}
          refreshTrigger={refresh}
          selectedSumberDana={selectedSumberDana}
        />
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
            Catat Pemasukan
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
            Catat Pengeluaran
          </button>
        </motion.div>
      </div>

      {/* Modals */}
      <PemasukanForm
        isOpen={isPemasukanModalOpen}
        onClose={() => setIsPemasukanModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <PengeluaranForm
        isOpen={isPengeluaranModalOpen}
        onClose={() => setIsPengeluaranModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </LayoutWrapper>
  );
}
