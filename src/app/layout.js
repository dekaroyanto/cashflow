import "./globals.css";

export const metadata = {
  title: "CashFlow - Kelola Keuangan",
  description: "Aplikasi cashflow untuk Deka & Amelia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
