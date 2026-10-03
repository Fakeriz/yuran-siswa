"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: null });
  const inputClass = "mt-2 min-h-12 w-full rounded-2xl border border-current/30 bg-background px-4 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <form action={action} className="mt-8 space-y-6" aria-busy={pending}>
      <div>
        <label htmlFor="email" className="font-medium">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="font-medium">Kata sandi</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </div>
      {state.error && <p role="alert" className="rounded-2xl border border-current/30 p-4">{state.error}</p>}
      <button type="submit" disabled={pending} className="min-h-12 w-full rounded-2xl bg-foreground px-4 py-3 font-semibold text-background transition-opacity duration-150 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-60">
        {pending ? "Sedang masuk…" : "Masuk"}
      </button>
    </form>
  );
}
