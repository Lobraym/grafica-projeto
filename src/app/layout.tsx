import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Sidebar } from '@/components/layout/Sidebar';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GraficaPro - Sistema de Gestao',
  description:
    'Sistema completo de gestao para graficas. Controle de clientes, orcamentos, producao de artes, producao final e entregas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Sidebar />

        {/* Main content area offset by sidebar width */}
        <main className="min-h-screen lg:pl-64">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
