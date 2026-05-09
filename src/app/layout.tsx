import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans-brand",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-brand",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Personal Wealth Management",
  description: "Kelola pendapatan, pengeluaran, aset, utang, dan investasi Anda.",
  manifest: "/manifest.json",
  themeColor: "#10B981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PWM",
  },
};

// Inline script to set dark class BEFORE first paint, preventing FOUC.
// Reads localStorage 'pwm-theme' (light/dark/auto) and matches system preference.
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('pwm-theme');
    var mode = stored === 'light' || stored === 'dark' || stored === 'auto' ? stored : 'auto';
    var resolved = mode === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;
    if (resolved === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
