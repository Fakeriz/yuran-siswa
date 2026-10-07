"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { Column, RowData } from "@tanstack/react-table";
import type { DataTableFeatures } from "./data-table-features";

interface DataTableColumnHeaderProps<TData extends RowData, TValue> {
  column: Column<DataTableFeatures, TData, TValue>;
  title: string;
  align?: "left" | "center" | "right";
}

/** Kepala kolom boleh-susun — klik untuk susun menaik/menurun. */
export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  align = "left",
}: DataTableColumnHeaderProps<TData, TValue>) {
  const sorted = column.getIsSorted();

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      title={`Susun sesuai ${title}`}
      className={`inline-flex items-center gap-1.5 transition-colors hover:text-foreground ${
        align === "center" ? "w-full justify-center" : ""
      } ${align === "right" ? "w-full justify-end" : ""}`}
    >
      <span>{title}</span>
      {sorted === "asc" ? (
        <ArrowUp className="size-3.5" aria-hidden />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3.5" aria-hidden />
      ) : (
        <ArrowUpDown className="size-3.5 opacity-40" aria-hidden />
      )}
    </button>
  );
}
