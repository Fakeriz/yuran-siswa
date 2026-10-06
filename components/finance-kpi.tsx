import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const chipTone: Record<string, string> = {
  violet: "bg-primary/10 text-primary",
  green: "bg-emerald-500/10 text-[var(--success)] dark:text-emerald-400",
  pink: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  blue: "bg-primary/10 text-primary",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

interface FinanceKpiProps {
  icon: LucideIcon;
  /** Nilai besar, cth. "RM 24,500.00" */
  value: string;
  /** Label kecil di bawah nilai */
  label: string;
  /** Warna ikon: violet (biru) | green | pink | blue | amber */
  tone?: keyof typeof chipTone;
  /** Baris detail polos di bawah (tanpa latar pil) */
  children?: ReactNode;
}

/**
 * Kad KPI minimal: ikon tonal, nilai besar, label kecil,
 * dan baris detail pilihan di bawah.
 */
export function FinanceKpi({ icon: Icon, value, label, tone = "violet", children }: FinanceKpiProps) {
  return (
    <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-border bg-card p-4 sm:p-5 text-card-foreground shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex min-w-0 items-center gap-3.5">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${chipTone[tone]}`}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xl font-bold sm:text-2xl">{value}</p>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
      {children ? (
        <div className="mt-3.5 border-t border-border/80 pt-3">{children}</div>
      ) : null}
    </div>
  );
}
