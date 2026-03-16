---
name: auto-design-review
description: Verifica aderência ao design system definido no CLAUDE.md
---

# Auto Design Review

Verifique os arquivos modificados contra as regras do CLAUDE.md:

1. **Cores**: Usar apenas tokens da paleta (cyan-600 primary, emerald-500 accent, etc.)
2. **Tipografia**: Plus Jakarta Sans, tamanhos corretos (text-sm, text-xs, etc.)
3. **Espaçamento**: gap-4, p-5/p-6 para cards, space-y-6 entre seções
4. **Transições**: duration-200 ease-out, nunca `transition: all`
5. **Acessibilidade**: aria-label em botões com ícone, aria-hidden em ícones decorativos
6. **Anti-patterns**: Sem outline-none sem substituto, sem div onClick para nav
7. **Componentes**: Cards com rounded-xl, botões com rounded-lg, min-h-[44px]
8. **Números**: tabular-nums em colunas numéricas

Reporte violações encontradas com arquivo, linha e sugestão de correção.
