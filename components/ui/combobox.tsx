"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from "react";
import { createPortal } from "react-dom";

/**
 * Combobox searchable minimal (tanpa dependency baharu).
 *
 * Dropdown di-render melalui portal ke document.body supaya tidak
 * terpotong oleh kontainer ber-overflow-hidden (cth. modal).
 *
 * Contoh penggunaan:
 * ```tsx
 * <Combobox items={siswa} itemToStringValue={(s) => s.nama} value={dipilih} onValueChange={setDipilih}>
 *   <ComboboxInput placeholder="Cari nama siswa..." />
 *   <ComboboxContent>
 *     <ComboboxEmpty>Tidak ada siswa ditemukan.</ComboboxEmpty>
 *     <ComboboxList>
 *       {(s) => (
 *         <ComboboxItem key={s.id}>
 *           <Item>
 *             <ItemContent>
 *               <ItemTitle>{s.nama}</ItemTitle>
 *               <ItemDescription>{s.grup}</ItemDescription>
 *             </ItemContent>
 *           </Item>
 *         </ComboboxItem>
 *       )}
 *     </ComboboxList>
 *   </ComboboxContent>
 * </Combobox>
 * ```
 */

interface ComboboxContextValue<T> {
  itemToStringValue: (item: T) => string;
  filtered: T[];
  value: T | null;
  selectItem: (item: T) => void;
  clearSelection: () => void;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  activeIndex: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  listId: string;
  anchorRef: RefObject<HTMLDivElement | null>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ComboboxContext = createContext<ComboboxContextValue<any> | null>(null);

function useCombobox<T>(): ComboboxContextValue<T> {
  const ctx = useContext(ComboboxContext);
  if (!ctx) throw new Error("Komponen Combobox mesti digunakan di dalam <Combobox>.");
  return ctx;
}

interface ComboboxProps<T> {
  items: T[];
  itemToStringValue: (item: T) => string;
  value: T | null;
  onValueChange: (item: T | null) => void;
  children: ReactNode;
  className?: string;
}

export function Combobox<T>({
  items,
  itemToStringValue,
  value,
  onValueChange,
  children,
  className = "",
}: ComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value ? itemToStringValue(value) : "");
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();
  const anchorRef = useRef<HTMLDivElement | null>(null);

  // Selaraskan teks input apabila pilihan berubah dari luar (cth. reset borang)
  useEffect(() => {
    setInputValue(value ? itemToStringValue(value) : "");
  }, [value, itemToStringValue]);

  const filtered = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => itemToStringValue(item).toLowerCase().includes(q));
  }, [items, inputValue, itemToStringValue]);

  const selectItem = (item: T) => {
    onValueChange(item);
    setInputValue(itemToStringValue(item));
    setOpen(false);
    setActiveIndex(-1);
  };

  const clearSelection = () => onValueChange(null);

  // Tutup apabila klik di luar
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const ctx: ComboboxContextValue<T> = {
    itemToStringValue,
    filtered,
    value,
    selectItem,
    clearSelection,
    open,
    setOpen,
    inputValue,
    setInputValue,
    activeIndex,
    setActiveIndex,
    listId,
    anchorRef,
  };

  return (
    <ComboboxContext.Provider value={ctx}>
      <div ref={anchorRef} className={className}>
        {children}
      </div>
    </ComboboxContext.Provider>
  );
}

export function ComboboxInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const { open, setOpen, inputValue, setInputValue, filtered, activeIndex, setActiveIndex, selectItem, clearSelection, listId } =
    useCombobox();

  return (
    <input
      {...props}
      type="text"
      role="combobox"
      aria-expanded={open}
      aria-controls={listId}
      aria-autocomplete="list"
      aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
      autoComplete="off"
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
        clearSelection();
        setOpen(true);
        setActiveIndex(-1);
      }}
      onFocus={() => setOpen(true)}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setOpen(true);
          setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, -1));
        } else if (e.key === "Enter") {
          if (open && activeIndex >= 0 && filtered[activeIndex]) {
            e.preventDefault();
            selectItem(filtered[activeIndex]);
          }
        } else if (e.key === "Escape") {
          setOpen(false);
        }
      }}
      className={`w-full ${className}`}
    />
  );
}

const DROPDOWN_MAX_H = 240;

export function ComboboxContent({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { open, listId, anchorRef } = useCombobox();
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const top =
        spaceBelow >= DROPDOWN_MAX_H + 8
          ? rect.bottom + 4
          : Math.max(8, rect.top - DROPDOWN_MAX_H - 4);
      setPos({ top, left: rect.left, width: rect.width });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef]);

  if (!open || !pos) return null;

  return createPortal(
    <div
      id={listId}
      role="listbox"
      {...props}
      style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: DROPDOWN_MAX_H }}
      className={`fixed z-[120] overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-800 ${className}`}
    >
      {children}
    </div>,
    document.body
  );
}

export function ComboboxEmpty({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { filtered } = useCombobox();
  if (filtered.length > 0) return null;
  return (
    <div className={`px-3 py-2 text-sm text-slate-500 dark:text-slate-400 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function ComboboxList<T>({ children }: { children: (item: T, index: number) => ReactNode }) {
  const { filtered, selectItem, activeIndex, setActiveIndex, listId, value, itemToStringValue } =
    useCombobox<T>();
  return (
    <>
      {filtered.map((item, index) => {
        const isActive = index === activeIndex;
        const isSelected = value !== null && itemToStringValue(value) === itemToStringValue(item);
        return (
          <div
            key={`${index}-${itemToStringValue(item)}`}
            id={`${listId}-option-${index}`}
            role="option"
            aria-selected={isSelected}
            onMouseDown={(e) => {
              // Pilih sebelum input kehilangan fokus
              e.preventDefault();
              selectItem(item);
            }}
            onMouseEnter={() => setActiveIndex(index)}
            className={`cursor-pointer rounded-lg ${isActive ? "bg-violet-50 dark:bg-violet-500/10" : ""}`}
          >
            {children(item, index)}
          </div>
        );
      })}
    </>
  );
}

export function ComboboxItem({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
