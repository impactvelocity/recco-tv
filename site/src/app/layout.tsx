import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://recco.dev"),
  title: "Recco · An inbox of things to watch, on Fire TV",
  description:
    "Text a show to one number. When you sit down to watch, your Fire TV has the list, who recommended each one, and what they said.",
  icons: { icon: "/brand/app-icon.png" },
  // The share image is app/opengraph-image.jpg, which Next.js picks up by file convention.
  openGraph: {
    title: "Recco",
    description: "An inbox of things to watch, on Fire TV.",
    url: "/",
    siteName: "Recco",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recco",
    description: "An inbox of things to watch, on Fire TV.",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf8f4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-svh font-sans">{children}</body>
    </html>
  );
}
