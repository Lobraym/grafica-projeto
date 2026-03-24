GraficaPro
Escopo do Sistema — Gestão de Orçamentos
Objetivo: Eliminar o problema de recepcionistas não saberem fazer orçamentos,
tornando o processo automático e infalível. O chefe cadastra uma vez — a recepção nunca mais erra.


1. Visão Geral do Sistema
O GraficaPro é um SaaS de gestão para gráficas com foco em simplicidade e completude. O diferencial é a tela de cadastro de produtos: o chefe monta os custos do jeito que ele pensa, e o sistema calcula tudo automaticamente na hora do orçamento.

Usuários do Sistema
Perfil	Acesso	Função Principal
Administrador	Total	Cadastra produtos, custos, margens e usuários
Recepcionista	Orçamentos	Cria orçamentos — nunca precisa chamar o chefe
Designer	Produção	Recebe pedidos aprovados com briefing e arquivos
Cliente Final	Vitrine (fase 2)	Acessa loja online da gráfica e faz pedido


2. Módulo — Cadastro de Produto (Admin)
O chefe cadastra tudo em uma única tela — nunca navega entre módulos separados. A lógica foi desenhada para ser intuitiva para quem conhece o negócio mas não é técnico.

2.1 Wizard de 5 Passos
Passo 1 — Nome do produto
O chefe digita o nome como usa internamente. Ex: "Placa com Lona", "Banner", "Cartão de Visita".

Passo 2 — Tipo do produto
Produção própria
Fabricado na gráfica usando materiais e máquinas próprias.
Ex: Placa, Banner, Adesivo, Lona.
	Terceirizado
Comprado de fornecedor e revendido com margem.
Ex: Cartão de Visita (Zap Gráfica), Flyer, Caneta.


Passo 3 — Tipo de cobrança
•	Por m² — largura × altura × preço/m² (Banner, Placa, Lona)
•	Por quantidade — faixas de preço (100un, 250un, 500un...)
•	Por unidade — preço fixo por peça
•	Por metro linear — faixas, cordoalhas

Passo 4 — Blocos de custo (livre)
O chefe adiciona quantos blocos precisar. Nenhum é obrigatório. Cada produto é diferente:

Tipo de Bloco	Unidade	Exemplo de uso
Material por m²	R$/m²	Lona — com opções: Fosca R$12, Brilho R$15, Blacklight R$28
Material por metro	R$/m	Metalon — R$6/m (calculado a partir de R$36/rolo de 6m)
Custo fixo por peça	R$/peça	Acabamento — Ilhós +R$5, Bastão +R$8, Sem +R$0
Energia / máquina	R$/hora × horas	Impressão — R$2,50/h × 0,5h/m² = R$1,25/m²

Ponto crítico — cada opção de material tem custo próprio real:
Lona Fosca = R$12/m²  |  Lona Brilho = R$15/m²  |  Blacklight = R$28/m²
Não é "acréscimo em cima de base" — é o custo real de cada variação.
Isso garante que a margem seja aplicada sobre o custo correto de cada material.

Passo 5 — Margem de lucro
O chefe informa o % de lucro desejado. O sistema aplica sobre o custo total calculado. Se o fornecedor aumentar o preço, o chefe atualiza um campo e todos os orçamentos futuros já refletem o novo valor.

2.2 Exemplos Reais de Cadastro
Exemplo A — Placa com Lona (produção própria, por m²)
Bloco	Tipo	Configuração
Lona	Material por m²	Fosca R$12/m² | Brilho R$15/m² | Blacklight R$28/m²
Metalon	Material por metro	R$6/m (R$36 ÷ 6m de rolo)
Impressão	Energia/máquina	R$2,50/h × 0,5h/m² = R$1,25/m²
Acabamento	Fixo por peça	Ilhós +R$5 | Bastão +R$8 | Sem +R$0
Margem de lucro	—	45% sobre o custo total

Simulação: Placa 2m × 1m | Lona Fosca | Ilhós
Lona Fosca: 2m² × R$12 = R$24,00
Metalon estimado (~6m): R$36,00
Impressão: 2m² × R$1,25 = R$2,50
Acabamento Ilhós: R$5,00
Custo total: R$67,50  →  Preço de venda (45%): R$97,88

Exemplo B — Banner (produção própria, por m²)
Idêntico à Placa com Lona, mas sem o bloco de Metalon. O chefe simplesmente não adiciona esse bloco. O sistema não força nenhum campo.

Bloco	Tipo	Configuração
Lona	Material por m²	Fosca R$12/m² | Brilho R$15/m²
Impressão	Energia/máquina	R$2,50/h × 0,5h/m² = R$1,25/m²
Acabamento	Fixo por peça	Ilhós +R$5 | Bastão +R$8 | Sem +R$0
Margem de lucro	—	45%

Exemplo C — Cartão de Visita (terceirizado, por quantidade)
O chefe informa o custo que paga ao fornecedor (Zap Gráfica) por faixa de quantidade e define a margem. O sistema calcula o preço de venda automaticamente.

