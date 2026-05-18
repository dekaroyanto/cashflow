"use client";

import { Label } from "@/components/ui/label";

export default function FilterBulanTahun({
  bulan,
  tahun,
  onBulanChange,
  onTahunChange,
}) {
  const bulanList = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const tahunList = [];
  const tahunSekarang = new Date().getFullYear();
  for (let i = tahunSekarang - 2; i <= tahunSekarang + 2; i++) {
    tahunList.push(i);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label className="text-gray-700 text-sm mb-1 block">Bulan</Label>
          <select
            className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white text-sm"
            value={bulan}
            onChange={(e) => onBulanChange(parseInt(e.target.value))}
          >
            {bulanList.map((b, idx) => (
              <option key={idx} value={idx + 1}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <Label className="text-gray-700 text-sm mb-1 block">Tahun</Label>
          <select
            className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white text-sm"
            value={tahun}
            onChange={(e) => onTahunChange(parseInt(e.target.value))}
          >
            {tahunList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
