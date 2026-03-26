/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import "@/index.css";

export const metadata: Metadata = {
  title: "AniMah - Anime & Manhwa Platform",
  description: "Discover, track, and review anime and manhwa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
