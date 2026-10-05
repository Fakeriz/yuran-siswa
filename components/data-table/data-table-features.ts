import {
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_text,
  tableFeatures,
} from "@tanstack/react-table";

/**
 * Ciri TanStack Table yang digunakan aplikasi — apa yang tidak
 * didaftarkan di sini akan di-tree-shake keluar dari bundle.
 */
export const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    text: sortFn_text,
  },
});

/** Jenis ciri untuk generik ColumnDef / Column / Table / Row. */
export type DataTableFeatures = typeof features;
