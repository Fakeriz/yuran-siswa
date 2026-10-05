import { MoreHorizontal, type LucideIcon } from "lucide-react";

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
  /** Kapsyen di jalur footer, cth. "Total Pemasukan" */
  caption: string;
  /** Warna ikon: violet | green | pink | blue | amber */
  tone?: keyof typeof chipTone;
}

/**
 * Kad KPI putih di atas hero ungu — ikon gradien berwarna, nilai besar,
 * label kecil, dan jalur footer violet lut sinar selebar kad.
 */
export function FinanceKpi({ icon: Icon, value, label, caption, tone = "violet" }: FinanceKpiProps) {
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-lg shadow-black/5 dark:bg-slate-900 dark:shadow-black/30">
      <div className="flex min-w-0 items-center gap-3 p-4 pb-3">
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
      <div className="mt-auto flex items-center justify-between bg-violet-600/40 px-4 py-2.5 dark:bg-violet-400/25">
        <span className="truncate text-xs font-semibold text-white">{caption}</span>
        <MoreHorizontal className="size-4 shrink-0 text-white/80" aria-hidden />
      </div>
    </div>
  );
}
