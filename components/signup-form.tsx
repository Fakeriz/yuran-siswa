"use client";
// Adapted from beui.dev/components/blocks/signup-form
// - motion/react replaced with CSS keyframe animations (no new dependency)
// - @/lib/ease, @/lib/utils replaced with local helpers
// - StatefulButton, Checkbox, Input are the adapted motion primitives
// - shadcn theme tokens mapped to Tailwind gray/slate with class-based dark mode
// - Labels in Bahasa Indonesia to match the app

import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";
import { Checkbox } from "./motion-checkbox";
import { Input } from "./motion-input";
import { StatefulButton } from "./motion-button";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export type SignUpStatus = "idle" | "loading" | "success" | "error";

export type SignUpValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

export type SignUpErrors = Partial<Record<keyof SignUpValues, string>>;

export type SignUpFormClassNames = {
  root?: string;
  header?: string;
  title?: string;
  description?: string;
  fields?: string;
  strength?: string;
  terms?: string;
  submit?: string;
  footer?: string;
};

export interface SignUpFormProps {
  /** Controlled values. Omit for uncontrolled. */
  values?: SignUpValues;
  defaultValues?: Partial<SignUpValues>;
  onValuesChange?: (values: SignUpValues) => void;
  /** Called with valid values only. Return a promise to drive the button state. */
  onSubmit?: (values: SignUpValues) => void | Promise<void>;
  /** Replace the built-in rules — return a message per invalid field. */
  validate?: (values: SignUpValues) => SignUpErrors;
  /** Controlled submit state. Omit to let the form track it. */
  status?: SignUpStatus;
  /** Form-level failure message, shown above the submit button. */
  errorMessage?: string;
  title?: ReactNode;
  description?: ReactNode;
  submitLabel?: string;
  footer?: ReactNode;
  /** Show the password strength meter. */
  strengthMeter?: boolean;
  className?: string;
  classNames?: SignUpFormClassNames;
}

const EMPTY_VALUES: SignUpValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

// Deliberately permissive. Full RFC 5322 matching is impractical in a regex and
// rejects addresses that deliver fine; the only real check is sending mail.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_PASSWORD_LENGTH = 8;

const STRENGTH_LABELS = [
  "Terlalu pendek",
  "Lemah",
  "Cukup",
  "Baik",
  "Kuat",
] as const;

const STRENGTH_COLORS = [
  "bg-rose-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-amber-400",
  "bg-emerald-500",
] as const;

/**
 * Length-weighted strength score, 0-4. NIST SP 800-63B advises against
 * composition requirements and treats length as the dominant factor, so extra
 * character classes only nudge the score — they can't rescue a short password.
 * This is a heuristic for feedback, not entropy estimation; pair it with a
 * breach-list check server-side for anything real.
 */
export function passwordStrength(password: string): number {
  if (password.length < MIN_PASSWORD_LENGTH) return 0;

  let score = 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) =>
    pattern.test(password),
  ).length;
  if (classes >= 3) score += 1;

  return Math.min(score, 4);
}

function defaultValidate(values: SignUpValues): SignUpErrors {
  const errors: SignUpErrors = {};

  if (!values.name.trim()) {
    errors.name = "Isi nama Anda.";
  }

  if (!values.email.trim()) {
    errors.email = "Isi email Anda.";
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = "Alamat email tidak valid.";
  }

  if (!values.password) {
    errors.password = "Buat kata sandi.";
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Gunakan minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Konfirmasi kata sandi Anda.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Kata sandi tidak cocok.";
  }

  if (!values.terms) {
    errors.terms = "Setujui syarat untuk melanjutkan.";
  }

  return errors;
}

