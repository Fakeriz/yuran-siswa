"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface AdminContextType {
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  requestExport: () => void;
  onExportRequest: (fn: () => void) => void;
  pageTitle: string;
  setPageTitle: (t: string) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState("Oktober");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [exportFn, setExportFn] = useState<(() => void) | null>(null);
  const [pageTitle, setPageTitle] = useState("Dasbor Pentadbiran Yuran");

  return (
    <AdminContext.Provider
      value={{
        selectedMonth,
        setSelectedMonth,
        selectedYear,
        setSelectedYear,
        requestExport: () => exportFn?.(),
        onExportRequest: (fn) => setExportFn(() => fn),
        pageTitle,
        setPageTitle,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
