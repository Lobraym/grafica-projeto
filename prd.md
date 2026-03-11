Sistema de Orçamentos para Gráfica
Quero fazer um site de orçamentos para gráfica. A ideia é que tenha um menu na borda esquerda do site, contendo vários cards.
Card: Clientes
Dentro do card Clientes será feito o cadastro dos clientes.
Como teremos muitos clientes cadastrados, eles serão organizados por ordem alfabética. Dentro do card Clientes existirão outros cards com as letras A, B, C até Z, onde cada cliente será listado de acordo com a primeira letra do nome.
Também haverá uma barra de pesquisa no topo, onde será possível buscar clientes por:
•	Nome
•	Telefone
•	Email
•	CPF
Ao clicar em um cliente, será possível acessar o perfil dele, onde aparecerá:
•	Todos os trabalhos já realizados
•	Orçamentos anteriores
•	Status de pagamento
•	Opção de criar um novo orçamento
________________________________________
Cadastro de Cliente
O formulário de cadastro terá os seguintes campos:
Dados principais
Nome Completo / Razão Social*
Ex: João Silva
Tipo de Pessoa*
•	Pessoa Física
•	Pessoa Jurídica
CPF*
000.000.000-00
Telefone*
(00) 00000-0000
Email
cliente@email.com
________________________________________
Endereço
CEP
00000-000
Rua / Avenida
Nome da rua
Número
123
Complemento
Apto, Sala, etc
Bairro
Nome do bairro
Cidade
São Paulo
Estado
SP
________________________________________
Informações adicionais
Observações
Informações relevantes sobre o cliente.
________________________________________
Botões do formulário
❌ Cancelar
💾 Salvar Cliente
Card: Orçamentos
Nesse card ficarão todos os orçamentos.
Eles serão organizados por prioridade de entrega, onde os que precisam ser entregues primeiro aparecerão no topo.
Cada orçamento terá um resumo com:
•	Cliente
•	Material
•	Prazo
•	Valor
•	Status
•	Ações
Ações disponíveis
•	Visualizar tudo
•	Editar
•	Copiar link de acompanhamento
•	Ver arquivos
•	Link de Acompanhamento do Orçamento
•	Quando um orçamento for criado, será gerado um link para o cliente acompanhar o andamento.
•	Os status serão:
•	🔵 Pendente
🟡 Produção de arte
🟠 Aguardando aprovação
🟢 Produção
Card: Produção de Artes
Quando a recepcionista criar um orçamento, ele automaticamente irá para Produção de Artes.
Dentro dessa área existirão três abas:
•	Disponível
•	Em produção
•	Concluídas
________________________________________
Aba: Disponível
A designer poderá ver todos os trabalhos disponíveis.
Ela poderá clicar no trabalho para ver todos os detalhes.
Se quiser pegar o trabalho, haverá um botão:
▶ Iniciar
Ao clicar em iniciar:
•	o trabalho vai para Em produção
•	o status do link muda para 🟡 Produção de arte
________________________________________
Aba: Em Produção
Dentro do card haverá um checklist obrigatório:
✔ Confirmar se cores estão corretas
✔ Confirmar se tamanho está correto
Somente após isso será liberada a revisão do cliente.
________________________________________
Revisão do Cliente
A designer abrirá uma tela onde poderá:
•	Anexar print da arte
•	Escrever uma descrição ou mensagem para o cliente
Depois disso ela clica em:
📤 Enviar
Antes de enviar aparecerá uma confirmação:
"Tem certeza que deseja enviar?"
Isso evita envios acidentais.
________________________________________
Aprovação do Cliente
Quando enviado, o cliente recebe novamente o link de acompanhamento.
O status passa para:
🟠 Aguardando aprovação
O cliente verá:
•	a imagem da arte
•	campo para escrever observações
E terá duas opções:
✅ Aprovar
❌ Reprovar
Se reprovar, poderá escrever uma mensagem para a designer explicando o que precisa alterar.
Aprovação da Arte pelo Cliente
Quando a arte é enviada para o cliente e ele aprova:
✔ O sistema muda automaticamente o status do orçamento para:
Arte Aprovada
✔ O orçamento sai da lista Produção de Arte
✔ Vai para a seção:
Concluídas da Produção de Arte
Essa seção mostra para a designer que:
✅ O cliente aprovou
✅ Não precisa mais alterar a arte
✅ Já pode enviar para produção
________________________________________
Área "Concluídas da Produção de Arte"
Nessa tela a designer verá os cards assim:
Cliente: Loja Central
Serviço: Banner 2x1
Status: Arte aprovada
Prazo: 12/03
Ela pode clicar no orçamento para abrir os detalhes.
________________________________________
Envio da Arte para Produção
Dentro do orçamento haverá um botão:
Enviar para Produção
Antes de enviar, a designer precisa:
1️⃣ Anexar o arquivo final
Formato recomendado:
arte_final.pdf
(O PDF evita erro de fonte ou arquivo na impressão)
________________________________________
2️⃣ Adicionar descrição para a produção
Campo opcional:
Exemplo:
• Imprimir em lona brilho
• Tamanho 2m x 1m
• Usar ilhós nas pontas
• Atenção ao corte lateral
Isso ajuda a equipe de impressão e montagem.
________________________________________
Botão Enviar para Produção
Depois de anexar o arquivo e escrever a descrição, aparece o botão:
Enviar para Produção Final
Ao clicar, o sistema mostra uma confirmação:
Tem certeza que deseja enviar este trabalho para a produção?

