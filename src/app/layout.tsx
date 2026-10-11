import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne, Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const dm = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const noto = Noto_Sans_TC({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "見客通 CaseFlow CRM",
  description:
    "手機語音建案 Portal + 後台 Kanban／列表／成交預測 Dashboard",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body
        className={`${syne.variable} ${dm.variable} ${noto.variable} font-body antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
