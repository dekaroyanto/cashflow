"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [saldoList, setSaldoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hideSaldo, setHideSaldo] = useState(false);
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    setSupabaseReady(!!supabaseUrl && !!supabaseKey);
  }, []);

  useEffect(() => {
    if (isClient && supabaseReady) {
      fetchSaldo();
    }
  }, [pathname, refreshTrigger, selectedSumberDana, isClient, supabaseReady]);

  const fetchSaldo = async () => {
    if (!supabaseReady) return;

    setLoading(true);

    try {
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
    } catch (error) {
      console.error("Error fetching saldo:", error);
    } finally {
      setLoading(false);
    }
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

  if (!isClient || !supabaseReady || (loading && saldoList.length === 0)) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
        <p className="text-center">Memuat saldo...</p>
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 md:p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 md:w-64 md:h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            {/* Baris 1: Total Saldo dengan tombol eye dan refresh */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <p className="text-blue-100 text-xs md:text-sm">Total Saldo</p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHideSaldo(!hideSaldo)}
                    className="rounded-full bg-white/20 hover:bg-white/30 text-white h-7 w-7 p-0"
                  >
                    {hideSaldo ? (
                      <Eye className="h-3 w-3 md:h-4 md:w-4" />
                    ) : (
                      <EyeOff className="h-3 w-3 md:h-4 md:w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchSaldo}
                    disabled={loading}
                    className="rounded-full bg-white/20 hover:bg-white/30 text-white h-7 w-7 p-0"
                  >
                    <RefreshCw
                      className={`h-3 w-3 md:h-4 md:w-4 ${loading ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-xs">Saldo Anda</p>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold break-words">
                  {hideSaldo ? "••••••••" : formatRupiah(totalSaldo)}
                </h2>
              </div>
            </div>

            {/* Baris 2: Total Pemasukan dan Total Pengeluaran dalam satu baris */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/20">
              <div className="flex-1 flex items-center justify-center gap-2">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-300" />
                <div>
                  <p className="text-[10px] md:text-xs text-blue-100">
                    Pemasukan
                  </p>
                  <p className="text-xs md:text-sm font-semibold text-green-300 truncate">
                    {formatRupiah(
                      saldoList.reduce((sum, s) => sum + s.pemasukan, 0),
                    )}
                  </p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="flex-1 flex items-center justify-center gap-2">
                <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-300" />
                <div>
                  <p className="text-[10px] md:text-xs text-blue-100">
                    Pengeluaran
                  </p>
                  <p className="text-xs md:text-sm font-semibold text-red-300 truncate">
                    {formatRupiah(
                      saldoList.reduce((sum, s) => sum + s.pengeluaran, 0),
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Per Akun Card */}
      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence>
          {saldoList.map((saldo, index) => (
            <motion.div
              key={saldo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                {/* Baris 1: Nama Bank dan Saldo */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-50 p-2 rounded-xl">
                      <Wallet className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                      {saldo.nama_bank}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Saldo</p>
                    <p
                      className={`text-sm md:text-base font-bold ${getSaldoColor(saldo.saldo)}`}
                    >
                      {hideSaldo ? "••••••" : formatRupiah(saldo.saldo)}
                    </p>
                  </div>
                </div>

                {/* Baris 2: Pemasukan dan Pengeluaran dalam satu baris */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                    <div>
                      <p className="text-[10px] md:text-xs text-gray-400">
                        Pemasukan
                      </p>
                      <p className="text-xs md:text-sm font-semibold text-green-600 truncate">
                        {formatRupiah(saldo.pemasukan)}
                      </p>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                    <div>
                      <p className="text-[10px] md:text-xs text-gray-400">
                        Pengeluaran
                      </p>
                      <p className="text-xs md:text-sm font-semibold text-red-600 truncate">
                        {formatRupiah(saldo.pengeluaran)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
