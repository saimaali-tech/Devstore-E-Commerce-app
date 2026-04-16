import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ReleaseProvider } from "@/context/ReleaseContext";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevStore - Premium Tech Gear for Developers",
  description: "Curated keyboards, mice, monitors, and accessories designed for the modern developer workspace. Shop the best tech gear at DevStore.",
  keywords: ["DevStore", "tech gear", "developer accessories", "mechanical keyboard", "webcam", "developer tools", "e-commerce"],
  authors: [{ name: "DevStore Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "DevStore - Premium Tech Gear for Developers",
    description: "Curated keyboards, mice, monitors, and accessories designed for the modern developer workspace.",
    siteName: "DevStore",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appRelease =
    process.env.APP_RELEASE ??
    process.env.NEXT_PUBLIC_APP_RELEASE ??
    "v3";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ReleaseProvider value={appRelease}>{children}</ReleaseProvider>
        <Toaster />
      </body>
    </html>
  );
}
