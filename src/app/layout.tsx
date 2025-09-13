import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { PostHogProvider } from "@/components/PostHogProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aposta Fácil - Crie e participe de apostas online",
  description: "Plataforma para criar e participar de apostas online de forma simples e divertida",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Aposta Fácil",
    description: "Crie e participe de apostas online de forma simples e divertida",
    type: "website",
    locale: "pt_BR",
    siteName: "Aposta Fácil",
    images: [
      {
        url: "/images/caesjogandopoker.png",
        width: 1200,
        height: 630,
        alt: "Aposta Fácil - Cães jogando poker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aposta Fácil",
    description: "Crie e participe de apostas online de forma simples e divertida",
    images: ["/images/caesjogandopoker.png"],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/images/caesjogandopoker.png', type: 'image/png' }
    ],
    shortcut: '/icon.svg',
    apple: '/images/caesjogandopoker.png',
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
          <PostHogProvider>
            {children}
          </PostHogProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
