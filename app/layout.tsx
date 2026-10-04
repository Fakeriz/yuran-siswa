import type { Metadata } from "next";
import "./globals.css";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Yuran Siswa",
  description: "Aplikasi web pencatat yuran bulanan siswa",
  openGraph: {
    title: "Yuran Siswa",
    description: "Aplikasi web pencatat yuran bulanan siswa",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
