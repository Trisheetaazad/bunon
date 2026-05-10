// app/layout.tsx
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import { LanguageProvider } from "@/components/shared/LanguageProvider";

export const metadata = {
  title: "HerWork — Remote Jobs for Women in Bangladesh",
  description:
    "Empowering housebound women with remote microwork opportunities. Train, work, and earn — from home.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <LanguageProvider>
          <Navbar />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}