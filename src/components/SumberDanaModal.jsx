"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Plus, X } from "lucide-react";

export default function SumberDanaModal({ isOpen, onClose, onSuccess }) {
  const [namaBank, setNamaBank] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("sumberdana")
      .insert([{ nama_bank: namaBank }]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("✓ Sumber dana berhasil ditambahkan!");
      setNamaBank("");
      onSuccess();
      onClose();
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Tambah Sumber Dana
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <Input
                  type="text"
                  placeholder="Nama Bank (contoh: BRI Deka)"
                  value={namaBank}
                  onChange={(e) => setNamaBank(e.target.value)}
                  className="border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                  required
                />

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
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {loading ? "Menyimpan..." : "Tambah Sumber Dana"}
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
