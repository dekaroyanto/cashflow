"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, FileText, DollarSign, CreditCard } from "lucide-react";
import Modal from "./Modal";
import {
  showSuccess,
  showError,
  showLoading,
  closeLoading,
} from "../lib/alert";

export default function EditTransaksiModal({ transaksi, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    tanggal: "",
    keterangan: "",
    nominal: "",
    sumberdana_id: "",
  });
  const [sumberDanaList, setSumberDanaList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSumberDana();
    if (transaksi) {
      setFormData({
        tanggal: transaksi.tanggal,
        keterangan: transaksi.keterangan,
        nominal: transaksi.nominal,
        sumberdana_id: transaksi.sumberdana_id,
      });
    }
  }, [transaksi]);

  const fetchSumberDana = async () => {
    const { data } = await supabase.from("sumberdana").select("id, nama_bank");
    if (data) setSumberDanaList(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    showLoading("Menyimpan perubahan...");

    const table = transaksi.type === "pemasukan" ? "pemasukan" : "pengeluaran";
    const { error } = await supabase
      .from(table)
      .update({
        tanggal: formData.tanggal,
        keterangan: formData.keterangan,
        nominal: parseInt(formData.nominal),
        sumberdana_id: parseInt(formData.sumberdana_id),
      })
      .eq("id", transaksi.id);

    closeLoading();

    if (error) {
      showError(error.message);
    } else {
      showSuccess("Transaksi berhasil diupdate!", "Sukses!");
      onSuccess();
      onClose();
    }
    setLoading(false);
  };

  const getTitle = () => {
    if (!transaksi) return "Edit Transaksi";
    return transaksi.type === "pemasukan"
      ? "Edit Pemasukan"
      : "Edit Pengeluaran";
  };

  const getColor = () => {
    if (!transaksi) return "blue";
    return transaksi.type === "pemasukan" ? "green" : "red";
  };

  if (!transaksi) return null;

  const color = getColor();

  return (
    <Modal isOpen={!!transaksi} onClose={onClose} title={getTitle()}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-gray-700 text-sm mb-1 block">Tanggal</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="date"
              className={`pl-10 border-gray-200 focus:border-${color}-400 focus:ring-${color}-400`}
              value={formData.tanggal}
              onChange={(e) =>
                setFormData({ ...formData, tanggal: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div>
          <Label className="text-gray-700 text-sm mb-1 block">Keterangan</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Keterangan transaksi"
              className={`pl-10 border-gray-200 focus:border-${color}-400 focus:ring-${color}-400`}
              value={formData.keterangan}
              onChange={(e) =>
                setFormData({ ...formData, keterangan: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div>
          <Label className="text-gray-700 text-sm mb-1 block">Nominal</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="number"
              placeholder="Nominal"
              className={`pl-10 border-gray-200 focus:border-${color}-400 focus:ring-${color}-400`}
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
              className={`w-full border border-gray-200 rounded-md p-2 pl-10 focus:outline-none focus:border-${color}-400 focus:ring-1 focus:ring-${color}-400 bg-white`}
              value={formData.sumberdana_id}
              onChange={(e) =>
                setFormData({ ...formData, sumberdana_id: e.target.value })
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
            className={`flex-1 bg-${color}-600 hover:bg-${color}-700 text-white`}
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
