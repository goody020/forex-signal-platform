import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forex Signal Platform",
  description:
    "Structured forex trade setups with risk management, transparent analysis, and historical performance tracking.",
  manifest: "/manifest.webmanifest",
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}