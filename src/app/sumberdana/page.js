"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import LayoutWrapper from "../../components/LayoutWrapper";
import SumberDanaForm from "../../components/SumberDanaForm";
import SaldoCard from "../../components/SaldoCard";

export default function SumberDanaPage() {
  const [refresh, setRefresh] = useState(0);

  const handleSuccess = () => {
    setRefresh((prev) => prev + 1);
  };

  return (
    <LayoutWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SumberDanaForm onSuccess={handleSuccess} />
        </div>
        <div>
          <SaldoCard key={refresh} refreshTrigger={refresh} />
        </div>
      </div>
    </LayoutWrapper>
  );
}
