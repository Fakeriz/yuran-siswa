import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "../components/theme-provider";
import "./globals.css";

export const runtime = "edge";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
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
    <html lang="id" suppressHydrationWarning className={plusJakartaSans.variable}>
      <body className={`${plusJakartaSans.className} antialiased bg-card text-foreground transition-colors duration-150`}>
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
