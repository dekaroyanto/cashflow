/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Environment variables yang akan tersedia saat build
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Konfigurasi untuk deployment di Vercel
  output: "standalone",

  // Ignore type errors saat build (opsional)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Ignore ESLint errors saat build (opsional)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimasi gambar
  images: {
    unoptimized: true,
  },

  // Webpack konfigurasi (opsional)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