export function SignUpForm({
  values: valuesProp,
  defaultValues,
  onValuesChange,
  onSubmit,
  validate,
  status: statusProp,
  errorMessage,
  title = "Buat akun baru",
  description = "Mulai dalam waktu kurang dari satu menit.",
  submitLabel = "Buat akun",
  footer,
  strengthMeter = true,
  className,
  classNames,
}: SignUpFormProps) {
  const baseId = useId();

  const controlled = valuesProp !== undefined;
  const [internalValues, setInternalValues] = useState<SignUpValues>({
    ...EMPTY_VALUES,
    ...defaultValues,
  });
  const values = controlled ? valuesProp : internalValues;

  const [internalStatus, setInternalStatus] = useState<SignUpStatus>("idle");
  const status = statusProp ?? internalStatus;

  const [revealPassword, setRevealPassword] = useState(false);

  // "Reward early, punish late": errors are computed on every change, but a
  // field only *shows* its error once it has been blurred (or submit touched
  // everything). So a first entry is never flagged mid-typing, while a field
  // already in error clears the moment it becomes valid.
  const [touched, setTouched] = useState<
    Partial<Record<keyof SignUpValues, boolean>>
  >({});

  const errors = useMemo(
    () => (validate ?? defaultValidate)(values),
    [values, validate],
  );

  const setValue = useCallback(
    <K extends keyof SignUpValues>(key: K, next: SignUpValues[K]) => {
      const nextValues = { ...values, [key]: next };
      if (!controlled) {
        setInternalValues(nextValues);
        if (statusProp === undefined) {
          setInternalStatus((current) =>
            current === "success" || current === "error" ? "idle" : current,
          );
        }
      }
      onValuesChange?.(nextValues);
    },
    [controlled, onValuesChange, statusProp, values],
  );

  const touch = useCallback((key: keyof SignUpValues) => {
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  /** Error to render for a field — hidden until the field has been touched. */
  const shownError = (key: keyof SignUpValues) =>
    touched[key] ? errors[key] : undefined;

  /** Success check draws only once a touched field is non-empty and valid. */
  const isValid = (key: keyof SignUpValues) =>
    Boolean(touched[key]) && !errors[key] && Boolean(values[key]);

  const strength = passwordStrength(values.password);
  const showStrength = strengthMeter && values.password.length > 0;
  const isSubmitting = status === "loading";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    if (Object.keys(errors).length > 0) return;
    if (!onSubmit) return;

    if (statusProp === undefined) setInternalStatus("loading");
    try {
      await onSubmit(values);
      if (statusProp === undefined) setInternalStatus("success");
    } catch {
      if (statusProp === undefined) setInternalStatus("error");
    }
  };

  const termsErrorId = `${baseId}-terms-error`;
  const formErrorId = `${baseId}-form-error`;

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className={cx(
        "flex w-full max-w-sm flex-col gap-5 rounded-3xl border border-gray-200 bg-card p-6",
        className,
        classNames?.root,
      )}
    >
      <style>{`
        @keyframes fu-auth-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fu-auth-blur-in {
          from { opacity: 0; transform: translateY(-4px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .fu-auth-in { animation: fu-auth-in 0.18s cubic-bezier(0.16, 1, 0.3, 1); }
        .fu-auth-blur-in { animation: fu-auth-blur-in 0.2s ease-out; }
        .fu-strength-bar {
          transition: transform 0.35s cubic-bezier(0.34, 1.3, 0.64, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .fu-auth-in, .fu-auth-blur-in { animation: none; }
          .fu-strength-bar { transition: none; }
        }
      `}</style>

      {title || description ? (
        <div className={cx("flex flex-col gap-1", classNames?.header)}>
          {title ? (
            <h2
              className={cx(
                "text-xl font-semibold tracking-tight text-gray-900",
                classNames?.title,
              )}
            >
              {title}
            </h2>
          ) : null}
          {description ? (
            <p
              className={cx(
                "text-sm text-gray-500",
                classNames?.description,
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={cx("flex flex-col gap-1", classNames?.fields)}>
        <Input
          label="Nama"
          autoComplete="name"
          placeholder="Nama lengkap"
          leftIcon={<User />}
          disabled={isSubmitting}
          value={values.name}
          onChange={(next) => setValue("name", next)}
          onBlur={() => touch("name")}
          error={shownError("name")}
          reserveErrorLine
          success={isValid("name")}
        />

        <Input
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nama@email.com"
          leftIcon={<Mail />}
          disabled={isSubmitting}
          value={values.email}
          onChange={(next) => setValue("email", next)}
          onBlur={() => touch("email")}
          error={shownError("email")}
          reserveErrorLine
          success={isValid("email")}
        />

        <div className="flex flex-col gap-2">
          <Input
            label="Kata sandi"
            type={revealPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            leftIcon={<Lock />}
            rightIcon={
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setRevealPassword((prev) => !prev)}
                aria-label={
                  revealPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"
                }
                className="text-gray-400 outline-none transition-colors hover:text-gray-600 focus-visible:text-gray-600"
              >
                {revealPassword ? <EyeOff /> : <Eye />}
              </button>
            }
            disabled={isSubmitting}
            value={values.password}
            onChange={(next) => setValue("password", next)}
            onBlur={() => touch("password")}
            error={shownError("password")}
            reserveErrorLine
          />

          {showStrength ? (
            <div
              className={cx(
                "fu-auth-in flex flex-col gap-1.5 px-1",
                classNames?.strength,
              )}
            >
              <div className="flex gap-1.5" aria-hidden>
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className="h-1 flex-1 overflow-hidden rounded-full bg-gray-200"
                  >
                    <span
                      className={cx(
                        "fu-strength-bar block h-full w-full origin-left rounded-full",
                        STRENGTH_COLORS[strength],
                      )}
                      style={{
                        transform: `scaleX(${index < strength ? 1 : 0})`,
                      }}
                    />
                  </span>
                ))}
              </div>
              <p
                aria-live="polite"
                className="text-xs text-gray-500"
              >
                Kekuatan kata sandi: {STRENGTH_LABELS[strength]}
              </p>
            </div>
          ) : null}
        </div>

        <Input
          label="Konfirmasi kata sandi"
          type={revealPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Ulangi kata sandi"
          leftIcon={<Lock />}
          disabled={isSubmitting}
          value={values.confirmPassword}
          onChange={(next) => setValue("confirmPassword", next)}
          onBlur={() => touch("confirmPassword")}
          error={shownError("confirmPassword")}
          reserveErrorLine
          success={isValid("confirmPassword")}
        />
      </div>

      <div className={cx("flex flex-col gap-1.5", classNames?.terms)}>
        <Checkbox
          checked={values.terms}
          disabled={isSubmitting}
          onCheckedChange={(next) => {
            setValue("terms", next);
            touch("terms");
          }}
          label="Saya menyetujui Syarat dan Kebijakan Privasi"
          aria-describedby={shownError("terms") ? termsErrorId : undefined}
        />
        {shownError("terms") ? (
          <p
            id={termsErrorId}
            role="alert"
            className="fu-auth-blur-in px-1 text-xs text-rose-600"
          >
            {shownError("terms")}
          </p>
        ) : null}
      </div>

      {errorMessage ? (
        <p
          id={formErrorId}
          role="alert"
          className="fu-auth-in rounded-2xl border border-rose-300/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-600"
        >
          {errorMessage}
        </p>
      ) : null}

      <StatefulButton
        type="submit"
        size="lg"
        state={status}
        loadingText="Membuat akun"
        successText="Akun dibuat"
        errorText="Coba lagi"
        aria-describedby={errorMessage ? formErrorId : undefined}
        className={cx("w-full", classNames?.submit)}
      >
        {submitLabel}
      </StatefulButton>

      {footer ? (
        <div
          className={cx(
            "text-center text-sm text-gray-500",
            classNames?.footer,
          )}
        >
          {footer}
        </div>
      ) : null}
    </form>
  );
}
