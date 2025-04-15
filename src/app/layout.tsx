import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/providers/supabase-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aposta Fácil - Crie e participe de apostas online",
  description: "Plataforma para criar e participar de apostas online de forma simples e divertida",
  openGraph: {
    title: "Aposta Fácil",
    description: "Crie e participe de apostas online de forma simples e divertida",
    type: "website",
    locale: "pt_BR",
    siteName: "Aposta Fácil",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Aposta Fácil",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aposta Fácil",
    description: "Crie e participe de apostas online de forma simples e divertida",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50`}>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
