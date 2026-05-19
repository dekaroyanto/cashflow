"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useNotificationTriggers() {
  useEffect(() => {
    const checkReminder = () => {
      const now = new Date();
      const lastReminder = localStorage.getItem("lastDailyReminder");
      const lastCheckDate = lastReminder ? new Date(lastReminder) : null;

      // Reminder jam 8 malam (20:00)
      if (
        now.getHours() === 20 &&
        (!lastCheckDate || lastCheckDate.getDate() !== now.getDate())
      ) {
        checkIfTodayHasTransactions(now);
      }
    };

    const interval = setInterval(checkReminder, 60 * 60 * 1000); // Cek setiap jam
    return () => clearInterval(interval);
  }, []);

  const checkIfTodayHasTransactions = async (date) => {
    const today = date.toISOString().split("T")[0];

    const { data: pemasukan } = await supabase
      .from("pemasukan")
      .select("id")
      .eq("tanggal", today)
      .limit(1);

    const { data: pengeluaran } = await supabase
      .from("pengeluaran")
      .select("id")
      .eq("tanggal", today)
      .limit(1);

    if (
      (!pemasukan || pemasukan.length === 0) &&
      (!pengeluaran || pengeluaran.length === 0)
    ) {
      sendNotification(
        "📝 Yuk Catat Transaksi!",
        "Hari ini belum ada catatan keuangan. Yuk catat pemasukan atau pengeluaranmu!",
        "reminder",
      );
      localStorage.setItem("lastDailyReminder", date.toISOString());
    }
  };

  const sendNotification = async (title, body, type) => {
    try {
      await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, type }),
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  const notifyPemasukan = (keterangan, nominal) => {
    sendNotification(
      "💰 Pemasukan Baru!",
      `${keterangan}: Rp ${nominal.toLocaleString("id-ID")} berhasil dicatat`,
      "pemasukan",
    );
  };

  const notifyPengeluaran = (keterangan, nominal) => {
    sendNotification(
      "💸 Pengeluaran Baru",
      `${keterangan}: Rp ${nominal.toLocaleString("id-ID")} berhasil dicatat`,
      "pengeluaran",
    );
  };

  return { notifyPemasukan, notifyPengeluaran };
}
