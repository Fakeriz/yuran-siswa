"use client";
// Adapted from beui.dev/components/motion/checkbox
// - motion/react replaced with CSS transitions/keyframes (no new dependency)
// - @/lib/utils (cn) replaced with a local cx helper
// - Styled to the app theme: emerald checked state, gray/slate dark mode

import { Check } from "lucide-react";
import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "checked" | "defaultChecked" | "onChange" | "size"
  > {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      checked,
      defaultChecked,
      onCheckedChange,
      label,
      disabled,
      className,
      id: idProp,
      ...rest
    },
    ref,
  ) {
    const autoId = useId();
    const id = idProp ?? autoId;
    const [internal, setInternal] = useState(defaultChecked ?? false);
    const controlled = checked !== undefined;
    const isChecked = controlled ? checked : internal;

    return (
      <label
        htmlFor={id}
        className={cx(
          "flex cursor-pointer items-start gap-2.5 text-sm select-none",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
      >
        <style>{`
          .fu-checkbox-box {
            transition:
              transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
              background-color 0.15s ease,
              border-color 0.15s ease;
          }
          label:active .fu-checkbox-box {
            transform: scale(0.88);
          }
          @keyframes fu-checkbox-check-in {
            from { transform: scale(0.4); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .fu-checkbox-check {
            animation: fu-checkbox-check-in 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          @media (prefers-reduced-motion: reduce) {
            .fu-checkbox-box { transition: none; }
            label:active .fu-checkbox-box { transform: none; }
            .fu-checkbox-check { animation: none; }
          }
        `}</style>

        <input
          ref={ref}
          id={id}
          type="checkbox"
          className="sr-only"
          checked={isChecked}
          disabled={disabled}
          onChange={(event) => {
            if (!controlled) setInternal(event.target.checked);
            onCheckedChange?.(event.target.checked);
          }}
          {...rest}
        />
        <span
          aria-hidden
          className={cx(
            "fu-checkbox-box mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border",
            isChecked
              ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500"
              : "border-gray-300 bg-white hover:border-gray-400 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-slate-500",
          )}
        >
          {isChecked ? (
            <Check className="fu-checkbox-check size-3.5" strokeWidth={3} />
          ) : null}
        </span>
        {label ? (
          <span className="text-gray-600 dark:text-slate-300">{label}</span>
        ) : null}
      </label>
    );
  },
);
