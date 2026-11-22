import type { Metadata } from "next";
import { Geist, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const notoJp = Noto_Sans_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Nachricht — IT Event Portal",
  description: "ITカンファレンス・勉強会・ミートアップをまとめて探せるイベントポータル",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${notoJp.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
