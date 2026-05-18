"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SaldoCard({
  refreshTrigger,
  selectedSumberDana = "all",
}) {
  const [saldoList, setSaldoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hideSaldo, setHideSaldo] = useState(false);
  const [totalSaldo, setTotalSaldo] = useState(0);

  useEffect(() => {
    fetchSaldo();
  }, [refreshTrigger, selectedSumberDana]);

  const fetchSaldo = async () => {
    setLoading(true);

    // Query sumber dana berdasarkan filter
    let query = supabase.from("sumberdana").select("*");
    if (selectedSumberDana !== "all") {
      query = query.eq("id", parseInt(selectedSumberDana));
    }

    const { data: sumberDana } = await query;

    if (!sumberDana || sumberDana.length === 0) {
      setSaldoList([]);
      setTotalSaldo(0);
      setLoading(false);
      return;
    }

    const saldoData = [];
    let total = 0;

    for (const sd of sumberDana) {
      const { data: pemasukan } = await supabase
        .from("pemasukan")
        .select("nominal")
        .eq("sumberdana_id", sd.id);

      const { data: pengeluaran } = await supabase
        .from("pengeluaran")
        .select("nominal")
        .eq("sumberdana_id", sd.id);

      const totalPemasukan =
        pemasukan?.reduce((sum, p) => sum + p.nominal, 0) || 0;
      const totalPengeluaran =
        pengeluaran?.reduce((sum, p) => sum + p.nominal, 0) || 0;
      const saldo = totalPemasukan - totalPengeluaran;

      total += saldo;
      saldoData.push({
        id: sd.id,
        nama_bank: sd.nama_bank,
        saldo: saldo,
        pemasukan: totalPemasukan,
        pengeluaran: totalPengeluaran,
      });
    }

    setSaldoList(saldoData);
    setTotalSaldo(total);
    setLoading(false);
  };

  const formatRupiah = (nominal) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(nominal);
  };

  const getSaldoColor = (saldo) => {
    if (saldo > 0) return "text-green-600";
    if (saldo < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (loading && saldoList.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  if (saldoList.length === 0 && selectedSumberDana !== "all") {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="text-center">
          <p className="text-lg mb-2">⚠️ Tidak Ada Data</p>
          <p className="text-sm text-blue-100">Sumber dana tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total Saldo Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-blue-100 text-sm">
                  Total Saldo {selectedSumberDana !== "all" && "(Filtered)"}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-3xl font-bold">
                    {hideSaldo ? "••••••••" : formatRupiah(totalSaldo)}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHideSaldo(!hideSaldo)}
                    className="rounded-full bg-white/20 hover:bg-white/30 text-white"
                  >
                    {hideSaldo ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchSaldo}
                disabled={loading}
                className="rounded-full bg-white/20 hover:bg-white/30 text-white"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            <div className="flex gap-6">
              <div>
                <p className="text-blue-100 text-xs">Total Pemasukan</p>
                <p className="text-sm font-semibold text-green-300">
                  {formatRupiah(
                    saldoList.reduce((sum, s) => sum + s.pemasukan, 0),
                  )}
                </p>
              </div>
              <div>
                <p className="text-blue-100 text-xs">Total Pengeluaran</p>
                <p className="text-sm font-semibold text-red-300">
                  {formatRupiah(
                    saldoList.reduce((sum, s) => sum + s.pengeluaran, 0),
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Per Akun Card */}
      <AnimatePresence>
        {saldoList.map((saldo, index) => (
          <motion.div
            key={saldo.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <Wallet className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {saldo.nama_bank}
                    </h3>
                    <div className="flex gap-3 text-xs mt-1">
                      <span className="text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {formatRupiah(saldo.pemasukan)}
                      </span>
                      <span className="text-red-600 flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        {formatRupiah(saldo.pengeluaran)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Saldo</p>
                  <p
                    className={`text-lg font-bold ${getSaldoColor(saldo.saldo)}`}
                  >
                    {hideSaldo ? "••••••" : formatRupiah(saldo.saldo)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
