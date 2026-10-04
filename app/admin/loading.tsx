export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse p-2 sm:p-4">
      {/* 1. Header & Actions Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-64 rounded-xl bg-gray-200 dark:bg-slate-800" />
            <div className="h-6 w-24 rounded-md bg-gray-200 dark:bg-slate-800" />
          </div>
          <div className="mt-2 h-4 w-96 rounded-md bg-gray-200 dark:bg-slate-800" />
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-9 w-36 rounded-xl bg-gray-200 dark:bg-slate-800" />
          <div className="h-9 w-28 rounded-xl bg-gray-200 dark:bg-slate-800" />
          <div className="h-9 w-32 rounded-xl bg-gray-200 dark:bg-slate-800" />
          <div className="h-9 w-36 rounded-xl bg-gray-200 dark:bg-slate-800" />
        </div>
      </div>

      {/* 2. Empat Kotak Ringkasan KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 rounded-md bg-gray-200 dark:bg-slate-800" />
              <div className="size-9 rounded-xl bg-gray-200 dark:bg-slate-800" />
            </div>
            <div className="mt-4">
              <div className="h-8 w-36 rounded-lg bg-gray-200 dark:bg-slate-800" />
              <div className="mt-2 h-4 w-24 rounded-md bg-gray-200 dark:bg-slate-800" />
            </div>
            {i === 4 && (
              <div className="mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-slate-800" />
            )}
          </div>
        ))}
      </div>

      {/* 3. Ringkasan Grup Asrama Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 rounded-md bg-gray-200 dark:bg-slate-800" />
              <div className="h-5 w-20 rounded-md bg-gray-200 dark:bg-slate-800" />
            </div>
            <div className="mt-2 h-3.5 w-48 rounded-md bg-gray-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      {/* 4. Tabel Data & Toolbar Skeleton */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800">
          <div className="h-10 w-full max-w-sm rounded-xl bg-gray-200 dark:bg-slate-800" />
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-9 w-64 rounded-xl bg-gray-200 dark:bg-slate-800" />
            <div className="h-9 w-64 rounded-xl bg-gray-200 dark:bg-slate-800" />
          </div>
        </div>

        {/* Tabel Header & Rows */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-6 gap-4 border-b border-gray-100 pb-3 dark:border-slate-800">
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-slate-800" />
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-slate-800" />
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-slate-800" />
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-slate-800" />
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-slate-800" />
            <div className="h-4 w-16 rounded bg-gray-200 justify-self-end dark:bg-slate-800" />
          </div>

          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div key={row} className="grid grid-cols-6 items-center gap-4 py-3">
              <div className="h-4 w-16 rounded bg-gray-200 dark:bg-slate-800" />
              <div className="space-y-1.5">
                <div className="h-4 w-36 rounded bg-gray-200 dark:bg-slate-800" />
                <div className="h-3 w-20 rounded bg-gray-200 dark:bg-slate-800" />
              </div>
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-slate-800" />
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-slate-800" />
              <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-slate-800" />
              <div className="h-8 w-8 rounded-lg bg-gray-200 justify-self-end dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
