"use client";

import { useRouter } from "next/navigation";
import { TableFilterDropdown } from "./table-filter-dropdown";

export function StaffFilterDropdown({
  currentFilter,
  bulan,
  tahun,
}: {
  currentFilter: string;
  bulan: number;
  tahun: number;
}) {
  const router = useRouter();

  return (
    <TableFilterDropdown
      label="Filter Siswa"
      align="left"
      onReset={() => {
        router.push(`/staff?bulan=${bulan}&tahun=${tahun}&filter=semua`);
      }}
      sections={[
        {
          id: "filter",
          label: "Status Pembayaran",
          defaultValue: "semua",
          selected: currentFilter,
          onChange: (val) => {
            router.push(`/staff?bulan=${bulan}&tahun=${tahun}&filter=${val}`);
          },
          options: [
            { value: "semua", label: "Semua Siswa" },
            { value: "sudah", label: "Sudah Bayar" },
            { value: "belum", label: "Belum Bayar" },
          ],
        },
      ]}
    />
  );
}
