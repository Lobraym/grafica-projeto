# GraficaPro — Frontend

Sistema de gestão para gráfica. Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4 + Zustand 5.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| UI | Tailwind CSS 4 (`@theme inline`), Lucide React |
| State | Zustand 5 (stores em `src/stores/`) |
| Forms | React Hook Form 7 + Zod 4 + @hookform/resolvers 5 |
| Font | Plus Jakarta Sans (Google Fonts, via next/font) |
| Animações | react-bits (instalado, pendente integração) |

## Estrutura

```
src/
├── app/           # Rotas (App Router, 'use client')
├── components/    # layout/, ui/, clients/, quotes/, art-production/, final-production/, tracking/
├── stores/        # useClientStore, useQuoteStore (Zustand)
├── types/         # common.ts, client.ts, quote.ts
├── lib/           # utils.ts, validators.ts, constants.ts
├── hooks/         # useSearch, useCEPLookup
└── mock/          # clients.ts, quotes.ts
```

---

## Design System

### Paleta de Cores

| Token | Hex | Uso |
|-------|-----|-----|
| `--primary` | `#0891B2` (cyan-600) | Botões primários, links, ícones ativos, sidebar accent |
| `--primary-hover` | `#0E7490` (cyan-700) | Hover de primários |
| `--accent` | `#10B981` (emerald-500) | Sucesso, status "pronto", confirmações |
| `--accent-hover` | `#059669` (emerald-600) | Hover de accent |
| `--background` | `#F8FAFC` (slate-50) | Fundo da aplicação |
| `--sidebar-bg` | `#0F172A` (slate-900) | Sidebar (cor sólida, SEM degradê) |
| `--card-bg` | `#FFFFFF` | Cards, modais, containers |
| `--text-primary` | `#0F172A` (slate-900) | Textos principais |
| `--text-secondary` | `#475569` (slate-600) | Textos auxiliares |
| `--text-muted` | `#94A3B8` (slate-400) | Placeholders, hints |
| `--border` | `#E2E8F0` (slate-200) | Bordas de cards, inputs, divisórias |

### Status Colors (StatusBadge, bordas laterais)

| Status | Badge BG/Text | Dot/Border |
|--------|--------------|------------|
| pendente | `bg-sky-50 text-sky-700` | `bg-sky-500` |
| producao_arte | `bg-amber-50 text-amber-700` | `bg-amber-500` |
| aguardando_aprovacao | `bg-orange-50 text-orange-700` | `bg-orange-500` |
| em_producao | `bg-cyan-50 text-cyan-700` | `bg-cyan-500` |
| pronto | `bg-emerald-50 text-emerald-700` | `bg-emerald-500` |
| entregue | `bg-slate-100 text-slate-500` | `bg-slate-400` |

### Urgência (deadline)

| Nível | Cor texto | Cor borda |
|-------|----------|----------|
| overdue (atrasado) | `text-red-600` | `border-l-red-500` |
| urgent (≤2 dias) | `text-orange-600` | `border-l-amber-400` |
| normal (>2 dias) | `text-gray-500` | `border-l-emerald-400` |

### Tipografia

- **Font family:** Plus Jakarta Sans, system-ui, sans-serif
- **Títulos de página:** `text-xl font-semibold tracking-tight text-gray-900`
- **Subtítulos:** `text-sm text-gray-500`
- **Labels de seção:** `text-sm font-semibold text-gray-900 uppercase tracking-wider`
- **Labels micro:** `text-[10px] font-medium uppercase tracking-wider text-gray-400`
- **Corpo:** `text-sm text-gray-700`
- **Muted:** `text-xs text-gray-500`
- **Mono (IDs, tracking):** `font-mono text-xs text-gray-400`

### Espaçamento & Layout

- **Gap entre seções:** `space-y-6`
- **Gap dentro de grids:** `gap-4` ou `gap-3`
- **Padding de cards:** `p-5` ou `p-6`
- **Border radius:** `rounded-xl` (cards), `rounded-lg` (botões, inputs), `rounded-full` (badges)
- **Grid responsivo:** `grid sm:grid-cols-2 lg:grid-cols-3`

### Sombras

- **Cards em repouso:** `shadow-sm` (`--shadow-sm`)
- **Cards em hover:** `shadow-md` (`--shadow-md`)
- **Modais:** `shadow-xl`

### Transições

- **SEMPRE:** `duration-200 ease-out`
- **NUNCA:** `transition: all` — listar propriedades (`transition-colors`, `transition-shadow`, `transition-all` SÓ em componentes controlados)
- **Propriedades compositor-friendly:** Preferir `transform` e `opacity`
- **Respeitar:** `prefers-reduced-motion` (já configurado no globals.css)

---

## Regras para Novos Componentes

### Cards

```
bg-white rounded-xl border border-slate-200 p-5 shadow-sm
hover:shadow-md transition-shadow duration-200 ease-out
cursor-pointer (se clicável)
```

### Botões

