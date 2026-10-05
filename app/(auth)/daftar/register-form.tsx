"use client";

import { Eye, EyeOff, Lock, Mail, Search, User } from "lucide-react";
import { useState, useTransition } from "react";
import { registerParent } from "../../../lib/actions/admin";
import { Checkbox } from "../../../components/motion-checkbox";
import { Input } from "../../../components/motion-input";
import { StatefulButton } from "../../../components/motion-button";
import { passwordStrength } from "../../../components/signup-form";

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

export function RegisterForm({
  students,
}: {
  students: { id: string; nama: string; kelas: string }[];
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [revealPassword, setRevealPassword] = useState(false);

  const strength = passwordStrength(password);
  const showStrength = password.length > 0;

  if (saved)
    return (
      <section
        className="mt-8 rounded-2xl border border-emerald-300 p-5 dark:border-emerald-800"
        role="status"
      >
        <h2 className="font-semibold">menunggu persetujuan</h2>
        <p className="mt-2">
          Pendaftaran berhasil. Pengajuan anak akan diperiksa oleh admin atau
          staf. Jika menerima email konfirmasi, konfirmasikan email sebelum
          masuk.
        </p>
      </section>
    );

  return (
    <form
      className="mt-8 space-y-5"
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        if (pending) return;
        if (!selected.length) {
          setMessage("Pilih minimal satu anak.");
          return;
        }
        const data = new FormData(event.currentTarget);
        setMessage("");
        startTransition(async () => {
          try {
            const result = await registerParent({
              nama: String(data.get("nama")),
              email: String(data.get("email")),
              password: String(data.get("password")),
              student_ids: selected,
            });
            if (result.ok) setSaved(true);
            else setMessage(result.error);
          } catch {
            setMessage("Pendaftaran gagal dikirim. Silakan coba lagi.");
          }
        });
      }}
    >
      <fieldset disabled={pending} className="space-y-5 disabled:opacity-60">
        <Input
          label="Nama"
          name="nama"
          autoComplete="name"
          required
          placeholder="Nama lengkap"
          leftIcon={<User />}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="nama@email.com"
          leftIcon={<Mail />}
        />

        <div>
          <Input
            label="Kata sandi"
            name="password"
            type={revealPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            aria-describedby="password-hint"
            placeholder="Minimal 8 karakter"
            leftIcon={<Lock />}
            rightIcon={
              <button
                type="button"
                onClick={() => setRevealPassword((prev) => !prev)}
                aria-label={
                  revealPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"
                }
                className="text-gray-400 outline-none transition-colors hover:text-gray-600 focus-visible:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 dark:focus-visible:text-slate-300"
              >
                {revealPassword ? <EyeOff /> : <Eye />}
              </button>
            }
            value={password}
            onChange={setPassword}
          />
          {showStrength ? (
            <div className="mt-2 flex flex-col gap-1.5 px-1">
              <div className="flex gap-1.5" aria-hidden>
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className="h-1 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700"
                  >
                    <span
                      className={`block h-full w-full origin-left rounded-full transition-transform duration-300 ${STRENGTH_COLORS[strength]}`}
                      style={{
                        transform: `scaleX(${index < strength ? 1 : 0})`,
                      }}
                    />
                  </span>
                ))}
              </div>
              <p
                aria-live="polite"
                className="text-xs text-slate-600 dark:text-slate-400"
              >
                Kekuatan kata sandi: {STRENGTH_LABELS[strength]}{" "}
                <span id="password-hint">(minimal 8 karakter)</span>
              </p>
            </div>
          ) : (
            <p
              id="password-hint"
              className="mt-1 px-1 text-xs text-slate-600 dark:text-slate-400"
            >
              Minimal 8 karakter.
            </p>
          )}
        </div>

        <fieldset>
          <legend className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Pilih anak (boleh lebih dari satu)
          </legend>
          <div className="mt-1.5">
            <Input
              type="search"
              placeholder="Cari nama atau kelas"
              leftIcon={<Search />}
              value={query}
              onChange={setQuery}
              aria-label="Cari nama atau kelas"
            />
          </div>
          <p className="my-3 text-sm" role="status">
            {selected.length} anak dipilih
          </p>
          <div className="max-h-64 overflow-y-auto rounded-2xl border border-gray-300 p-2 dark:border-slate-700">
            {!students.length && (
              <p className="p-3 text-sm">
                Belum ada siswa yang dapat dipilih.
              </p>
            )}
            {students.length > 0 &&
              !students.some((s) =>
                `${s.nama} ${s.kelas}`
                  .toLocaleLowerCase()
                  .includes(query.toLocaleLowerCase()),
              ) && <p className="p-3 text-sm">Tidak ada siswa yang cocok.</p>}
            {students
              .filter((s) =>
                `${s.nama} ${s.kelas}`
                  .toLocaleLowerCase()
                  .includes(query.toLocaleLowerCase()),
              )
              .map((student) => (
                <Checkbox
                  key={student.id}
                  checked={selected.includes(student.id)}
                  onCheckedChange={(next) =>
                    setSelected(
                      next
                        ? [...selected, student.id]
                        : selected.filter((id) => id !== student.id),
                    )
                  }
                  label={
                    <span className="break-words">
                      {student.nama}
                      <span className="block text-sm text-slate-600 dark:text-slate-400">
                        {student.kelas}
                      </span>
                    </span>
                  }
                  className="rounded-xl p-3 hover:bg-slate-100 dark:hover:bg-slate-900"
                />
              ))}
          </div>
        </fieldset>
      </fieldset>

      {message && (
        <p
          role="alert"
          className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        >
          {message}
        </p>
      )}

      <StatefulButton
        type="submit"
        size="lg"
        state={pending ? "loading" : message ? "error" : "idle"}
        loadingText="Mendaftar…"
        errorText="Coba lagi"
        disabled={pending || !students.length}
        className="w-full"
      >
        Daftar
      </StatefulButton>
    </form>
  );
}
