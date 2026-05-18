/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Environment variables yang akan tersedia saat build
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Konfigurasi untuk deployment di Vercel
  output: "standalone",

  // Optimasi gambar
  images: {
    unoptimized: true,
  },

  // Konfigurasi Turbopack (menggantikan webpack)
  turbopack: {
    // Atur root project jika perlu
    // root: path.join(__dirname, '.'),

    // Resolve aliases jika diperlukan
    resolveAlias: {
      // Contoh: jika butuh alias
      // '@': './src',
    },

    // Rules untuk loader kustom (jika diperlukan)
    rules: {
      // Contoh untuk SVG
      // '*.svg': {
      //   loaders: ['@svgr/webpack'],
      //   as: '*.js',
      // },
    },
  },
};

export default nextConfig;
