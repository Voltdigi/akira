import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { AuthProvider } from "@/lib/AuthContext";
import AuthGate from "@/components/AuthGate";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "akira",
  description: "Log bottle and breast feeds with a tap.",
};

export const viewport: Viewport = {
  themeColor: "#F2F7F1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={manrope.variable}>
        <AuthProvider>
          <AuthGate>{children}</AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
