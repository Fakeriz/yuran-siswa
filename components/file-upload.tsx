"use client";
// Adapted from beui.dev/components/blocks/file-upload
// - motion/react replaced with CSS keyframe animations (no new dependency)
// - @/lib/utils (cn) and @/lib/ease replaced with local helpers
// - shadcn theme tokens mapped to Tailwind gray/slate with class-based dark mode
// - labels in Bahasa Malaysia to match the app

import {
  AlertCircle,
  CheckCircle2,
  FileArchive,
  FileAudio,
  FileCode2,
  FileIcon,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Loader2,
  RotateCcw,
  UploadCloud,
  X,
} from "lucide-react";
import { useCallback, useId, useRef, useState } from "react";

export type FileUploadStatus = "queued" | "uploading" | "success" | "error";
export type FileUploadVariant = "default" | "centered";

export type FileUploadItem = {
  id: string;
  name: string;
  size: number;
  type?: string;
  progress?: number;
  status?: FileUploadStatus;
  error?: string;
  file?: File;
};

export type FileUploadClassNames = {
  root?: string;
  dropzone?: string;
  queue?: string;
  item?: string;
  leading?: string;
  content?: string;
  name?: string;
  meta?: string;
  progress?: string;
  action?: string;
};

export interface FileUploadProps {
  value?: FileUploadItem[];
  defaultValue?: FileUploadItem[];
  onValueChange?: (items: FileUploadItem[]) => void;
  onFilesAdded?: (items: FileUploadItem[], files: File[]) => void;
  onRemove?: (item: FileUploadItem) => void;
  onRetry?: (item: FileUploadItem) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
  variant?: FileUploadVariant;
  title?: string;
  description?: string;
  browseLabel?: string;
  className?: string;
  classNames?: FileUploadClassNames;
}

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const STATUS_LABEL: Record<FileUploadStatus, string> = {
  queued: "Beratur",
  uploading: "Memuat naik",
  success: "Berjaya",
  error: "Gagal",
};

const STATUS_TONE: Record<FileUploadStatus, string> = {
  queued: "text-muted-foreground",
  uploading: "text-foreground",
  success: "text-emerald-600",
  error: "text-rose-600",
};

