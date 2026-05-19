"use client";

import Navbar from "./Navbar";

export default function LayoutWrapper({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-6xl pb-24 md:pb-6">
        {children}
      </div>
    </div>
  );
}
