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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchSaldo();
    }
  }, [refreshTrigger, selectedSumberDana, isClient]);

  const fetchSaldo = async () => {
    setLoading(true);

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

  if (!isClient || (loading && saldoList.length === 0)) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
        <p className="text-center">Memuat saldo...</p>
      </div>
    );
  }

  // Rest of the component remains the same...
  return (
    <div className="space-y-4">
      {/* ... kode yang sama seperti sebelumnya ... */}
    </div>
  );
}
