import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Customer Feedback Portal",
  description: "A SaaS portal foundation for collecting and reviewing customer feedback."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
