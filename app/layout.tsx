import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./fullcalendar.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Planner - Sua Organização Pessoal",
  description: "Aplicação de planejamento e organização pessoal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
