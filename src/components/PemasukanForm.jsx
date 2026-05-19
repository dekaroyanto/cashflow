"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, FileText, DollarSign, CreditCard } from "lucide-react";
import {
  showSuccess,
  showError,
  showLoading,
  closeLoading,
} from "../lib/alert";

export default function PemasukanForm({ onSuccess }) {
  const router = useRouter();
  const [sumberDanaList, setSumberDanaList] = useState([]);
  const [formData, setFormData] = useState({
    tanggal: "",
    keterangan: "",
    nominal: "",
    sumberdana_id: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSumberDana();
  }, []);

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

    if (!formData.keterangan) {
      showError("Keterangan harus diisi!");
      return;
    }

    if (!formData.nominal || parseInt(formData.nominal) <= 0) {
      showError("Nominal harus diisi dengan angka yang valid!");
      return;
    }

    if (!formData.sumberdana_id) {
      showError("Pilih sumber dana terlebih dahulu!");
      return;
    }

    setLoading(true);
    showLoading("Menyimpan data pemasukan...");

    const tanggalJakarta = formData.tanggal || getJakartaDate();

    const { error } = await supabase.from("pemasukan").insert([
      {
        tanggal: tanggalJakarta,
        keterangan: formData.keterangan,
        nominal: parseInt(formData.nominal),
        sumberdana_id: parseInt(formData.sumberdana_id),
      },
    ]);

    closeLoading();

    if (error) {
      showError(error.message);
    } else {
      showSuccess("Pemasukan berhasil dicatat!", "Sukses!");
      setFormData({
        tanggal: "",
        keterangan: "",
        nominal: "",
        sumberdana_id: "",
      });
      if (onSuccess) onSuccess();
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <div>
        <Label className="text-gray-700 text-sm mb-1 block">Tanggal</Label>
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
        <Label className="text-gray-700 text-sm mb-1 block">Keterangan</Label>
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
        <Label className="text-gray-700 text-sm mb-1 block">Nominal</Label>
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
        <Label className="text-gray-700 text-sm mb-1 block">Sumber Dana</Label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            className="w-full border border-gray-200 rounded-md p-2 pl-10 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 bg-white"
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
          onClick={() => router.back()}
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
  );
}
