const API_BASE_URL = "https://cashflow-ameldeka.vercel.app/api";

async function callAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return response.json();
}

async function getSumberDanaId(namaBank) {
  try {
    const result = await callAPI("/sumberdana");
    if (result.success && result.data) {
      const found = result.data.find(
        (sd) => sd.nama_bank.toLowerCase() === namaBank.toLowerCase(),
      );
      if (found) return found.id;
    }
    return null;
  } catch (error) {
    console.error("Error getting sumber dana:", error);
    return null;
  }
}

async function formatRupiah(nominal) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(nominal);
}

export const functions = {
  catat_pemasukan: async (params) => {
    const { keterangan, nominal, sumber_dana } = params;

    if (!keterangan) return { error: "Keterangan tidak boleh kosong" };
    if (!nominal || nominal <= 0)
      return { error: "Nominal harus lebih dari 0" };
    if (!sumber_dana) return { error: "Sumber dana harus diisi" };

    const sumberdana_id = await getSumberDanaId(sumber_dana);
    if (!sumberdana_id) {
      return {
        error: `Sumber dana "${sumber_dana}" tidak ditemukan. Gunakan perintah "daftar sumber dana" untuk melihat daftar yang tersedia.`,
      };
    }

    const result = await callAPI("/transaksi", {
      method: "POST",
      body: JSON.stringify({
        type: "pemasukan",
        keterangan,
        nominal: parseInt(nominal),
        sumberdana_id,
      }),
    });

    if (result.success) {
      return {
        success: true,
        message:
          `✅ *Pemasukan Berhasil Dicatat!*\n\n` +
          `📝 *Keterangan:* ${keterangan}\n` +
          `💰 *Nominal:* ${await formatRupiah(nominal)}\n` +
          `🏦 *Sumber Dana:* ${sumber_dana}\n` +
          `📅 *Tanggal:* ${new Date().toISOString().split("T")[0]}\n\n` +
          `💳 *Saldo Terbaru:* ${await formatRupiah(result.data.saldo_terbaru)}`,
      };
    }

    return { error: result.message || "Gagal mencatat pemasukan" };
  },

  catat_pengeluaran: async (params) => {
    const { keterangan, nominal, sumber_dana } = params;

    if (!keterangan) return { error: "Keterangan tidak boleh kosong" };
    if (!nominal || nominal <= 0)
      return { error: "Nominal harus lebih dari 0" };
    if (!sumber_dana) return { error: "Sumber dana harus diisi" };

    const sumberdana_id = await getSumberDanaId(sumber_dana);
    if (!sumberdana_id) {
      return { error: `Sumber dana "${sumber_dana}" tidak ditemukan.` };
    }

    const result = await callAPI("/transaksi", {
      method: "POST",
      body: JSON.stringify({
        type: "pengeluaran",
        keterangan,
        nominal: parseInt(nominal),
        sumberdana_id,
      }),
    });

    if (result.success) {
      return {
        success: true,
        message:
          `✅ *Pengeluaran Berhasil Dicatat!*\n\n` +
          `📝 *Keterangan:* ${keterangan}\n` +
          `💰 *Nominal:* ${await formatRupiah(nominal)}\n` +
          `🏦 *Sumber Dana:* ${sumber_dana}\n` +
          `📅 *Tanggal:* ${new Date().toISOString().split("T")[0]}\n\n` +
          `💳 *Saldo Terbaru:* ${await formatRupiah(result.data.saldo_terbaru)}`,
      };
    }

    return { error: result.message || "Gagal mencatat pengeluaran" };
  },

  cek_saldo: async (params) => {
    const { sumber_dana } = params || {};

    let endpoint = "/saldo";
    if (sumber_dana) {
      const sumberdana_id = await getSumberDanaId(sumber_dana);
      if (!sumberdana_id) {
        return { error: `Sumber dana "${sumber_dana}" tidak ditemukan.` };
      }
      endpoint += `?sumberdana_id=${sumberdana_id}`;
    }

    const result = await callAPI(endpoint);

    if (result.success && result.data && result.data.length > 0) {
      let message = "💰 *Saldo Saat Ini:*\n\n";

      for (const item of result.data) {
        const saldoFormatted = await formatRupiah(item.saldo);
        const pemasukanFormatted = await formatRupiah(item.pemasukan);
        const pengeluaranFormatted = await formatRupiah(item.pengeluaran);

        message +=
          `🏦 *${item.nama_bank}*\n` +
          `   💳 Saldo: ${saldoFormatted}\n` +
          `   📈 Total Pemasukan: ${pemasukanFormatted}\n` +
          `   📉 Total Pengeluaran: ${pengeluaranFormatted}\n\n`;
      }

      return { success: true, message };
    }

    return { error: "Gagal mengambil data saldo" };
  },

  daftar_sumber_dana: async () => {
    const result = await callAPI("/sumberdana");

    if (result.success && result.data && result.data.length > 0) {
      let message = "🏦 *Daftar Sumber Dana:*\n\n";
      result.data.forEach((item, index) => {
        message += `${index + 1}. ${item.nama_bank}\n`;
      });
      message +=
        "\n_Gunakan nama sumber dana tersebut untuk mencatat transaksi._";
      return { success: true, message };
    }

    return { error: "Belum ada sumber dana yang terdaftar" };
  },
};