Depois de enviado, não será possível alterar a arte.

[ Cancelar ]   [ Confirmar envio ]
Isso evita erros.
________________________________________
Depois da confirmação
O sistema faz automaticamente:
1️⃣ Move o orçamento para a seção Produção
2️⃣ Notifica a equipe de produção
3️⃣ Produção recebe:
•	Arquivo PDF final
•	Descrição da designer
•	Informações do pedido
________________________________________
Produção recebe o trabalho
A produção verá algo assim:
Cliente: Loja Central
Serviço: Banner

Arquivo: arte_final.pdf

Instruções:
• Lona brilho
• 2m x 1m
• Ilhós nas pontas
Etapas:
[ ] Impressão
[ ] Montagem
Quando finalizar:
Entregar trabalho
Fluxo da Produção Final
Depois que a designer envia para produção e escolhe as etapas:
[X] Impressão
[X] Montagem
O orçamento vai para o card:
Produção Final
Estrutura do Card Produção Final
Existe um card principal:
Produção Final
Dentro dele existem duas abas no topo:
Impressão | Montagem
Cada aba tem 3 estados de trabalho.
________________________________________
Aba Impressão
Funciona assim:
Disponíveis
Em Impressão
Concluídas
1️⃣ Disponíveis
Aqui ficam os orçamentos que precisam ser impressos.
Exemplo:
Cliente: João
Material: Lona Black Light
Tamanho: 3m x 2m

[ Iniciar ]
Quando o operador clicar Iniciar, o card vai para:
________________________________________
2️⃣ Em Impressão
Aqui ficam os trabalhos que estão sendo impressos.
Exemplo:
Cliente: João
75% impresso

[ Finalizar ]
Quando clicar Finalizar, vai para:
________________________________________
3️⃣ Concluídas
Aqui ficam os trabalhos que já foram impressos.
Exemplo:
Cliente: João
✔ Impressão concluída
________________________________________
Aba Montagem
Mesma lógica da impressão.
Disponíveis
Em Montagem
Concluídas
________________________________________
1️⃣ Disponíveis
Cliente: João
Serviço: Banner

[ Iniciar ]
Quando clicar Iniciar:
________________________________________
2️⃣ Em Montagem
Cliente: João

[ Finalizar ]
________________________________________
3️⃣ Concluídas
✔ Montagem concluída
________________________________________
Regra final do sistema
O sistema verifica:
Impressão = concluída
Montagem = concluída
Quando as duas estiverem concluídas:
O orçamento sai de Produção Final e vai para:
Orçamentos Prontos
________________________________________
Exemplo visual do fluxo
Produção Final

[ Aba Impressão ]
Disponíveis → Em Impressão → Concluídas

[ Aba Montagem ]
Disponíveis → Em Montagem → Concluídas
Quando ambas terminarem:
Orçamentos Prontos
Card Orçamentos Prontos
Aqui a recepção vê os trabalhos finalizados.
Exemplo:
Cliente: Loja Central
Serviço: Banner 2x1
Status: Produção finalizada
Botões disponíveis:
Notificar Cliente
Marcar como Entregue
________________________________________
Botão Notificar Cliente
Quando clicar:
O sistema envia mensagem automática por:
📱 WhatsApp
ou
📧 Email
Exemplo de mensagem:
Olá! Seu pedido na gráfica já está pronto.

Cliente: Loja Central
Serviço: Banner 2x1

Você já pode retirar.
________________________________________
Botão Marcar como Entregue
Quando o cliente buscar o pedido:
Recepção clica:
Marcar como entregue
O orçamento vai para:
Histórico / Entregues