| Variante | Classes |
|----------|---------|
| Primary | `bg-cyan-600 text-white hover:bg-cyan-700` |
| Secondary | `bg-white border border-slate-200 text-slate-700 hover:bg-slate-50` |
| Accent | `bg-emerald-600 text-white hover:bg-emerald-700` |
| Danger | `bg-red-600 text-white hover:bg-red-700` |
| Ghost | `text-gray-500 hover:bg-slate-50 hover:text-gray-700` |

Todos os botões: `rounded-lg px-4 py-2.5 text-sm font-medium min-h-[44px] cursor-pointer transition-colors duration-200 ease-out`

### Modais / Dialogs

```
Overlay: fixed inset-0 z-50 bg-black/40 backdrop-blur-sm
Content: max-w-md rounded-2xl bg-white p-6 shadow-xl
         overscroll-behavior: contain
         role="dialog" aria-modal="true" aria-labelledby="..."
Fechar com Escape (keydown listener)
Bloquear scroll do body (overflow: hidden)
Botões no rodapé: flex justify-end gap-3
```

### Inputs / Forms

```
rounded-lg border border-slate-200 px-4 py-2.5 text-sm
focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20
placeholder:text-gray-400
```

- Labels: `text-sm font-medium text-gray-700 mb-1.5`
- Erros: `text-xs text-red-600 mt-1`
- Usar `autocomplete` e `type` corretos
- Placeholders terminam com `…`
- NUNCA bloquear paste

### Tags / Pills

- Produção: `bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/10`
- Montagem: `bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10`
- Tamanho: `rounded-md px-2 py-0.5 text-[10px] font-medium`

### Empty States

```tsx
<EmptyState icon={LucideIcon} title="..." description="..." />
```

Centro da tela, ícone `h-10 w-10 text-gray-300`, título em `font-semibold text-gray-900`, descrição em `text-sm text-gray-500`.

---

## Padrões Obrigatórios

### Zustand + SSR (CRÍTICO)

```tsx
// CORRETO — ler dados brutos, derivar com useMemo
const quotes = useQuoteStore((s) => s.quotes);
const filtered = useMemo(() => quotes.filter(...), [quotes]);

// ERRADO — getter no seletor causa loop infinito
const filtered = useQuoteStore((s) => s.getFiltered()); // ❌ NUNCA
```

### Navegação

- `<Link>` para navegação entre páginas (suporta Cmd+Click)
- `<button>` para ações (abrir modal, submit, toggle)
- NUNCA `<div onClick>` para navegação

### Imports

- Diretos, sem barrel files: `from '@/components/ui/StatusBadge'` (não `from '@/components/ui'`)
- Componentes pesados (forms, modais): `next/dynamic` com `{ ssr: false }`

### Acessibilidade

- Botões com ícone: `aria-label="Descrição"`
- Ícones decorativos: `aria-hidden="true"`
- Inputs: sempre com `<label>` ou `aria-label`
- Focus visível: `focus-visible:ring-2 focus-visible:ring-cyan-500/20`
- NUNCA `outline-none` sem substituto de focus
- Touch targets: mínimo `44px` (min-h-[44px])

### Performance

- Listas >50 itens: virtualizar
- `useMemo` para filtros/derivações de dados
- Map O(1) para lookups: `new Map(items.map(i => [i.id, i]))`
- `optimizePackageImports` para lucide-react e date-fns (já configurado)

---

## Web Interface Guidelines (Vercel)

### Checklist para Novos Componentes

- [ ] Botões com ícone têm `aria-label`
- [ ] Inputs têm `<label>` ou `aria-label`, `autocomplete`, `type` correto
- [ ] `<Link>` para navegação, `<button>` para ações
- [ ] Imagens com `alt`, `width`, `height`
- [ ] Focus visível em todos os interativos (`focus-visible:ring-*`)
- [ ] `prefers-reduced-motion` respeitado (globals.css cuida)
- [ ] Texto longo tratado: `truncate`, `line-clamp-*`, ou `break-words`
- [ ] Flex children com `min-w-0` para truncation funcionar
- [ ] Empty states para arrays vazios / strings vazias
- [ ] Modais com `overscroll-behavior: contain`, `Escape` para fechar
- [ ] Ações destrutivas com `ConfirmDialog` (nunca imediatas)
- [ ] Datas via `Intl.DateTimeFormat`, moeda via `Intl.NumberFormat`
- [ ] `cursor-pointer` em todos os clicáveis
- [ ] `tabular-nums` em colunas numéricas (valores, contadores)
- [ ] `…` não `...` em loading states
- [ ] Aspas curvas `"` `"` não retas `"`

### Anti-Patterns (PROIBIDOS)

- `user-scalable=no` ou `maximum-scale=1`
- `transition: all` (listar propriedades)
- `outline-none` sem `focus-visible` substituto
- `<div onClick>` para navegação (usar `<Link>`)
- `onPaste` + `preventDefault`
- Imagens sem dimensões
- Form inputs sem labels
- Formatos hardcoded de data/número (usar `Intl.*`)
- `autoFocus` sem justificativa clara

---

## Idioma

- Interface: **Português Brasileiro**
- Código (variáveis, funções): **Inglês**
- Tipos de domínio: Inglês (`Quote`, `Client`, `QuoteStatus`)
- Labels de UI: Português (`Orçamentos`, `Clientes`, `Produção de Artes`)
