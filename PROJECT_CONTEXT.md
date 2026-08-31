# JF Oficina — Contexto persistente do projeto

Este arquivo existe para permitir continuidade entre conversas do ChatGPT sem depender do histórico do chat. Antes de alterar o sistema, ler este arquivo e os arquivos citados abaixo.

## Repositório e ambiente

- Repositório: `jefe198686-pixel/jf-oficina`
- Branch principal: `main`
- Aplicação: `https://jf-oficina.vercel.app`
- Aplicação em PWA/HTTPS, com Service Worker e atualização automática.
- Projeto deve funcionar em PC e celular.
- Regra operacional: fazer alterações pequenas, isoladas e testáveis; não mexer em áreas não relacionadas à solicitação atual.
- Preservar tudo que já estiver funcionando.

## Versão atual

- Versão em desenvolvimento/publicada: `0.20.4`
- `version.json`, `release.js` e `app.js` devem permanecer sincronizados com a versão.
- `sw.js` deve ser atualizado quando uma nova versão precisar forçar cache novo.

## Arquivos principais

- `index.html` — estrutura base da interface.
- `app.js` — carregador modular.
- `core.js` — funções e estado base.
- `os.js` — Ordens de Serviço.
- `budgets.js` — Orçamentos.
- `clients.js` — clientes e equipamentos.
- `products.js` — produtos.
- `services-compact.js` — pesquisa/listagem compacta de serviços na OS e orçamento.
- `inline-create.js` — cadastro rápido dentro de OS/orçamento.
- `updater-tech.js` — ditado, revisão de escrita e revisão técnica.
- `writing-correction-fix.js` — correções adicionais de escrita.
- `management.js` e `report-drilldown.js` — relatórios gerenciais e navegação em profundidade.
- `service-intelligence.js` — checklist técnico inteligente.
- `release.js`, `version.json`, `sw.js` — controle de versão e atualização.

## Regras funcionais principais

### Clientes e equipamentos

- Cada cliente possui histórico próprio, equipamentos e OS.
- Cliente e equipamento precisam ser editáveis.
- Em OS e Orçamento deve ser possível criar equipamento na hora, sem sair da tela.
- Ao criar equipamento dentro da OS/orçamento, vincular ao cliente selecionado e já selecionar no documento atual.

### Produtos

- `Código do produto`: sequencial histórico herdado do CTiComércio; não reutilizar código apagado.
- `Código interno`: código do fabricante/referência; pode ficar vazio.
- `Código de barras / GTIN`: se não existir, usar `SEM GTIN`.
- Produto pode ser criado dentro de OS e Orçamento sem sair da tela.
- Criar produto a partir do orçamento/OS não significa entrada física de estoque.
- Produto excluído vai para lixeira temporária; histórico não pode ser destruído.
- QR de produto deve usar identificador estável.

### OS

Status:
- Em andamento
- Aguardando peças
- Concluída
- Finalizada
- Cancelada

Campos técnicos importantes:
- Defeito reclamado
- Defeito constatado
- Descrição do Serviço
- Laudo técnico
- Recomendação
- Observações internas

`Descrição do Serviço` vem antes de `Laudo Técnico`.

### Orçamento

- Orçamento é proposta técnica/comercial.
- Não movimenta estoque ou financeiro por si só.
- Pode ser convertido em OS.
- Deve permitir criar cliente/equipamento/produto/serviço sem sair da tela.
- Equipamentos do cliente ficam vinculados ao orçamento.

### Serviços

- Catálogo de serviços possui código, descrição, categoria/palavra-chave, valor e demais campos do catálogo existente.
- Na área de Serviços de OS e Orçamento existe pesquisa rápida por:
  - Código
  - Descrição
  - Categoria / palavra-chave
- Serviço selecionado entra como linha com quantidade/horas, valor, desconto, acréscimo e técnico.
- REQUISITO PENDENTE ATUAL: na própria área de Serviços de OS e Orçamento deve existir botão `+ Novo serviço` para cadastrar um serviço novo na hora, gravar no catálogo e já adicioná-lo ao documento atual, sem perder os dados preenchidos.

### Corretor de escrita

- Botão `Corrigir escrita` deve corrigir ortografia, acentuação, pontuação e erros comuns sem inventar diagnóstico, medidas ou procedimentos.
- Botão `Revisar tecnicamente` pode trocar linguagem comum por terminologia técnica, sempre preservando fatos registrados.
- Dicionário customizado protege termos técnicos.
- Correções já adicionadas incluem exemplos como:
  - `confecionar` → `confeccionar`
  - `compressir` → `compressor`
  - `16vias` → `16 vias`
  - correções de conexão, alta, saída, gás, etc.

### Checklist técnico inteligente

Princípio:
`Categoria → Reclamação → Defeito constatado → checklist específico → procedimentos confirmados → Descrição do Serviço`

- `Defeito constatado` tem peso principal.
- Reclamação é contexto secundário.
- Sistema sugere, mas nunca marca procedimentos automaticamente.
- Somente itens confirmados pelo técnico entram na Descrição do Serviço.
- Biblioteca deve ser editável sem alterar código.

### Relatórios

Todos os relatórios devem ser navegáveis, não apenas tabelas estáticas.

Exemplos:
- Cliente → equipamentos → OS → abrir OS.
- Equipamento → OS relacionadas.
- Técnico → OS relacionadas.
- Produto/peça → OS onde foi usado.
- Serviço → OS onde foi lançado.
- Falha recorrente → ocorrências/OS relacionadas.

PDF e CSV continuam como saída, mas a consulta interna precisa ter drill-down.

## Padrão visual e operacional

- Tema Brasil/JF já existente deve ser preservado.
- Não redesenhar telas sem solicitação.
- Não remover funções existentes para resolver um problema local.
- Preferir uma mudança estrutural por versão.
- Validar sintaxe e dependências antes de publicar.
- Quando alterar versão, sincronizar `app.js`, `release.js`, `version.json` e, quando necessário, `sw.js`.

## Estado atual e próxima tarefa

Última tela revisada: Orçamento → aba `Serviços`.

Pedido atual do usuário:
> Nesta área tem que ter um botão criar novo serviço.

Implementação esperada:
- Adicionar `+ Novo serviço` próximo aos campos de pesquisa de serviço.
- Abrir cadastro rápido do catálogo de serviços.
- Campos mínimos do cadastro devem seguir o cadastro de serviço já existente no sistema.
- Ao salvar:
  1. salvar no catálogo de serviços;
  2. adicionar automaticamente o novo serviço ao orçamento/OS atual;
  3. manter quantidade inicial 1;
  4. carregar o valor padrão do serviço;
  5. preservar todo o restante já digitado no documento.
- O mesmo comportamento deve funcionar tanto em OS quanto em Orçamento.

## Como continuar em uma nova conversa

Na nova conversa, o usuário pode escrever:

`Continue o projeto JF Oficina. Leia primeiro PROJECT_CONTEXT.md do repositório jefe198686-pixel/jf-oficina e depois verifique a versão atual antes de alterar qualquer arquivo.`

Depois disso, ler este arquivo e os arquivos específicos envolvidos na tarefa antes de executar alterações.
