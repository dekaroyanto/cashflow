import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID").format(angka);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const message = body.message?.toLowerCase();

    if (!message) {
      return NextResponse.json({
        success: false,
        message: "Message required",
      });
    }

    // contoh:
    // pemasukan 50000 gaji dari bca
    // pengeluaran 15000 kopi dari dana tunai

    const regex = /(pemasukan|pengeluaran)\s+(\d+)\s+(.+)\s+dari\s+(.+)/i;

    const match = message.match(regex);

    if (!match) {
      return NextResponse.json({
        success: false,
        message: "Format salah. Contoh:\npengeluaran 15000 kopi dari bca",
      });
    }

    const type = match[1];
    const nominal = parseInt(match[2]);
    const keterangan = match[3];
    const namaBank = match[4];

    // cari sumber dana
    const { data: sumberDana, error: sdError } = await supabase
      .from("sumberdana")
      .select("*")
      .ilike("nama_bank", `%${namaBank}%`)
      .single();

    if (sdError || !sumberDana) {
      return NextResponse.json({
        success: false,
        message: `Sumber dana "${namaBank}" tidak ditemukan`,
      });
    }

    const table = type === "pemasukan" ? "pemasukan" : "pengeluaran";

    const { data, error } = await supabase
      .from(table)
      .insert([
        {
          tanggal: new Date().toISOString().split("T")[0],
          keterangan,
          nominal,
          sumberdana_id: sumberDana.id,
        },
      ])
      .select();

    if (error) throw error;

    // hitung saldo terbaru
    const { data: pemasukan } = await supabase
      .from("pemasukan")
      .select("nominal")
      .eq("sumberdana_id", sumberDana.id);

    const { data: pengeluaran } = await supabase
      .from("pengeluaran")
      .select("nominal")
      .eq("sumberdana_id", sumberDana.id);

    const totalPemasukan =
      pemasukan?.reduce((sum, item) => sum + item.nominal, 0) || 0;

    const totalPengeluaran =
      pengeluaran?.reduce((sum, item) => sum + item.nominal, 0) || 0;

    const saldo = totalPemasukan - totalPengeluaran;

    return NextResponse.json({
      success: true,
      message:
        type === "pemasukan"
          ? "✅ Pemasukan berhasil dicatat"
          : "✅ Pengeluaran berhasil dicatat",

      data: {
        transaksi: data[0],
        saldo,
        sumber_dana: sumberDana.nama_bank,
      },

      reply:
        `${
          type === "pemasukan" ? "✅ Pemasukan" : "✅ Pengeluaran"
        } berhasil dicatat\n\n` +
        `💰 Nominal: Rp${formatRupiah(nominal)}\n` +
        `📝 Keterangan: ${keterangan}\n` +
        `🏦 Sumber Dana: ${sumberDana.nama_bank}\n` +
        `📊 Saldo Sekarang: Rp${formatRupiah(saldo)}`,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}
