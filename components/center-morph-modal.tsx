"use client";
// Adapted from beui.dev/components/motion/center-morph-modal
// - motion/react replaced with CSS clip-path transitions (no new dependency)
// - @/lib/ease, @/lib/utils, @/lib/presence-gate replaced with local helpers
// - shadcn theme tokens mapped to Tailwind gray/slate with class-based dark mode
// - labels in Bahasa Malaysia to match the app
//
// Signature effect: the panel unfolds outward from its exact center via an
// animated clip-path; the backdrop fades in. Exit plays the reverse before
// unmounting. Focus is trapped while open, Escape/backdrop dismisses,
// body scroll is locked, and focus returns to the trigger on close.

import { X } from "lucide-react";
import {
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

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

type CenterMorphModalContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerId: string;
  contentId: string;
};

const CenterMorphModalContext =
  createContext<CenterMorphModalContextValue | null>(null);

function useCenterMorphModalContext(component: string) {
  const context = useContext(CenterMorphModalContext);
  if (!context) {
    throw new Error(`${component} must be used within <CenterMorphModal>`);
  }
  return context;
}

export interface CenterMorphModalProps {
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial state when used uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A modal whose full-size surface unfolds outward from its exact center.
 * Supports controlled and uncontrolled state through composable primitives.
 */
export function CenterMorphModal({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: CenterMorphModalProps) {
  const id = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const value = useMemo<CenterMorphModalContextValue>(
    () => ({
      open,
      setOpen,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
    }),
    [id, open, setOpen],
  );

  return (
    <CenterMorphModalContext.Provider value={value}>
      {children}
    </CenterMorphModalContext.Provider>
  );
}

export interface CenterMorphModalTriggerProps {
  children: ReactElement;
}

/** Wraps one interactive element and opens or closes the modal. */
export function CenterMorphModalTrigger({
  children,
}: CenterMorphModalTriggerProps) {
  const context = useCenterMorphModalContext("CenterMorphModalTrigger");
  if (!isValidElement(children)) return children;

  const child = children as ReactElement<Record<string, unknown>>;
  const childOnClick = child.props.onClick as
    | ((event: React.MouseEvent<HTMLElement>) => void)
    | undefined;

  return cloneElement(child, {
    id: context.triggerId,
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      childOnClick?.(event);
      if (!event.defaultPrevented) context.setOpen(!context.open);
    },
    "aria-haspopup": "dialog",
    "aria-expanded": context.open,
    "aria-controls": context.open ? context.contentId : undefined,
  });
}

export interface CenterMorphModalCloseProps {
  children: ReactElement;
}

/** Wraps one interactive element and closes the modal. */
export function CenterMorphModalClose({
  children,
}: CenterMorphModalCloseProps) {
  const context = useCenterMorphModalContext("CenterMorphModalClose");
  if (!isValidElement(children)) return children;

  const child = children as ReactElement<Record<string, unknown>>;
  const childOnClick = child.props.onClick as
    | ((event: React.MouseEvent<HTMLElement>) => void)
    | undefined;

  return cloneElement(child, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      childOnClick?.(event);
      if (!event.defaultPrevented) context.setOpen(false);
    },
  });
}

export interface CenterMorphModalContentProps {
  children: ReactNode;
  /** Accessible name announced by screen readers. */
  ariaLabel: string;
  /** Optional id of descriptive content inside the modal. */
  ariaDescribedBy?: string;
  /** Close on Escape or backdrop press. Default true. */
  dismissible?: boolean;
  /** Render the close control inside the panel's top-right corner. Default true. */
  showCloseButton?: boolean;
  closeButtonLabel?: string;
  className?: string;
  backdropClassName?: string;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusableElements(root: HTMLElement | null) {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.tabIndex >= 0,
  );
}

const EXIT_MS = 430;
const EXIT_MS_REDUCED = 140;

