import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3100"),
  title: "Recco · An inbox of things to watch, on Fire TV",
  description:
    "Text a show to one number. When you sit down to watch, your Fire TV has the list, who recommended each one, and what they said.",
  icons: { icon: "/brand/app-icon.png" },
  openGraph: {
    title: "Recco",
    description: "An inbox of things to watch, on Fire TV.",
    images: ["/bg/hero-room.jpg"],
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
