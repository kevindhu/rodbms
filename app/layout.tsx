"use client";

import "./globals.css";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  // Only show the UI after first client-side render
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {mounted ? children : null}
        </ThemeProvider>
      </body>
    </html>
  );
}

