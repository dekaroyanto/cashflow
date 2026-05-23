import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Helper function untuk format response
const formatResponse = (success, message, data = null) => {
  return NextResponse.json(
    { success, message, data },
    { status: success ? 200 : 400 },
  );
};

// GET: Ambil riwayat transaksi (untuk cek saldo)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // 'pemasukan' atau 'pengeluaran'
  const limit = parseInt(searchParams.get("limit")) || 10;

  try {
    let query;
    if (type === "pemasukan") {
      query = supabase
        .from("pemasukan")
        .select("*")
        .order("tanggal", { ascending: false })
        .limit(limit);
    } else if (type === "pengeluaran") {
      query = supabase
        .from("pengeluaran")
        .select("*")
        .order("tanggal", { ascending: false })
        .limit(limit);
    } else {
      // Ambil semua transaksi
      const { data: pemasukan } = await supabase
        .from("pemasukan")
        .select("*")
        .order("tanggal", { ascending: false })
        .limit(limit);
      const { data: pengeluaran } = await supabase
        .from("pengeluaran")
        .select("*")
        .order("tanggal", { ascending: false })
        .limit(limit);
      return formatResponse(true, "Success", { pemasukan, pengeluaran });
    }

    const { data, error } = await query;
    if (error) throw error;
    return formatResponse(true, "Success", data);
  } catch (error) {
    return formatResponse(false, error.message);
  }
}

// POST: Catat transaksi baru
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, keterangan, nominal, sumberdana_id, tanggal } = body;

    // Validasi input
    if (!type || !keterangan || !nominal || !sumberdana_id) {
      return formatResponse(
        false,
        "Missing required fields: type, keterangan, nominal, sumberdana_id",
      );
    }

    if (type !== "pemasukan" && type !== "pengeluaran") {
      return formatResponse(
        false,
        'Invalid type. Must be "pemasukan" or "pengeluaran"',
      );
    }

    const nominalInt = parseInt(nominal);
    if (isNaN(nominalInt) || nominalInt <= 0) {
      return formatResponse(false, "Nominal must be a positive number");
    }

    // Gunakan tanggal yang diberikan atau hari ini
    const tanggalTransaksi = tanggal || new Date().toISOString().split("T")[0];

    // Simpan ke database
    const table = type === "pemasukan" ? "pemasukan" : "pengeluaran";
    const { data, error } = await supabase
      .from(table)
      .insert([
        {
          tanggal: tanggalTransaksi,
          keterangan: keterangan,
          nominal: nominalInt,
          sumberdana_id: parseInt(sumberdana_id),
        },
      ])
      .select();

    if (error) throw error;

    // Hitung saldo terbaru untuk sumber dana tersebut
    const { data: pemasukanData } = await supabase
      .from("pemasukan")
      .select("nominal")
      .eq("sumberdana_id", sumberdana_id);

    const { data: pengeluaranData } = await supabase
      .from("pengeluaran")
      .select("nominal")
      .eq("sumberdana_id", sumberdana_id);

    const totalPemasukan =
      pemasukanData?.reduce((sum, p) => sum + p.nominal, 0) || 0;
    const totalPengeluaran =
      pengeluaranData?.reduce((sum, p) => sum + p.nominal, 0) || 0;
    const saldoBaru = totalPemasukan - totalPengeluaran;

    // Ambil nama sumber dana
    const { data: sumberDana } = await supabase
      .from("sumberdana")
      .select("nama_bank")
      .eq("id", sumberdana_id)
      .single();

    return formatResponse(
      true,
      `${type === "pemasukan" ? "Pemasukan" : "Pengeluaran"} berhasil dicatat`,
      {
        transaksi: data[0],
        saldo_terbaru: saldoBaru,
        sumber_dana: sumberDana?.nama_bank,
      },
    );
  } catch (error) {
    return formatResponse(false, error.message);
  }
}