Fornecedor	Quantidade	Custo (Zap)	Venda (30%)
Zap Gráfica	100 unidades	R$ 28,00	R$ 36,40
Zap Gráfica	250 unidades	R$ 42,00	R$ 54,60
Zap Gráfica	500 unidades	R$ 65,00	R$ 84,50
Zap Gráfica	1000 unidades	R$ 98,00	R$ 127,40

3. Regras de Cálculo
3.1 Produto por m²
área = largura × altura
custo_material = área × custo_real_da_variação_escolhida
custo_metro = metragem_estimada × custo_por_metro
custo_energia = (R$/hora) × (horas/m²) × área
custo_fixo = soma dos acabamentos selecionados
custo_total = custo_material + custo_metro + custo_energia + custo_fixo
preço_venda = custo_total × (1 + margem / 100)

3.2 Produto por Quantidade (Terceirizado)
custo_base = faixa de preço do fornecedor para a quantidade informada
custo_extras = soma de variações com custo fixo (ex: frente e verso +R$20)
custo_total = custo_base + custo_extras
preço_venda = custo_total × (1 + margem / 100)

3.3 Área Mínima
Produtos por m² podem ter área mínima configurada. Se o cliente pedir uma placa 0,3m × 0,3m = 0,09m², o sistema cobra pelo mínimo configurado (ex: 0,5m²).

4. Módulo — Orçamento (Recepcionista)
A recepcionista nunca calcula nada. Ela apenas seleciona e o sistema faz o resto.

4.1 Fluxo do Orçamento
•	Seleciona ou cadastra o cliente (nome + telefone)
•	Clica em "Adicionar produto"
•	Escolhe o produto (ex: Placa com Lona)
•	O sistema exibe automaticamente os atributos cadastrados pelo chefe:
◦	Tipo de lona: [Fosca] [Brilho] [Blacklight]
◦	Acabamento: [Ilhós] [Bastão] [Sem acabamento]
◦	Dimensões: largura × altura (m)
•	O preço é calculado em tempo real enquanto ela preenche
•	Pode adicionar mais produtos ao mesmo orçamento
•	Adiciona observações e faz upload de arquivos de referência para o designer
•	Salva → sistema gera PDF automaticamente
•	Envia por WhatsApp ou imprime

4.2 Permissões
Ação	Admin	Recepção	Designer
Cadastrar / editar produtos	Sim	Não	Não
Editar preços e margens	Sim	Não	Não
Criar orçamento	Sim	Sim	Não
Dar desconto	Sim	Limitado (% max configurável)	Não
Aprovar orçamento	Sim	Não	Não
Ver fila de produção	Sim	Sim	Sim
Gerenciar usuários	Sim	Não	Não


5. Estrutura do Banco de Dados
O banco é organizado de forma normalizada por baixo, mas o chefe nunca vê essa complexidade — ele interage apenas com o wizard de uma tela.

Tabela	Função
produtos	Nome, tipo (proprio/terceiro), cobrança (m2/qtd/un), área mínima, margem, ativo
blocos_custo	Cada bloco de custo de um produto: nome, tipo (m2/metro/fixo/energia), produtoId
opcoes_bloco	Opções de um bloco com custo próprio: Fosca R$12, Brilho R$15, Blacklight R$28
faixas_preco	Tabela quantidade × custo para produtos terceirizados por faixa
clientes	Nome, telefone, email, histórico de orçamentos
orcamentos	Cliente, data, status, total, itens
orcamento_itens	Produto, opções escolhidas, dimensões, subtotal
usuarios	Nome, email, perfil (admin/recepcao/designer), graficaId
graficas	Dados da gráfica cliente do SaaS (multi-tenant)


6. Decisões de Arquitetura
6.1 O que NÃO fazer (aprendizado de outras abordagens)
NÃO separar em 4+ módulos de cadastro independentes:
Módulo de produto + módulo de material + módulo de variação + módulo de serviço = chefe
navega em 4 telas pra cadastrar 1 produto. Isso é o problema que queremos resolver.

NÃO usar variação como "acréscimo em cima de base":
Lona base R$18 + Fosca +R$0 = R$18 → ERRADO se Fosca real custa R$12.
O correto é: cada variação tem seu custo real. Fosca = R$12, Brilho = R$15.

NÃO ter campos de texto livre no orçamento (Serviço, Material):
Se a recepcionista digitar manualmente, ela vai digitar errado e o cálculo automático não funciona.
Tudo deve vir de dropdowns alimentados pelo cadastro do admin.

6.2 Decisões certas
•	Wizard em 1 tela só — chefe nunca navega entre módulos
•	Custo real por variação — margem aplicada sobre custo correto
•	Blocos de custo livres — sem campos obrigatórios, cada produto é diferente
•	Margem de lucro configurável por produto
•	Banco normalizado por baixo — estrutura correta sem expor complexidade
•	Multi-tenant — cada gráfica é isolada no mesmo sistema

