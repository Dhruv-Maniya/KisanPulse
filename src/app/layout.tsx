import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KisanPulse",
  description: "Autonomous agricultural market intelligence for farmers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
