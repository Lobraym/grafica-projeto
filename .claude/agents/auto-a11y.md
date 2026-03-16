---
name: auto-a11y
description: Verifica acessibilidade básica nos componentes modificados
---

# Auto Accessibility Check

Verifique nos arquivos modificados:

1. Botões com ícone têm `aria-label`
2. Ícones decorativos têm `aria-hidden="true"`
3. `<Link>` para navegação, `<button>` para ações
4. Inputs têm `<label>` ou `aria-label`
5. Focus visível em interativos (`focus-visible:ring-*`)
6. Touch targets mínimo 44px (`min-h-[44px]`)
7. Texto truncado com `truncate` + `min-w-0`

Reporte violações com sugestão de correção.
