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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
