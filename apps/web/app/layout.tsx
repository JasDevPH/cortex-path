import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "next-themes";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://cortex-path.up.railway.app";

export const metadata: Metadata = {
  title: {
    template: "%s | CortexPath",
    default: "CortexPath — AI Codebase Intelligence",
  },
  description:
    "Mirror your entire codebase to the cloud in minutes. Get plain-English logic summaries, interactive architecture maps, blast-radius analysis, and an AI assistant that knows your code — zero install required.",
  keywords: [
    "codebase intelligence",
    "AI code analysis",
    "architecture map",
    "code documentation",
    "developer tool",
    "code interpreter",
    "AI assistant for developers",
    "codebase mirror",
    "logic summary",
    "dependency graph",
    "blast radius",
    "code understanding",
  ],
  authors: [{ name: "CortexPath" }],
  creator: "CortexPath",
  metadataBase: new URL(APP_URL),
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "CortexPath",
    title: "CortexPath — AI Codebase Intelligence",
    description:
      "Mirror your codebase to the cloud. Get plain-English logic summaries, visual architecture maps, and AI answers about your code.",
    url: APP_URL,
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "CortexPath — AI Codebase Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "CortexPath — AI Codebase Intelligence",
    description:
      "Zero-install codebase intelligence. Ingest your project, get logic summaries, explore architecture maps, and chat with an AI that knows your code.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster position="bottom-left" richColors theme="system" />
            <SpeedInsights />
            <Analytics />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
