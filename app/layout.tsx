import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "../components/theme-provider";
import "./globals.css";

export const runtime = "edge";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YuranKu",
  description: "Aplikasi web pencatat yuran bulanan siswa",
  openGraph: {
    title: "YuranKu",
    description: "Aplikasi web pencatat yuran bulanan siswa",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "YuranKu",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased bg-card text-foreground transition-colors duration-150`}>
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