export function CenterMorphModalContent({
  children,
  ariaLabel,
  ariaDescribedBy,
  dismissible = true,
  showCloseButton = true,
  closeButtonLabel = "Tutup modal",
  className,
  backdropClassName,
}: CenterMorphModalContentProps) {
  const context = useCenterMorphModalContext("CenterMorphModalContent");
  const reduce = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"enter" | "open" | "exit">("enter");
  const panelRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);
  // Read through a ref so parent re-renders (e.g. typing in a form field)
  // never restart focus management or steal focus mid-interaction.
  const ctxRef = useRef(context);
  ctxRef.current = context;

  const open = context.open;

  useEffect(() => setMounted(true), []);

  const exitMs = reduce ? EXIT_MS_REDUCED : EXIT_MS;

  // Mount/unmount state machine: enter -> open (double rAF so the folded
  // state paints first), open -> exit -> unmount after the fold completes.
  useEffect(() => {
    if (open) {
      visibleRef.current = true;
      setVisible(true);
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
        setVisible(false);
        setPhase("enter");
      }, exitMs);
      return () => window.clearTimeout(timer);
    }
  }, [open, exitMs]);

  // Focus trap, Escape, scroll lock, and focus restore while mounted.
  useEffect(() => {
    if (!visible) return;

    const triggerId = ctxRef.current.triggerId;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = requestAnimationFrame(() => {
      const [firstFocusable] = getFocusableElements(panelRef.current);
      (firstFocusable ?? panelRef.current)?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) {
        event.preventDefault();
        ctxRef.current.setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.getElementById(triggerId)?.focus();
    };
  }, [visible, dismissible]);

  if (!mounted || !visible) return null;

  const isOpen = phase === "open";

  return createPortal(
    <>
      <style>{`
        .fu-morph-panel {
          clip-path: inset(48% 48% 48% 48% round 30px);
          transition: clip-path 0.43s cubic-bezier(0.2, 0, 0.2, 1);
        }
        .fu-morph-panel.fu-morph-open {
          clip-path: inset(0% 0% 0% 0% round 30px);
        }
        .fu-morph-backdrop {
          opacity: 0;
          transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fu-morph-backdrop.fu-morph-open {
          opacity: 1;
        }
        .fu-morph-close {
          opacity: 0;
          transform: scale(0.8);
          transition:
            opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1) 0.16s,
            transform 0.2s cubic-bezier(0.16, 1, 0.3, 1) 0.16s,
            background-color 0.15s ease,
            color 0.15s ease;
        }
        .fu-morph-close.fu-morph-open {
          opacity: 1;
          transform: scale(1);
        }
        .fu-morph-exiting .fu-morph-close {
          transition-delay: 0s;
          transition-duration: 0.1s;
        }
        @media (prefers-reduced-motion: reduce) {
          .fu-morph-panel {
            clip-path: inset(0% 0% 0% 0% round 30px);
            transition: opacity 0.14s ease-out;
            opacity: 0;
          }
          .fu-morph-panel.fu-morph-open {
            opacity: 1;
          }
          .fu-morph-backdrop {
            transition-duration: 0.1s;
          }
          .fu-morph-close {
            transform: none;
            transition-delay: 0s;
            transition-duration: 0.12s;
          }
        }
      `}</style>

      <button
        type="button"
        aria-label="Tutup modal"
        tabIndex={-1}
        disabled={!dismissible}
        onClick={() => context.setOpen(false)}
        className={cx(
          "fu-morph-backdrop fixed inset-0 z-[100] h-full w-full cursor-default bg-slate-900/10 backdrop-blur-sm dark:bg-black/60",
          isOpen && "fu-morph-open",
          backdropClassName,
        )}
      />

      {/* `inset-4` rather than `inset-0 p-4`: same content box, but the
          layer stays off the viewport edges. It never takes pointer
          events, so it carries `inert` while exiting. */}
      <div
        inert={phase === "exit"}
        className="pointer-events-none fixed inset-4 z-[100] flex items-center justify-center overflow-y-auto drop-shadow-2xl"
      >
        {/* Drop-shadow reads the clipped child's alpha, so depth follows the
            unfolding silhouette without introducing another panel layer. */}
        <div
          className={cx(
            "flex w-full flex-col items-center py-8",
            phase === "exit" && "fu-morph-exiting",
          )}
        >
          <div
            ref={panelRef}
            id={context.contentId}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            tabIndex={-1}
            className={cx(
              "fu-morph-panel pointer-events-auto relative w-full origin-center overflow-hidden rounded-[30px] border border-gray-200 bg-white will-change-[clip-path] dark:border-slate-800 dark:bg-slate-900",
              isOpen && "fu-morph-open",
              className,
            )}
          >
            {children}

            {showCloseButton ? (
              <button
                type="button"
                aria-label={closeButtonLabel}
                onClick={() => context.setOpen(false)}
                className={cx(
                  "fu-morph-close absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-full bg-gray-900/5 text-gray-500 hover:bg-gray-900/10 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:bg-white/10 dark:text-slate-400 dark:hover:bg-white/15 dark:hover:text-slate-100",
                  isOpen && "fu-morph-open",
                )}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
