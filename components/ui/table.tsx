import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

/**
 * Primitif Table tempatan — gaya selari dengan tabel sedia ada aplikasi.
 */

export function Table({ className = "", ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={`w-full text-left text-sm text-slate-700 dark:text-slate-300 ${className}`}
      {...props}
    />
  );
}

export function TableHeader({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <thead
      className={`bg-slate-50/80 border-b border-slate-200 dark:bg-slate-800/80 dark:border-slate-700 ${className}`}
      {...props}
    />
  );
}

export function TableBody({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <tbody className={`divide-y divide-slate-100 dark:divide-slate-800 ${className}`} {...props} />
  );
}

export function TableRow({ className = "", ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={className} {...props} />;
}

export function TableHead({ className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={`px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400 ${className}`}
      {...props}
    />
  );
}

export function TableCell({ className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-5 py-4 ${className}`} {...props} />;
}
