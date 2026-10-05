import type { HTMLAttributes } from "react";

/**
 * Primitif Item — baris kandungan berstruktur untuk senarai
 * (tajuk + deskripsi), gaya selari dengan aplikasi.
 */

export function Item({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex w-full items-center gap-3 ${className}`} {...props} />;
}

export function ItemContent({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex min-w-0 flex-1 flex-col ${className}`} {...props} />;
}

export function ItemTitle({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`truncate text-sm font-medium text-foreground ${className}`} {...props} />
  );
}

export function ItemDescription({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`truncate text-xs text-muted-foreground ${className}`} {...props} />
  );
}
