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
      <body className="antialiased bg-card text-foreground transition-colors duration-150">
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
