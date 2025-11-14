// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css"; // ★ 追加

export const metadata: Metadata = {
  title: "KizukiMap",
  description: "Map-based note app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
