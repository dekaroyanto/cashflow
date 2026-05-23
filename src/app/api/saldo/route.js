import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sumberdana_id = searchParams.get("sumberdana_id");

  try {
    let query = supabase.from("sumberdana").select("*");
    if (sumberdana_id) {
      query = query.eq("id", parseInt(sumberdana_id));
    }

    const { data: sumberDana, error: sdError } = await query;
    if (sdError) throw sdError;

    const saldoData = [];
    for (const sd of sumberDana) {
      const { data: pemasukan } = await supabase
        .from("pemasukan")
        .select("nominal")
        .eq("sumberdana_id", sd.id);

      const { data: pengeluaran } = await supabase
        .from("pengeluaran")
        .select("nominal")
        .eq("sumberdana_id", sd.id);

      const totalPemasukan =
        pemasukan?.reduce((sum, p) => sum + p.nominal, 0) || 0;
      const totalPengeluaran =
        pengeluaran?.reduce((sum, p) => sum + p.nominal, 0) || 0;
      const saldo = totalPemasukan - totalPengeluaran;

      saldoData.push({
        id: sd.id,
        nama_bank: sd.nama_bank,
        saldo: saldo,
        pemasukan: totalPemasukan,
        pengeluaran: totalPengeluaran,
      });
    }

    return NextResponse.json({ success: true, data: saldoData });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
