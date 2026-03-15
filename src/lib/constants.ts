import {
  Users,
  FileText,
  Palette,
  Factory,
  CheckCircle,
  Package,
  type LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly description: string;
}

export const MENU_ITEMS: readonly MenuItem[] = [
  {
    label: 'Clientes',
    href: '/clientes',
    icon: Users,
    description: 'Gerenciar clientes',
  },
  {
    label: 'Produtos',
    href: '/produtos',
    icon: Package,
    description: 'Cadastro de produtos',
  },
  {
    label: 'Orçamentos',
    href: '/orcamentos',
    icon: FileText,
    description: 'Todos os orçamentos',
  },
  {
    label: 'Produção de Artes',
    href: '/producao-artes',
    icon: Palette,
    description: 'Design e aprovação',
  },
  {
    label: 'Produção Final',
    href: '/producao-final',
    icon: Factory,
    description: 'Impressão e montagem',
  },
  {
    label: 'Prontos',
    href: '/prontos',
    icon: CheckCircle,
    description: 'Para entrega',
  },
] as const;

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const BRAZILIAN_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
] as const;
