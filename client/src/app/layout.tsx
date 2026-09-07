import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ECHO//SHIFT — Tactical Action Survival & Deception",
  description: "Your past is the most dangerous weapon. A 3D multiplayer tactical survival game set in Sector 09, VANTA-9.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-cyber-bg text-cyber-text antialiased select-none h-screen w-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
