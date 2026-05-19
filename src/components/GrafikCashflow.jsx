"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

if (typeof window !== "undefined") {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  );
}

export default function GrafikCashflow({ bulan, tahun }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const chartRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchData();
    }
  }, [bulan, tahun, isClient]);

  const fetchData = async () => {
    setLoading(true);

    const startDate = `${tahun}-${String(bulan).padStart(2, "0")}-01`;
    const endDate = new Date(tahun, bulan, 0).toISOString().split("T")[0];

    const { data: pemasukan } = await supabase
      .from("pemasukan")
      .select("tanggal, nominal")
      .gte("tanggal", startDate)
      .lte("tanggal", endDate);

    const { data: pengeluaran } = await supabase
      .from("pengeluaran")
      .select("tanggal, nominal")
      .gte("tanggal", startDate)
      .lte("tanggal", endDate);

    const daysInMonth = new Date(tahun, bulan, 0).getDate();
    const dates = [];
    const pemasukanByDate = {};
    const pengeluaranByDate = {};
    const saldoByDate = {};

    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${tahun}-${String(bulan).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      dates.push(i);
      pemasukanByDate[date] = 0;
      pengeluaranByDate[date] = 0;
    }

    pemasukan?.forEach((p) => {
      pemasukanByDate[p.tanggal] += p.nominal;
    });

    pengeluaran?.forEach((p) => {
      pengeluaranByDate[p.tanggal] += p.nominal;
    });

    let runningSaldo = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${tahun}-${String(bulan).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      runningSaldo += pemasukanByDate[date] - pengeluaranByDate[date];
      saldoByDate[date] = runningSaldo;
    }

    setChartData({
      labels: dates,
      datasets: [
        {
          label: "Pemasukan",
          data: dates.map((d) => {
            const date = `${tahun}-${String(bulan).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            return pemasukanByDate[date];
          }),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          borderWidth: isMobile ? 2 : 3,
          tension: 0.1,
          fill: true,
          pointRadius: isMobile ? 2 : 3,
          pointHoverRadius: isMobile ? 4 : 6,
        },
        {
          label: "Pengeluaran",
          data: dates.map((d) => {
            const date = `${tahun}-${String(bulan).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            return pengeluaranByDate[date];
          }),
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderWidth: isMobile ? 2 : 3,
          tension: 0.1,
          fill: true,
          pointRadius: isMobile ? 2 : 3,
          pointHoverRadius: isMobile ? 4 : 6,
        },
        {
          label: "Saldo Kumulatif",
          data: dates.map((d) => {
            const date = `${tahun}-${String(bulan).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            return saldoByDate[date];
          }),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.05)",
          borderWidth: isMobile ? 1.5 : 2,
          borderDash: [5, 5],
          tension: 0.1,
          fill: false,
          pointRadius: isMobile ? 1 : 2,
          pointHoverRadius: isMobile ? 3 : 5,
        },
      ],
    });
    setLoading(false);
  };

  const formatRupiah = (value) => {
    return "Rp " + value.toLocaleString("id-ID");
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? "bottom" : "top",
        labels: {
          usePointStyle: true,
          boxWidth: isMobile ? 8 : 10,
          font: {
            size: isMobile ? 10 : 12,
            family: "'Inter', sans-serif",
          },
          padding: isMobile ? 8 : 10,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += formatRupiah(context.parsed.y);
            }
            return label;
          },
          title: function (context) {
            return `Tanggal ${context[0].label} ${bulan}/${tahun}`;
          },
        },
        bodyFont: {
          size: isMobile ? 11 : 12,
        },
        titleFont: {
          size: isMobile ? 11 : 12,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + "jt";
            }
            if (value >= 1000) {
              return (value / 1000).toFixed(0) + "rb";
            }
            return formatRupiah(value).substring(0, isMobile ? 6 : 8);
          },
          stepSize: isMobile ? undefined : 100000,
          maxTicksLimit: isMobile ? 5 : 8,
          font: {
            size: isMobile ? 9 : 11,
          },
          autoSkip: true,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawTicks: isMobile ? false : true,
        },
      },
      x: {
        ticks: {
          maxTicksLimit: isMobile ? 6 : 12,
          stepSize: isMobile ? 5 : 1,
          autoSkip: true,
          font: {
            size: isMobile ? 9 : 11,
          },
          maxRotation: isMobile ? 45 : 0,
          minRotation: isMobile ? 45 : 0,
        },
        grid: {
          display: false,
          drawTicks: false,
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    hover: {
      mode: "index",
      intersect: false,
    },
    elements: {
      line: {
        borderWidth: isMobile ? 2 : 3,
      },
      point: {
        radius: isMobile ? 2 : 3,
        hoverRadius: isMobile ? 4 : 6,
      },
    },
    layout: {
      padding: {
        left: isMobile ? 5 : 10,
        right: isMobile ? 5 : 10,
        top: isMobile ? 5 : 10,
        bottom: isMobile ? 5 : 10,
      },
    },
  };

  if (!isClient || (loading && !chartData)) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex justify-center items-center h-64 md:h-96">
          <div className="text-gray-500">Memuat grafik...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <h3 className="text-base md:text-lg font-semibold text-gray-800">
          Grafik Cashflow
        </h3>
        <div className="text-xs md:text-sm text-gray-500">
          {new Date(tahun, bulan - 1).toLocaleString("id-ID", {
            month: "long",
          })}{" "}
          {tahun}
        </div>
      </div>

      <div
        className="relative w-full"
        style={{ height: isMobile ? "300px" : "400px" }}
      >
        <Line ref={chartRef} data={chartData} options={options} />
      </div>

      {isMobile && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs font-medium text-gray-600">
                Pemasukan
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs font-medium text-gray-600">
                Pengeluaran
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-3 border-2 border-blue-500 border-dashed"></div>
              <span className="text-xs font-medium text-gray-600">Saldo</span>
            </div>
          </div>
        </div>
      )}

      {chartData && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="text-center md:text-left">
            <div className="text-xs text-gray-500">Total Pemasukan</div>
            <div className="text-sm md:text-base font-semibold text-green-600">
              {formatRupiah(
                chartData?.datasets[0]?.data.reduce((a, b) => a + b, 0) || 0,
              )}
            </div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-xs text-gray-500">Total Pengeluaran</div>
            <div className="text-sm md:text-base font-semibold text-red-600">
              {formatRupiah(
                chartData?.datasets[1]?.data.reduce((a, b) => a + b, 0) || 0,
              )}
            </div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-xs text-gray-500">Saldo Akhir</div>
            <div className="text-sm md:text-base font-semibold text-blue-600">
              {formatRupiah(
                chartData?.datasets[2]?.data[
                  chartData.datasets[2].data.length - 1
                ] || 0,
              )}
            </div>
          </div>
        </div>
      )}

      {isMobile && (
        <div className="mt-3 text-center text-xs text-gray-400">
          💡 Sentuh grafik untuk melihat detail
        </div>
      )}
    </div>
  );
}
