"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  showConfirm,
  showSuccess,
  showError,
  showLoading,
  closeLoading,
} from "../lib/alert";

export default function RiwayatTransaksi({
  refreshTrigger,
  onEdit,
  selectedSumberDana = "all",
  bulan,
  tahun,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
}) {
  const [transaksi, setTransaksi] = useState([]);
  const [filteredTransaksi, setFilteredTransaksi] = useState([]);
  const [paginatedTransaksi, setPaginatedTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sumberDanaMap, setSumberDanaMap] = useState({});
  const [sortBy, setSortBy] = useState("tanggal");
  const [sortOrder, setSortOrder] = useState("desc");
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  useEffect(() => {
    filterAndSortTransaksi();
  }, [transaksi, selectedSumberDana, bulan, tahun, sortBy, sortOrder]);

  useEffect(() => {
    // Update pagination ketika filteredTransaksi berubah
    const total = Math.ceil(filteredTransaksi.length / itemsPerPage);
    setTotalPages(total);

    // Reset ke halaman 1 jika currentPage melebihi totalPages
    if (currentPage > total && total > 0) {
      onPageChange?.(1);
    }

    // Ambil data untuk halaman saat ini
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setPaginatedTransaksi(filteredTransaksi.slice(start, end));
  }, [filteredTransaksi, currentPage, itemsPerPage]);

  const fetchData = async () => {
    setLoading(true);

    // Ambil semua sumber dana
    const { data: sumberDana } = await supabase
      .from("sumberdana")
      .select("id, nama_bank");
    const map = {};
    sumberDana?.forEach((sd) => {
      map[sd.id] = sd.nama_bank;
    });
    setSumberDanaMap(map);

    // Ambil pemasukan
    const { data: pemasukan } = await supabase
      .from("pemasukan")
      .select("id, tanggal, keterangan, nominal, sumberdana_id");

    // Ambil pengeluaran
    const { data: pengeluaran } = await supabase
      .from("pengeluaran")
      .select("id, tanggal, keterangan, nominal, sumberdana_id");

    // Gabungkan dan beri tipe
    const pemasukanWithType =
      pemasukan?.map((p) => ({ ...p, type: "pemasukan" })) || [];
    const pengeluaranWithType =
      pengeluaran?.map((p) => ({ ...p, type: "pengeluaran" })) || [];

    const semuaTransaksi = [...pemasukanWithType, ...pengeluaranWithType];

    setTransaksi(semuaTransaksi);
    setLoading(false);
  };

  const filterAndSortTransaksi = () => {
    let result = [...transaksi];

    // Filter berdasarkan bulan dan tahun
    if (bulan && tahun) {
      result = result.filter((t) => {
        const tanggal = new Date(t.tanggal);
        return (
          tanggal.getMonth() + 1 === bulan && tanggal.getFullYear() === tahun
        );
      });
    }

    // Filter berdasarkan sumber dana
    if (selectedSumberDana !== "all") {
      result = result.filter(
        (t) => t.sumberdana_id === parseInt(selectedSumberDana),
      );
    }

    // Sorting
    result.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "tanggal":
          aVal = new Date(a.tanggal);
          bVal = new Date(b.tanggal);
          break;
        case "nominal":
          aVal = a.nominal;
          bVal = b.nominal;
          break;
        case "keterangan":
          aVal = a.keterangan.toLowerCase();
          bVal = b.keterangan.toLowerCase();
          break;
        default:
          aVal = new Date(a.tanggal);
          bVal = new Date(b.tanggal);
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredTransaksi(result);
  };

  const handleDelete = async (id, type) => {
    const confirmed = await showConfirm(
      "Apakah Anda yakin ingin menghapus transaksi ini?",
      "Hapus Transaksi",
    );

    if (!confirmed) return;

    showLoading("Menghapus transaksi...");

    const table = type === "pemasukan" ? "pemasukan" : "pengeluaran";
    const { error } = await supabase.from(table).delete().eq("id", id);

    closeLoading();

    if (error) {
      showError("Gagal menghapus: " + error.message);
    } else {
      showSuccess("Transaksi berhasil dihapus!", "Terhapus!");
      fetchData();
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    onPageChange?.(1); // Reset ke halaman 1 saat sorting berubah
  };

  const formatRupiah = (nominal) => {
    return "Rp " + nominal.toLocaleString("id-ID");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  };

  const getMonthName = (month) => {
    const months = [
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
    return months[month - 1];
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange?.(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newValue = parseInt(e.target.value);
    onItemsPerPageChange?.(newValue);
    onPageChange?.(1); // Reset ke halaman 1
  };

  // Generate nomor halaman yang ditampilkan
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading)
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Riwayat Transaksi
            </h2>
            {(selectedSumberDana !== "all" || (bulan && tahun)) && (
              <p className="text-sm text-gray-500 mt-1">
                Menampilkan transaksi
                {selectedSumberDana !== "all" &&
                  ` dari ${sumberDanaMap[selectedSumberDana]}`}
                {bulan && tahun && ` bulan ${getMonthName(bulan)} ${tahun}`}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>

        {/* Sorting Controls */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs">
          <button
            onClick={() => handleSort("tanggal")}
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
          >
            Urutkan Tanggal {getSortIcon("tanggal")}
          </button>
          <button
            onClick={() => handleSort("nominal")}
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
          >
            Urutkan Nominal {getSortIcon("nominal")}
          </button>
          <button
            onClick={() => handleSort("keterangan")}
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
          >
            Urutkan Keterangan {getSortIcon("keterangan")}
          </button>
        </div>
      </div>

      <div className="p-6">
        {paginatedTransaksi.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">📭</div>
            <p className="text-gray-500">Tidak ada transaksi</p>
            {(selectedSumberDana !== "all" || (bulan && tahun)) && (
              <p className="text-sm text-gray-400 mt-1">
                Tidak ada transaksi untuk periode ini
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedTransaksi.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-all hover:border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {item.keterangan}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatDate(item.tanggal)}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {sumberDanaMap[item.sumberdana_id]}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            item.type === "pemasukan"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.type === "pemasukan"
                            ? "Pemasukan"
                            : "Pengeluaran"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-bold text-lg ${
                          item.type === "pemasukan"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.type === "pemasukan" ? "+" : "-"}{" "}
                        {formatRupiah(item.nominal)}
                      </div>
                      <div className="flex gap-2 mt-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.type)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {filteredTransaksi.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  {/* Items per page selector */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Tampilkan</span>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="border border-gray-200 rounded-lg p-1.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-gray-500">data</span>
                  </div>

                  {/* Page info */}
                  <div className="text-sm text-gray-500">
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredTransaksi.length,
                    )}{" "}
                    dari {filteredTransaksi.length} transaksi
                  </div>

                  {/* Pagination buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {getPageNumbers().map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={`h-8 w-8 p-0 ${currentPage === page ? "bg-blue-600 text-white" : ""}`}
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Summary */}
        {filteredTransaksi.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-500">Total Transaksi</p>
                <p className="text-sm font-semibold text-gray-700">
                  {filteredTransaksi.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Pemasukan</p>
                <p className="text-sm font-semibold text-green-600">
                  {formatRupiah(
                    filteredTransaksi
                      .filter((t) => t.type === "pemasukan")
                      .reduce((sum, t) => sum + t.nominal, 0),
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Pengeluaran</p>
                <p className="text-sm font-semibold text-red-600">
                  {formatRupiah(
                    filteredTransaksi
                      .filter((t) => t.type === "pengeluaran")
                      .reduce((sum, t) => sum + t.nominal, 0),
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
