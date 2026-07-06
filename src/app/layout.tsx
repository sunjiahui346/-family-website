import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/ui/BottomNav";
import { InstallPrompt } from "@/components/ui/InstallPrompt";

export const metadata: Metadata = {
  title: "我们的温馨小家",
  description: "欢迎来到我们全家人的专属空间！",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "家庭空间",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF8F0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <head>
        <link rel="apple-touch-icon" href="https://api.dicebear.com/7.x/notionists/svg?seed=Family&backgroundColor=FF9B54" />
      </head>
      <body className="min-h-full flex flex-col pb-20">
        {children}
        <BottomNav />
        <InstallPrompt />
      </body>
    </html>
  );
}
