"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LayoutWrapper from "../../components/LayoutWrapper";
import RiwayatTransaksi from "../../components/RiwayatTransaksi";
import EditTransaksiModal from "../../components/EditTransaksiModal";
import { supabase } from "../../lib/supabase";
import { Filter } from "lucide-react";

export default function RiwayatPage() {
  const [refresh, setRefresh] = useState(0);
  const [editingTransaksi, setEditingTransaksi] = useState(null);
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

  const handleEdit = (transaksi) => {
    setEditingTransaksi(transaksi);
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
                Filter Berdasarkan Sumber Dana
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

      <RiwayatTransaksi
        refreshTrigger={refresh}
        onEdit={handleEdit}
        selectedSumberDana={selectedSumberDana}
      />

      {editingTransaksi && (
        <EditTransaksiModal
          transaksi={editingTransaksi}
          onClose={() => setEditingTransaksi(null)}
          onSuccess={() => {
            handleSuccess();
            setEditingTransaksi(null);
          }}
        />
      )}
    </LayoutWrapper>
  );
}
