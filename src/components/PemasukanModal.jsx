"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Calendar,
  FileText,
  DollarSign,
  CreditCard,
  X,
} from "lucide-react";

export default function PemasukanModal({ isOpen, onClose, onSuccess }) {
  const [sumberDanaList, setSumberDanaList] = useState([]);
  const [formData, setFormData] = useState({
    tanggal: "",
    keterangan: "",
    nominal: "",
    sumberdana_id: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSumberDana();
      // Reset form when modal opens
      setFormData({
        tanggal: "",
        keterangan: "",
        nominal: "",
        sumberdana_id: "",
      });
    }
  }, [isOpen]);

  const fetchSumberDana = async () => {
    const { data } = await supabase.from("sumberdana").select("id, nama_bank");
    if (data) setSumberDanaList(data);
  };

  const getJakartaDate = () => {
    const now = new Date();
    const jakartaTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
    );
    return jakartaTime.toISOString().split("T")[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const tanggalJakarta = formData.tanggal || getJakartaDate();

    const { error } = await supabase.from("pemasukan").insert([
      {
        tanggal: tanggalJakarta,
        keterangan: formData.keterangan,
        nominal: parseInt(formData.nominal),
        sumberdana_id: parseInt(formData.sumberdana_id),
      },
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("✓ Pemasukan berhasil dicatat!");
      onSuccess();
      onClose();
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <PlusCircle className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Tambah Pemasukan
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <Label className="text-gray-700 text-sm mb-1 block">
                    Tanggal
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                      className="pl-10 border-gray-200 focus:border-green-400 focus:ring-green-400"
                      value={formData.tanggal}
                      onChange={(e) =>
                        setFormData({ ...formData, tanggal: e.target.value })
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Kosongkan untuk pakai hari ini (WIB)
                  </p>
                </div>

                <div>
                  <Label className="text-gray-700 text-sm mb-1 block">
                    Keterangan
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Income freelance, gaji, dll"
                      className="pl-10 border-gray-200 focus:border-green-400 focus:ring-green-400"
                      value={formData.keterangan}
                      onChange={(e) =>
                        setFormData({ ...formData, keterangan: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 text-sm mb-1 block">
                    Nominal
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="1000000"
                      className="pl-10 border-gray-200 focus:border-green-400 focus:ring-green-400"
                      value={formData.nominal}
                      onChange={(e) =>
                        setFormData({ ...formData, nominal: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 text-sm mb-1 block">
                    Sumber Dana
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      className="w-full border border-gray-200 rounded-md p-2 pl-10 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 bg-white"
                      value={formData.sumberdana_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sumberdana_id: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Pilih sumber dana</option>
                      {sumberDanaList.map((sd) => (
                        <option key={sd.id} value={sd.id}>
                          {sd.nama_bank}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading ? "Menyimpan..." : "Simpan Pemasukan"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
