/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  // Nonaktifkan prerendering untuk halaman yang menggunakan chart
  // Ini akan membuat halaman di-render di client-side
  output: "standalone",
};

module.exports = nextConfig;
