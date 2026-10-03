import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recova",
  description: "Track who owes you, what they've paid, and what's left.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
