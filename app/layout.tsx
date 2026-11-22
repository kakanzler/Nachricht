import type { Metadata } from "next";
import { Geist, Noto_Sans_JP } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const notoJp = Noto_Sans_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} — IT Event Portal`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — IT Event Portal`,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "ja_JP",
  },
  twitter: { card: "summary_large_image", title: `${SITE_NAME} — IT Event Portal`, description: SITE_DESCRIPTION },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${notoJp.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
