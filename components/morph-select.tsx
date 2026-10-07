"use client";
// Adapted from beui.dev/components/motion/select
// - motion/react shared-layout morph replaced with a CSS approximation:
//   the panel header is pixel-identical to the trigger, and the option list
//   expands beneath it via an animated grid-template-rows (spring-like
//   easing), so the trigger reads as growing into the panel and shrinking
//   back. No new dependency.
// - @/lib/utils replaced with a local cx helper.
// - shadcn theme tokens mapped to Tailwind gray/slate with class-based dark mode.
// - placeholder default in Bahasa Malaysia.

import { Check, ChevronDown } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setReduce(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

// Shared-layout morph: trigger box grows into the panel and back, one surface.
// (CSS approximation of the original spring: duration 0.45s, slight overshoot.)
const MORPH_EASE = "cubic-bezier(0.34, 1.25, 0.64, 1)";
// Trigger and panel header share this row so the morph stays seamless.
const ROW = "flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-sm";

const EXIT_MS = 450;
const EXIT_MS_REDUCED = 140;

interface MorphContextValue {
  value: string | undefined;
  open: boolean;
  setOpen: (open: boolean) => void;
  select: (value: string) => void;
  register: (value: string, label: string) => void;
  unregister: (value: string) => void;
  labelFor: (value: string | undefined) => string | undefined;
  placeholder: string;
  setPlaceholder: (p: string) => void;
  layoutId: string;
  triggerId: string;
  listId: string;
  disabled: boolean;
}

const MorphContext = createContext<MorphContextValue | null>(null);

function useMorphContext(component: string) {
  const ctx = useContext(MorphContext);
  if (!ctx) throw new Error(`${component} must be used within <MorphSelect>`);
  return ctx;
}

export interface MorphSelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Select whose trigger morphs into the panel — instead of a separate
 * dropdown opening, the trigger itself grows into the menu and shrinks back,
 * never detaching. Composable like `Select`.
 */
export function MorphSelect({
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  className,
  children,
}: MorphSelectProps) {
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue);
  // ref-counted: items render twice (hidden registrar + open panel), so a
  // label is only dropped once every copy with that value has unmounted.
  const [labels, setLabels] = useState<
    Map<string, { label: string; count: number }>
  >(new Map());
  const [placeholder, setPlaceholder] = useState("Pilih");

  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  const select = useCallback(
    (next: string) => {
      if (!controlled) setInternal(next);
      onValueChange?.(next);
      setOpen(false);
    },
    [controlled, onValueChange],
  );

  const register = useCallback((v: string, label: string) => {
    setLabels((m) => {
      const next = new Map(m);
      next.set(v, { label, count: (m.get(v)?.count ?? 0) + 1 });
      return next;
    });
  }, []);
  const unregister = useCallback((v: string) => {
    setLabels((m) => {
      const entry = m.get(v);
      if (!entry) return m;
      const next = new Map(m);
      if (entry.count <= 1) next.delete(v);
      else next.set(v, { label: entry.label, count: entry.count - 1 });
      return next;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open ]);

  const ctx = useMemo<MorphContextValue>(
    () => ({
      value: current,
      open,
      setOpen,
      select,
      register,
      unregister,
      labelFor: (v) => (v === undefined ? undefined : labels.get(v)?.label),
      placeholder,
      setPlaceholder,
      layoutId: `${baseId}-surface`,
      triggerId: `${baseId}-trigger`,
      listId: `${baseId}-list`,
      disabled,
    }),
    [
      current,
      open,
      select,
      register,
      unregister,
      labels,
      placeholder,
      baseId,
      disabled,
    ],
  );

  return (
    <MorphContext.Provider value={ctx}>
      <div ref={rootRef} className={cx("relative", className)}>
        {children}
      </div>
    </MorphContext.Provider>
  );
}

export interface MorphSelectValueProps {
  placeholder?: string;
  className?: string;
}

export function MorphSelectValue({
  placeholder,
  className,
}: MorphSelectValueProps) {
  const ctx = useMorphContext("MorphSelectValue");
  // surface the placeholder so the morph header (rendered by content) matches
  const setPlaceholder = ctx.setPlaceholder;
  useEffect(() => {
    if (placeholder) setPlaceholder(placeholder);
  }, [placeholder, setPlaceholder]);
  const label = ctx.labelFor(ctx.value);
  return (
    <span
      className={cx(
        label
          ? "text-gray-900"
          : "text-gray-400",
        className,
      )}
    >
      {label ?? placeholder ?? "Pilih"}
    </span>
  );
}

export interface MorphSelectTriggerProps {
  className?: string;
  children: ReactNode;
}

export function MorphSelectTrigger({
  className,
  children,
}: MorphSelectTriggerProps) {
  const ctx = useMorphContext("MorphSelectTrigger");
  return (
    <>
      {/* invisible sizer reserves the closed height (the morph surface is
          absolute, so this keeps surrounding layout from shifting) */}
      <div
        aria-hidden
        inert
        className={cx(
          ROW,
          "invisible rounded-xl border border-gray-300",
        )}
      >
        {children}
        <ChevronDown className="size-4" />
      </div>

      {!ctx.open ? (
        <button
          type="button"
          id={ctx.triggerId}
          disabled={ctx.disabled}
          aria-haspopup="listbox"
          aria-expanded={ctx.open}
          aria-controls={ctx.listId}
          onClick={() => ctx.setOpen(true)}
          style={{ borderRadius: 12 }}
          className={cx(
            ROW,
            "absolute inset-x-0 top-0 z-10 border border-gray-300 bg-card text-gray-900 outline-none transition-colors",
            "hover:border-gray-400 focus-visible:ring-2 focus-visible:ring-emerald-500/30",
            "disabled:pointer-events-none disabled:opacity-50",
            "",
            className,
          )}
        >
          <span className="min-w-0 truncate">{children}</span>
          <span className="text-gray-400">
            <ChevronDown className="size-4" />
          </span>
        </button>
      ) : null}
    </>
  );
}

export interface MorphSelectContentProps {
  className?: string;
  children: ReactNode;
}

export function MorphSelectContent({
  className,
  children,
}: MorphSelectContentProps) {
  const ctx = useMorphContext("MorphSelectContent");
  const reduce = usePrefersReducedMotion();
  const label = ctx.labelFor(ctx.value);
  const [panelVisible, setPanelVisible] = useState(false);
  const [phase, setPhase] = useState<"enter" | "open" | "exit">("enter");
  const visibleRef = useRef(false);

  const open = ctx.open;
  const exitMs = reduce ? EXIT_MS_REDUCED : EXIT_MS;

  // Keep the panel mounted through the collapse so it shrinks back into
  // the trigger instead of vanishing.
  useEffect(() => {
    if (open) {
      visibleRef.current = true;
      setPanelVisible(true);
      setPhase("enter");
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setPhase("open")),
      );
      return () => cancelAnimationFrame(raf);
    }
    if (visibleRef.current) {
      setPhase("exit");
      const timer = window.setTimeout(() => {
        visibleRef.current = false;
        setPanelVisible(false);
        setPhase("enter");
      }, exitMs);
      return () => window.clearTimeout(timer);
    }
  }, [open, exitMs]);

  const isOpen = phase === "open";

  return (
    <>
      <style>{`
        .fu-select-list-wrap {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition:
            grid-template-rows 0.45s ${MORPH_EASE},
            opacity 0.2s ease;
        }
        .fu-select-list-wrap.fu-open {
          grid-template-rows: 1fr;
          opacity: 1;
        }
        .fu-select-list-inner {
          overflow: hidden;
          min-height: 0;
        }
        .fu-select-panel .fu-select-chevron {
          transition: transform 0.45s ${MORPH_EASE};
        }
        .fu-select-panel.fu-open .fu-select-chevron {
          transform: rotate(180deg);
        }
        .fu-select-item {
          opacity: 0;
        }
        .fu-select-panel.fu-open .fu-select-item {
          animation: fu-select-item-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .fu-select-panel.fu-open .fu-select-item:nth-child(1) { animation-delay: 0.08s; }
        .fu-select-panel.fu-open .fu-select-item:nth-child(2) { animation-delay: 0.115s; }
        .fu-select-panel.fu-open .fu-select-item:nth-child(3) { animation-delay: 0.15s; }
        .fu-select-panel.fu-open .fu-select-item:nth-child(4) { animation-delay: 0.185s; }
        .fu-select-panel.fu-open .fu-select-item:nth-child(5) { animation-delay: 0.22s; }
        .fu-select-panel.fu-open .fu-select-item:nth-child(6) { animation-delay: 0.255s; }
        .fu-select-panel.fu-open .fu-select-item:nth-child(7) { animation-delay: 0.29s; }
        .fu-select-panel.fu-open .fu-select-item:nth-child(8) { animation-delay: 0.325s; }
        .fu-select-panel.fu-open .fu-select-item:nth-child(9) { animation-delay: 0.36s; }
        .fu-select-panel.fu-open .fu-select-item:nth-child(10) { animation-delay: 0.395s; }
        @keyframes fu-select-item-in {
          from { opacity: 0; transform: translateY(-6px); filter: blur(3px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .fu-select-list-wrap {
            transition: opacity 0.14s ease-out;
          }
          .fu-select-panel.fu-open .fu-select-item {
            animation: none;
            opacity: 1;
          }
          .fu-select-panel .fu-select-chevron {
            transition-duration: 0.12s;
          }
        }
      `}</style>

      {/* always-mounted, hidden — keeps item label registrations alive while
          closed so the trigger shows the selected value before first open */}
      <div className="hidden" aria-hidden>
        {children}
      </div>

      {panelVisible ? (
        <div
          id={ctx.listId}
          role="listbox"
          aria-labelledby={ctx.triggerId}
          style={{ borderRadius: 12 }}
          className={cx(
            "fu-select-panel absolute inset-x-0 top-0 z-30 overflow-hidden border border-gray-300 bg-card shadow-lg",
            isOpen && "fu-open",
            className,
          )}
        >
          {/* header mirrors the trigger (continuous morph) and collapses the
              panel back into the trigger when clicked */}
          <button
            type="button"
            aria-expanded
            onClick={() => ctx.setOpen(false)}
            className={cx(ROW, "text-gray-900 outline-none")}
          >
            <span
              className={cx(
                "min-w-0 truncate",
                label
                  ? "text-gray-900"
                  : "text-gray-400",
              )}
            >
              {label ?? ctx.placeholder}
            </span>
            <span className="fu-select-chevron text-gray-400">
              <ChevronDown className="size-4" />
            </span>
          </button>

          <div className={cx("fu-select-list-wrap", isOpen && "fu-open")}>
            <div className="fu-select-list-inner">
              <div className="h-px bg-muted" />
              <ul className="p-1">{children}</ul>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export interface MorphSelectItemProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function MorphSelectItem({
  value,
  disabled = false,
  className,
  children,
}: MorphSelectItemProps) {
  const ctx = useMorphContext("MorphSelectItem");
  const selected = ctx.value === value;
  const label = typeof children === "string" ? children : value;

  useLayoutEffect(() => {
    ctx.register(value, label);
    return () => ctx.unregister(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.register, ctx.unregister, value, label]);

  return (
    <li className="fu-select-item">
      <button
        type="button"
        role="option"
        aria-selected={selected}
        disabled={disabled}
        onClick={() => ctx.select(value)}
        className={cx(
          "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm outline-none transition-colors",
          selected
            ? "bg-gray-100 text-gray-900"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:bg-gray-100",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
      >
        {children}
        {selected ? (
          <Check className="size-3.5 shrink-0 text-[var(--success)]" />
        ) : null}
      </button>
    </li>
  );
}
