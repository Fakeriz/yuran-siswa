"use client";
// Adapted from beui.dev/components/motion/input
// - motion/react replaced with CSS keyframe animations (no new dependency)
// - @/lib/utils (cn) replaced with a local cx helper
// - shadcn theme tokens mapped to Tailwind gray/slate with class-based dark mode
// - Error/success states with emerald/rose accents matching the app

import { Check } from "lucide-react";
import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export interface InputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "size" | "children"
  > {
  label?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Error message shown beneath the field (animated in). */
  error?: string;
  /** Show a success check when the field is valid. Hidden while errored. */
  success?: boolean;
  /** Reserve vertical space for the error line to avoid layout shift. */
  reserveErrorLine?: boolean;
  /** Receives the input value directly (beui convention). */
  onChange?: (value: string) => void;
  inputClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      leftIcon,
      rightIcon,
      error,
      success,
      reserveErrorLine,
      className,
      inputClassName,
      id: idProp,
      disabled,
      onChange,
      type = "text",
      ...rest
    },
    ref,
  ) {
    const autoId = useId();
    const id = idProp ?? autoId;
    const errorId = `${id}-error`;
    const showSuccess = success && !error && !disabled;

    return (
      <div className={cx("w-full", className)}>
        <style>{`
          @keyframes fu-input-error-in {
            from { opacity: 0; transform: translateY(-4px); filter: blur(4px); }
            to { opacity: 1; transform: translateY(0); filter: blur(0); }
          }
          .fu-input-error { animation: fu-input-error-in 0.2s ease-out; }
          @keyframes fu-input-check-in {
            from { opacity: 0; transform: translateY(-50%) scale(0.6); }
            to { opacity: 1; transform: translateY(-50%) scale(1); }
          }
          .fu-input-check { animation: fu-input-check-in 0.18s cubic-bezier(0.16, 1, 0.3, 1); }
          @media (prefers-reduced-motion: reduce) {
            .fu-input-error, .fu-input-check { animation: none; }
          }
        `}</style>

        {label ? (
          <label
            htmlFor={id}
            className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
          >
            {label}
          </label>
        ) : null}

        <div className="relative">
          {leftIcon ? (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 [&>svg]:size-4">
              {leftIcon}
            </span>
          ) : null}

          <input
            ref={ref}
            id={id}
            type={type}
            disabled={disabled}
            onChange={(event) => onChange?.(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={cx(
              "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400",
              "outline-none transition-[border-color,box-shadow] duration-150",
              "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
              "disabled:cursor-not-allowed disabled:opacity-60",
              "dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
              Boolean(leftIcon) && "pl-10",
              Boolean(rightIcon || showSuccess) && "pr-10",
              error
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500"
                : "border-gray-300 dark:border-slate-700",
              inputClassName,
            )}
            {...rest}
          />

          {rightIcon || showSuccess ? (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 [&>svg]:size-4">
              {showSuccess ? (
                <Check
                  className="fu-input-check size-4 text-emerald-500"
                  aria-hidden
                />
              ) : (
                <span className="text-gray-400 transition-colors hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300">
                  {rightIcon}
                </span>
              )}
            </span>
          ) : null}
        </div>

        <div className={cx(reserveErrorLine && "min-h-5")}>
          {error ? (
            <p
              id={errorId}
              role="alert"
              className="fu-input-error px-1 pt-1 text-xs text-rose-600 dark:text-rose-400"
            >
              {error}
            </p>
          ) : null}
        </div>
      </div>
    );
  },
);
