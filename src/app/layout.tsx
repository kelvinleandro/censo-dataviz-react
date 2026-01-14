import type { Metadata } from "next";
import { DM_Serif_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
const dmSerif = DM_Serif_Display({
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Censo Brasil",
  description: "Visualização de Dados do censo brasileiro do IBGE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${dmSerif.variable} ${sourceSans.variable} font-body bg-background text-foreground antialiased`}>
        <Navbar/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}