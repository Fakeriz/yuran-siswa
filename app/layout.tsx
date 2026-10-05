import type { Metadata } from "next";
import { ThemeProvider } from "../components/theme-provider";
import "./globals.css";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "YuranKu",
  description: "Aplikasi web pencatat yuran bulanan siswa",
  openGraph: {
    title: "YuranKu",
    description: "Aplikasi web pencatat yuran bulanan siswa",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased bg-white text-gray-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-150">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
