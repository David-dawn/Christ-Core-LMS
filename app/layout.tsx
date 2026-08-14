import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Christ-Core LMS",
  description: "Mini LMS for Christ-Core Digital Services frontend beginners class"
};

export const viewport: Viewport = {
  themeColor: "#041a54"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