function useControllableUpload({
  value,
  defaultValue,
  onValueChange,
}: {
  value?: FileUploadItem[];
  defaultValue?: FileUploadItem[];
  onValueChange?: (items: FileUploadItem[]) => void;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? []);
  const isControlled = value !== undefined;
  const items = value ?? internalValue;

  const setItems = useCallback(
    (next: FileUploadItem[]) => {
      if (!isControlled) {
        setInternalValue(next);
      }

      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  return [items, setItems] as const;
}

function clampProgress(value: number | undefined, status: FileUploadStatus) {
  if (status === "success") return 100;
  if (value === undefined || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;

  return `${value >= 10 || exponent === 0 ? value.toFixed(0) : value.toFixed(1)} ${
    units[exponent]
  }`;
}

function fileKind(item: FileUploadItem) {
  const extension = item.name.includes(".")
    ? item.name.split(".").pop()
    : undefined;

  if (extension) return extension.toUpperCase();
  if (item.type) return item.type.split("/").pop()?.toUpperCase();
  return "FAIL";
}

function getFileIcon(item: FileUploadItem) {
  const extension = item.name.includes(".")
    ? item.name.split(".").pop()?.toLowerCase()
    : undefined;
  const type = item.type ?? "";

  if (type.startsWith("image/")) return FileImage;
  if (type.startsWith("video/")) return FileVideo;
  if (type.startsWith("audio/")) return FileAudio;
  if (
    type.includes("zip") ||
    type.includes("compressed") ||
    ["zip", "rar", "7z", "tar", "gz"].includes(extension ?? "")
  ) {
    return FileArchive;
  }
  if (
    type.includes("spreadsheet") ||
    type.includes("excel") ||
    ["csv", "xls", "xlsx"].includes(extension ?? "")
  ) {
    return FileSpreadsheet;
  }
  if (
    type.includes("pdf") ||
    type.startsWith("text/") ||
    ["pdf", "doc", "docx", "md", "txt"].includes(extension ?? "")
  ) {
    return FileText;
  }
  if (
    [
      "css",
      "html",
      "js",
      "jsx",
      "json",
      "mdx",
      "ts",
      "tsx",
      "xml",
      "yaml",
      "yml",
    ].includes(extension ?? "")
  ) {
    return FileCode2;
  }

  return FileIcon;
}

export function createFileUploadItem(file: File, index = 0): FileUploadItem {
  return {
    id: `${Date.now()}-${index}-${file.name}`,
    name: file.name,
    size: file.size,
    type: file.type,
    progress: 0,
    status: "uploading",
    file,
  };
}

function StatusIcon({ status }: { status: FileUploadStatus }) {
  const iconClassName = "size-4";

  return (
    <span
      key={status}
      className={cx(
        "fu-status grid size-6 shrink-0 place-items-center",
        STATUS_TONE[status],
      )}
    >
      {status === "success" ? (
        <CheckCircle2 className={iconClassName} />
      ) : status === "error" ? (
        <AlertCircle className={iconClassName} />
      ) : status === "uploading" ? (
        <Loader2 className={cx(iconClassName, "animate-spin")} />
      ) : (
        <FileIcon className={iconClassName} />
      )}
      <span className="sr-only">{STATUS_LABEL[status]}</span>
    </span>
  );
}

function FileUploadRow({
  item,
  onRemove,
  onRetry,
  classNames,
}: {
  item: FileUploadItem;
  onRemove: (item: FileUploadItem) => void;
  onRetry: (item: FileUploadItem) => void;
  classNames?: FileUploadClassNames;
}) {
  const status = item.status ?? "queued";
  const progress = clampProgress(item.progress, status);
  const showProgress = status === "uploading" || status === "success";
  const LeadingIcon = getFileIcon(item);

  return (
    <li
      className={cx(
        "fu-row relative overflow-hidden rounded-2xl border border-border bg-card p-3",
        classNames?.item,
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cx(
            "grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground",
            classNames?.leading,
          )}
        >
          <LeadingIcon className="size-5" />
        </div>

        <div className={cx("min-w-0 flex-1", classNames?.content)}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className={cx(
                  "truncate text-sm font-medium text-foreground",
                  classNames?.name,
                )}
              >
                {item.name}
              </p>
              <p
                className={cx(
                  "mt-0.5 truncate text-xs text-muted-foreground",
                  classNames?.meta,
                )}
              >
                {fileKind(item)} · {formatBytes(item.size)}
                {status === "error" && item.error ? ` · ${item.error}` : null}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <StatusIcon status={status} />
              {status === "error" ? (
                <button
                  type="button"
                  onClick={() => onRetry(item)}
                  aria-label={`Cuba semula ${item.name}`}
                  className={cx(
                    "grid size-7 place-items-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground active:scale-95",
                    classNames?.action,
                  )}
                >
                  <RotateCcw className="size-3.5" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onRemove(item)}
                aria-label={`Buang ${item.name}`}
                className={cx(
                  "grid size-7 place-items-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground active:scale-95",
                  classNames?.action,
                )}
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {showProgress ? (
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              aria-label={`Kemajuan muat naik ${item.name}`}
              className={cx(
                "mt-3 h-1.5 overflow-hidden rounded-full bg-muted",
                classNames?.progress,
              )}
            >
              <div
                className={cx(
                  "h-full rounded-full transition-[width] duration-300 ease-out",
                  status === "success" ? "bg-emerald-500" : "bg-emerald-400",
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function FileUpload({
  value,
  defaultValue,
  onValueChange,
  onFilesAdded,
  onRemove,
  onRetry,
  accept,
  multiple = true,
  maxFiles,
  disabled = false,
  variant = "default",
  title = "Letak fail di sini",
  description = "Tambah fail ke barisan muat naik",
  browseLabel = "Pilih",
  className,
  classNames,
}: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const [items, setItems] = useControllableUpload({
    value,
    defaultValue,
    onValueChange,
  });
  const [dragging, setDragging] = useState(false);

  const commit = useCallback(
    (next: FileUploadItem[]) => {
      setItems(next);
    },
    [setItems],
  );

  const addFiles = useCallback(
    (incomingFiles: File[]) => {
      if (disabled || incomingFiles.length === 0) return;

      const remainingSlots =
        maxFiles === undefined ? incomingFiles.length : maxFiles - items.length;
      if (remainingSlots <= 0) return;

      const files = incomingFiles.slice(
        0,
        multiple ? remainingSlots : Math.min(1, remainingSlots),
      );
      const added = files.map((file, index) => createFileUploadItem(file, index));

      if (added.length === 0) return;

      commit([...items, ...added]);
      onFilesAdded?.(added, files);
    },
    [commit, disabled, items, maxFiles, multiple, onFilesAdded],
  );

  const removeItem = useCallback(
    (item: FileUploadItem) => {
      commit(items.filter((entry) => entry.id !== item.id));
      onRemove?.(item);
    },
    [commit, items, onRemove],
  );

  const retryItem = useCallback(
    (item: FileUploadItem) => {
      const retryingItem = {
        ...item,
        error: undefined,
        progress: 0,
        status: "uploading" as const,
      };

      commit(
        items.map((entry) => (entry.id === item.id ? retryingItem : entry)),
      );
      onRetry?.(retryingItem);
    },
    [commit, items, onRetry],
  );

  const resetDrag = useCallback(() => {
    dragDepthRef.current = 0;
    setDragging(false);
  }, []);

  const maxReached = maxFiles !== undefined && items.length >= maxFiles;
  const centered = variant === "centered";

  return (
    <div className={cx("w-full space-y-3", className, classNames?.root)}>
      <style>{`
        @keyframes fu-row-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fu-status-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fu-row { animation: fu-row-in 0.22s cubic-bezier(0.16, 1, 0.3, 1); }
        .fu-status { animation: fu-status-in 0.16s cubic-bezier(0.16, 1, 0.3, 1); }
        @media (prefers-reduced-motion: reduce) {
          .fu-row, .fu-status { animation: none; }
        }
      `}</style>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        aria-label="Muat naik fail"
        accept={accept}
        multiple={multiple}
        disabled={disabled || maxReached}
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => {
          addFiles(Array.from(event.currentTarget.files ?? []));
          event.currentTarget.value = "";
        }}
      />

      <button
        type="button"
        disabled={disabled || maxReached}
        data-dragging={dragging}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          if (disabled || maxReached) return;
          event.preventDefault();
          dragDepthRef.current += 1;
          setDragging(true);
        }}
        onDragOver={(event) => {
          if (disabled || maxReached) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (disabled || maxReached) return;
          event.preventDefault();
          dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
          if (dragDepthRef.current === 0) setDragging(false);
        }}
        onDrop={(event) => {
          if (disabled || maxReached) return;
          event.preventDefault();
          resetDrag();
          addFiles(Array.from(event.dataTransfer.files));
        }}
        className={cx(
          "group relative flex w-full overflow-hidden rounded-3xl border border-dashed border-input bg-card outline-none",
          "transition-[border-color,transform] duration-200 active:scale-[0.99]",
          "hover:border-gray-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
          "data-[dragging=true]:border-emerald-500 data-[dragging=true]:bg-emerald-50/50",
          "disabled:pointer-events-none disabled:opacity-55",
          "dark:data-[dragging=true]:border-emerald-500 dark:data-[dragging=true]:bg-emerald-950/30",
          centered
            ? "min-h-56 flex-col items-center justify-center gap-3 p-7 text-center"
            : "items-center gap-4 p-5 text-left",
          classNames?.dropzone,
        )}
      >
        <span
          aria-hidden="true"
          className={cx(
            "grid shrink-0 place-items-center bg-muted text-muted-foreground transition-transform duration-200",
            dragging && "-translate-y-0.5",
            centered
              ? "size-16 rounded-[1.35rem] border border-border"
              : "size-14 rounded-[1.25rem]",
          )}
        >
          <UploadCloud className={centered ? "size-7" : "size-6"} />
        </span>

        <span className={cx("min-w-0", centered ? "max-w-xs" : "flex-1")}>
          <span
            className={cx(
              "block font-semibold text-foreground",
              centered ? "text-base" : "text-sm",
            )}
          >
            {maxReached ? "Had muat naik dicapai" : title}
          </span>
          <span
            className={cx(
              "block text-xs text-muted-foreground",
              centered ? "mt-1 leading-5" : "mt-0.5",
            )}
          >
            {maxReached
              ? `${items.length} daripada ${maxFiles} fail ditambah`
              : description}
          </span>
        </span>

        <span
          className={cx(
            "shrink-0 rounded-full border border-border text-xs font-medium text-foreground transition-colors duration-150 group-hover:bg-muted dark:group-hover:bg-slate-800",
            centered ? "mt-1 px-4 py-2" : "px-3.5 py-2",
          )}
        >
          {browseLabel}
        </span>
      </button>

      <ul className={cx("space-y-2", classNames?.queue)}>
        {items.map((item) => (
          <FileUploadRow
            key={item.id}
            item={item}
            onRemove={removeItem}
            onRetry={retryItem}
            classNames={classNames}
          />
        ))}
      </ul>
    </div>
  );
}
