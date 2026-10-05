import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const chipTone: Record<string, string> = {
  violet: "from-violet-500 to-purple-600",
  green: "from-emerald-400 to-green-500",
  pink: "from-pink-500 to-rose-500",
  blue: "from-sky-400 to-blue-500",
  amber: "from-amber-400 to-orange-500",
};

interface FinanceKpiProps {
  icon: LucideIcon;
  /** Nilai besar, cth. "RM 24,500.00" */
  value: string;
  /** Label kecil di bawah nilai */
  label: string;
  /** Warna ikon: violet | green | pink | blue | amber */
  tone?: keyof typeof chipTone;
  /** Baris detail polos di bawah (tanpa latar pil) */
  children?: ReactNode;
}

/**
 * Kad KPI putih di atas hero ungu — ikon gradien berwarna, nilai besar,
 * label kecil, dan baris detail pilihan di bawah.
 */
export function FinanceKpi({ icon: Icon, value, label, tone = "violet", children }: FinanceKpiProps) {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl bg-white p-4 shadow-lg shadow-black/5 dark:bg-slate-900 dark:shadow-black/30">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${chipTone[tone]}`}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">{value}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
      {children ? (
        <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">{children}</div>
      ) : null}
    </div>
  );
}
