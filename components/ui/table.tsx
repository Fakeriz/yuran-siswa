import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

/**
 * Primitif Table tempatan — gaya selari dengan tabel yang ada aplikasi.
 */

export function Table({ className = "", ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={`w-full text-left text-sm text-foreground ${className}`}
      {...props}
    />
  );
}

export function TableHeader({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <thead
      className={`bg-muted/80 border-b border-border ${className}`}
      {...props}
    />
  );
}

export function TableBody({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <tbody className={`divide-y divide-border ${className}`} {...props} />
  );
}

export function TableRow({ className = "", ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={className} {...props} />;
}

export function TableHead({ className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={`px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${className}`}
      {...props}
    />
  );
}

export function TableCell({ className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-5 py-4 ${className}`} {...props} />;
}
