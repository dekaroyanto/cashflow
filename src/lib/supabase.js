import { createClient } from "@supabase/supabase-js";

// Cek environment variables dengan error handling yang lebih baik
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log untuk debugging (hanya di development dan client-side)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  if (!supabaseUrl) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!supabaseKey) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
}

// Buat dummy client untuk fallback saat build
let supabase;

if (!supabaseUrl || !supabaseKey) {
  if (typeof window !== "undefined") {
    console.warn("⚠️ Supabase credentials missing. Using dummy client.");
  }
  // Dummy client untuk fallback
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ error: null }),
      update: () => Promise.resolve({ error: null }),
      delete: () => Promise.resolve({ error: null }),
      eq: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
    },
  };
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };
