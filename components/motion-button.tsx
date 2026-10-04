"use client";
// Adapted from beui.dev/components/motion/button
// - motion/react replaced with CSS: press scale via --fu-press-scale custom
//   property, hover scale via (hover: hover) media query, ripple via keyframes.
//   No new dependency.
// - @/lib/ease (EASE_OUT, SPRING_PRESS) replaced with inline easings.
// - @/lib/hooks/use-hover-capable replaced with the (hover: hover) media query.
// - @/lib/utils (cn) replaced with a local cx helper.
// - Variants themed to the app: primary = emerald gradient, secondary/ghost/
//   outline in gray/slate with class-based dark mode.

import {
  forwardRef,
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
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

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pressScale?: number;
  /** Spawn a Material-style ripple from the press point. Off by default. */
  ripple?: boolean;
  children?: ReactNode;
}

export interface ButtonLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pressScale?: number;
  children?: ReactNode;
}

type Ripple = { id: number; x: number; y: number; size: number };

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-400 shadow-sm shadow-emerald-950/30 dark:shadow-emerald-950/50",
  secondary:
    "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
  ghost:
    "text-gray-500 hover:text-gray-900 hover:bg-gray-100/60 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60",
  outline:
    "border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100/60 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800/60",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-xl",
  md: "h-10 px-5 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
  icon: "size-8 rounded-xl",
};

const RIPPLE_MS = 700;

function useRipple(enabled: boolean) {
  const reduce = usePrefersReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (enabled && !reduce) {
        const rect = event.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const id = nextId.current++;
        setRipples((prev) => [
          ...prev,
          {
            id,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            size,
          },
        ]);
        window.setTimeout(() => {
          setRipples((prev) => prev.filter((x) => x.id !== id));
        }, RIPPLE_MS);
      }
    },
    [enabled, reduce],
  );

  const rippleLayer =
    enabled && !reduce ? (
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        {ripples.map((r) => (
          <span
            key={r.id}
            className="fu-ripple absolute rounded-full bg-current"
            style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
          />
        ))}
      </span>
    ) : null;

  return { handlePointerDown, rippleLayer };
}

const MOTION_STYLE = `
  .fu-btn {
    --fu-press-scale: 0.93;
    transition:
      transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
      background-color 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease,
      box-shadow 0.15s ease,
      opacity 0.15s ease;
  }
  @media (hover: hover) {
    .fu-btn:not(:disabled):hover {
      transform: scale(1.02);
    }
  }
  .fu-btn:not(:disabled):active {
    transform: scale(var(--fu-press-scale));
  }
  @keyframes fu-ripple {
    from { transform: translate(-50%, -50%) scale(0.05); opacity: 0.3; }
    to { transform: translate(-50%, -50%) scale(1); opacity: 0; }
  }
  .fu-ripple {
    animation: fu-ripple 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @media (prefers-reduced-motion: reduce) {
    .fu-btn {
      transition: none;
    }
    .fu-btn:not(:disabled):hover,
    .fu-btn:not(:disabled):active {
      transform: none;
    }
    .fu-ripple {
      animation: none;
    }
  }
`;

function buttonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  ripple: boolean,
  className?: string,
) {
  return cx(
    "fu-btn inline-flex items-center justify-center font-semibold select-none",
    "disabled:pointer-events-none disabled:opacity-50",
    ripple && "relative overflow-hidden",
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    className,
  );
}

function pressStyle(
  pressScale: number,
  style?: CSSProperties,
): CSSProperties {
  return {
    ...style,
    "--fu-press-scale": pressScale,
  } as CSSProperties;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      pressScale = 0.93,
      ripple = false,
      className,
      children,
      onPointerDown,
      style,
      ...rest
    },
    ref,
  ) {
    const { handlePointerDown, rippleLayer } = useRipple(ripple);

    return (
      <>
        <style>{MOTION_STYLE}</style>
        <button
          ref={ref}
          type="button"
          onPointerDown={(event) => {
            handlePointerDown(event);
            onPointerDown?.(event);
          }}
          style={pressStyle(pressScale, style)}
          className={buttonClassName(variant, size, ripple, className)}
          {...rest}
        >
          {rippleLayer}
          {children}
        </button>
      </>
    );
  },
);

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  function ButtonLink(
    {
      variant = "primary",
      size = "md",
      pressScale = 0.93,
      className,
      children,
      style,
      ...rest
    },
    ref,
  ) {
    return (
      <>
        <style>{MOTION_STYLE}</style>
        <a
          ref={ref}
          style={pressStyle(pressScale, style)}
          className={buttonClassName(variant, size, false, className)}
          {...rest}
        >
          {children}
        </a>
      </>
    );
  },
);
