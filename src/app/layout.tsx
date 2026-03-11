import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Sidebar } from '@/components/layout/Sidebar';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'GraficaPro - Sistema de Gestao para Graficas',
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
        className={`${plusJakartaSans.variable} font-sans antialiased`}
      >
        <Sidebar />

        {/* Main content area offset by sidebar width */}
        <main className="min-h-screen bg-background lg:pl-64">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
