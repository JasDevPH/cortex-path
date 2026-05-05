import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "reactflow/dist/style.css";
import { ChatWidget } from "@/components/chat/ChatWidgetLoader";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CortexPath",
  description: "AI-powered codebase intelligence",
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
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <Providers>
            {children}
            <ChatWidget />
            <Toaster position="bottom-left" richColors theme="system" />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
