---
name: lagom-bling-middleware
version: "1.0.0"
description: >
  Diretrizes permanentes para o Manus projetar, implementar, testar e operar o
  middleware bidirecional Lagom DRP ↔ Bling API v3, com integração programada,
  autenticação segura e frontend Node.js para rastreabilidade integral.
---

# SKILL — Middleware de integração Lagom DRP ↔ Bling

## 0. Como utilizar esta skill

Esta é a **especificação permanente e prioritária do projeto**. Ao trabalhar no repositório, o Manus deve ler este arquivo primeiro, inspecionar o código existente e manter coerência com estas regras. Quando houver conflito entre uma suposição e a documentação oficial, prevalece a documentação oficial. Quando o contrato de uma API não for verificável, **não inventar endpoint, payload, autenticação, regra de negócio ou confirmação de sucesso**; documentar a pendência e deixar somente a operação afetada desabilitada.

**Repositório-alvo:** `https://github.com/danielfourmanute/lagom_bling` (pode ser privado; trabalhar na cópia local disponível, por exemplo `~/apps/lagom_bling`).

**Idioma de telas, documentação, logs operacionais e relatórios:** português brasileiro. Nomes técnicos no código em inglês quando apropriado.

**Objetivo executável:** entregar um middleware confiável que envie **Transferências** e **Compras** do Lagom para o Bling a cada 10 minutos, execute uma **carga Bling → Lagom diariamente às 20:00**, e ofereça um **frontend web desenvolvido com ferramentas Node.js** para visualizar e auditar todas as transações.

## 1. Endereços fixos e fontes de verdade

Não substituir os sistemas, criar mocks como se fossem sistemas reais ou usar endpoints de documentação como endpoints transacionais.

| Serviço | Endereço fixo | Finalidade |
|---|---|---|
| Documentação oficial Bling | `https://developer.bling.com.br/referencia` | Descobrir operações, schemas, validações e respostas |
| API de execução Bling v3 | `https://api.bling.com.br/Api/v3` | Chamadas REST reais; base atual indicada pelo Bling |
| Documentação Lagom DRP (sandbox) | `https://beta-api-sandbox.lagomtech.com.br/api#/` | Inspecionar Swagger, descobrir rotas e DTOs reais |
| Host Lagom (sandbox) | `https://beta-api-sandbox.lagomtech.com.br` | Host da API; **prefixo de rotas e autenticação dependem do Swagger** |

Regras:

1. O fragmento `#/` e a rota `/api` da página Swagger **não provam** que `/api` seja o prefixo de todas as operações do Lagom.
2. Na primeira etapa, tentar obter a especificação OpenAPI real do Lagom via interface Swagger ou pelo mecanismo indicado por ela; salvar o snapshot/versionamento da especificação em `docs/contracts/` somente se autorizado e sem segredos.
3. Ler a referência do Bling **e as notas de versão** antes de codificar os DTOs; registrar endpoints efetivamente validados em `docs/api-mapping.md`.
4. **Não há contrato Lagom confirmado nesta skill.** A indisponibilidade da documentação ou falta de credenciais exige um bloqueio explícito apenas das operações dependentes desse contrato.
5. O Bling tem operações documentadas de **pedidos de compra** (`/pedidos/compras`), mas o nome de uma operação de **transferência de estoque entre depósitos/filiais** não deve ser deduzido. Validar se existe recurso nativo e quais os efeitos em estoque; não simular transferência por lançamento unilateral sem aprovação expressa.
6. Não usar a URL antiga da API `https://bling.com.br/Api/v3` como base REST.

## 2. Direção e responsabilidade dos dados

### Fluxo A — Lagom → Bling: a cada 10 minutos

- **Compras:** Lagom é a origem das solicitações/pedidos de compra a integrar; Bling é o destino da criação/atualização permitida pelo contrato.
- **Transferências:** Lagom é a origem dos movimentos entre estabelecimentos/depósitos definidos no DRP; Bling recebe a representação **somente quando o endpoint e a semântica forem comprovados**.
- Selecionar documentos novos ou modificados a partir do último checkpoint confirmado, respeitando status elegíveis do Lagom.
- Fazer a reconciliação por chave de negócio e ID externo; evitar recriar documentos já transmitidos.
- Validações obrigatórias: empresa/filial, depósito origem/destino, fornecedor, produtos, unidades de medida, quantidades, valores, moeda, datas, situação e unicidade documental, conforme o tipo e os contratos efetivos.
- Não criar automaticamente fornecedor/produto/depósito inexistente sem regra de cadastro aprovada. Registrar pendência de mapeamento e permitir correção.
- Não enviar documentos cancelados, estornados ou já concluídos em estado incompatível sem regra de transição homologada.
- Separar criação, atualização, cancelamento e mudança de status; usar apenas operações suportadas e autorizadas.

### Fluxo B — Bling → Lagom: uma vez por dia, às 20:00

- Execução diária no fuso **`America/Sao_Paulo`**.
- Antes de desenvolver, descobrir quais recursos o Lagom realmente permite importar; produzir matriz **Bling recurso → Lagom recurso → chave de identidade → regra de atualização**.
- Recursos a **avaliar**, não automaticamente ativar: produtos, fornecedores/contatos, depósitos/filiais, saldos de estoque e registros de compras necessários ao DRP. Ativar somente os que tiverem endpoint Lagom, campos e aprovação de negócio confirmados.
- Na primeira execução, prever carga inicial controlada, paginada e validada. Nas seguintes, preferir atualização incremental por data de alteração **quando suportada**, com janela de sobreposição e deduplicação; se não houver filtro incremental, planejar varredura paginada/reconciliação segura.
- Não sobrescrever campos cujo sistema mestre seja o Lagom. Aplicar política de propriedade por campo.
- Evitar **loop de integração**: registros originados do Lagom e refletidos no Bling não devem voltar como documentos novos no fluxo reverso. Usar metadados de origem, tabela de vínculo e regras por recurso.
- Nunca usar a carga de dados para emitir notas, liquidar contas, faturar, movimentar estoque ou excluir registros de maneira implícita.

### Matriz de mapeamento obrigatória

Para cada entidade, documentar em `docs/api-mapping.md`:

| Campo | Exigência |
|---|---|
| Entidade e direção | Ex.: pedido de compra; Lagom → Bling |
| Endpoint Lagom | Método, URL relativa, autenticação, paginação e schema confirmados |
| Endpoint Bling | Método, URL relativa, permissões e schema confirmados |
| Chaves de vínculo | Tenant/empresa, tipo, ID Lagom, ID Bling, número externo |
| Status permitidos | Estados de origem e destino, transições, cancelamento |
| Transformação | Campo origem → campo destino, tipos, enumerações, unidades |
| Regras de conflito | Fonte mestra, prioridade, versão e procedimento de correção |
| Testes e evidências | Fixtures e resposta da homologação, sem credenciais |
| Situação | CONFIRMADO / PENDENTE / BLOQUEADO |

Não implementar operação de escrita classificada como PENDENTE ou BLOQUEADO.

## 3. Agendamentos imutáveis

| Job | Direção | Expressão cron | Fuso | Comportamento |
|---|---|---|---|---|
| `lagom-to-bling-outbound` | Lagom → Bling | `*/10 * * * *` | `America/Sao_Paulo` | Compras e Transferências elegíveis, a cada 10 minutos |
| `bling-to-lagom-daily` | Bling → Lagom | `0 20 * * *` | `America/Sao_Paulo` | Carga diária às 20:00 |

Regras de execução:

1. Executar jobs em **worker separado do servidor HTTP** e coordenar agendas por um único scheduler lógico.
2. Usar lock distribuído para impedir execução simultânea do mesmo job; realizar renovação e liberação segura do lock.
3. Uma execução que ultrapassar seu próximo horário **não deve ser duplicada**. Registrar sobreposição evitada.
4. Persistir checkpoint por empresa, recurso e direção **somente após confirmação de aplicação**; não avançar por erro parcial.
5. No reinício do serviço, aplicar política explícita de recuperação de execuções interrompidas e do horário perdido, sem tempestade de execuções.
6. Oferecer execução manual, *dry-run*, reprocessamento de erro e pausa/reativação via RBAC, cada ação auditada.
7. Em desenvolvimento e homologação, iniciar com `SCHEDULER_ENABLED=false` e `WRITE_ENABLED=false`. Habilitar em produção **após validação e aprovação operacional**, mantendo exatamente os horários definidos acima.
8. Interpretar e persistir instantes em UTC no banco, mas apresentar horas e agendar no fuso de São Paulo.

## 4. Arquitetura de referência

**Preferir manter a stack existente do repositório quando tecnicamente adequada.** Se o projeto estiver vazio ou não tiver arquitetura estabelecida, adotar:

- **Backend de integração:** Node.js LTS + TypeScript + Fastify, com camadas `routes`, `services`, `adapters`, `mappers`, `repositories`.
- **Frontend web:** Vue 3 + TypeScript + Vite + PrimeVue; ferramenta de build e servidor de desenvolvimento em Node.js. O navegador não acessa diretamente as APIs Bling/Lagom nem recebe segredos.
- **Fila/scheduler:** Redis + BullMQ ou alternativa equivalente com semântica de lock, retry e jobs persistentes.
- **Banco:** PostgreSQL com migrations versionadas e transações. Usar ORM/query builder conforme stack encontrada.
- **Observabilidade:** logs estruturados JSON, métricas, health checks; SSE ou WebSocket autenticado para atualização em tempo real da interface.
- **Deploy:** Docker Compose com serviços `api`, `web`, `worker`, `scheduler` (ou scheduler embutido com liderança única), `postgres` e `redis`; health checks e volumes persistentes.

Arquitetura lógica:

```text
          Lagom DRP (sandbox/API)       Bling API v3
                    |                       |
                    v                       v
             [Lagom Adapter]         [Bling Adapter + OAuth]
                    \                       /
                     \ [Validação + Mapeamentos]
                      \        |             /
                       [Motor de integração]
                         |       |
                   [PostgreSQL] [Redis/Fila]
                         |       |
                  [API Fastify + Worker]
                         |
                 [Vue 3 / PrimeVue]
                Dashboard e auditoria
```

Não criar chamadas de escrita diretamente a partir do frontend; todas devem passar pelo backend autenticado.

## 5. Autenticação e configuração `.env`

**Todas as credenciais devem vir de variáveis de ambiente**, carregadas no servidor/worker. Nunca hardcodar tokens, client secrets ou passwords; nunca comitar `.env`, arquivos de token ou payloads sem sanitização. Versionar apenas `.env.example` sem valores reais.

Modelo para gerar como `.env.example`:

```dotenv
NODE_ENV=development
APP_PORT=3000
FRONTEND_PORT=5173
PUBLIC_APP_URL=http://localhost:5173
API_PUBLIC_URL=http://localhost:3000
TZ=America/Sao_Paulo

# Bling API v3 — endpoint oficial atual
BLING_API_BASE_URL=https://api.bling.com.br/Api/v3
BLING_DOCS_URL=https://developer.bling.com.br/referencia
BLING_OAUTH_AUTHORIZE_URL=https://www.bling.com.br/Api/v3/oauth/authorize
BLING_OAUTH_TOKEN_URL=https://api.bling.com.br/Api/v3/oauth/token
BLING_CLIENT_ID=
BLING_CLIENT_SECRET=
BLING_REDIRECT_URI=http://localhost:3000/api/integrations/bling/oauth/callback

# Lagom — host sandbox confirmado; rotas/credenciais conforme Swagger
LAGOM_DOCS_URL=https://beta-api-sandbox.lagomtech.com.br/api#/
LAGOM_API_BASE_URL=https://beta-api-sandbox.lagomtech.com.br
LAGOM_API_PREFIX=
LAGOM_AUTH_TYPE=
LAGOM_API_KEY=
LAGOM_BEARER_TOKEN=
LAGOM_USERNAME=
LAGOM_PASSWORD=

# Aplicação, proteção de tokens e persistência
DATABASE_URL=postgresql://app:change_me@postgres:5432/lagom_bling
REDIS_URL=redis://redis:6379
APP_SESSION_SECRET=
TOKEN_ENCRYPTION_KEY=

# Agenda fixa — não alterar sem solicitação do responsável
OUTBOUND_CRON=*/10 * * * *
INBOUND_CRON=0 20 * * *
SCHEDULER_TIMEZONE=America/Sao_Paulo
SCHEDULER_ENABLED=false
WRITE_ENABLED=false

# Segurança e operação
REQUEST_TIMEOUT_MS=30000
BLING_RATE_LIMIT_PER_SECOND=2
MAX_RETRY_ATTEMPTS=5
LOG_LEVEL=info
DRY_RUN_DEFAULT=true
```

Observações:

- O tipo de autenticação do **Lagom não foi verificado**. Os nomes `LAGOM_*` são alternativas de configuração; implementar **apenas** a modalidade comprovada no Swagger/contrato e não enviar diferentes credenciais simultaneamente.
- Para o **Bling**, implementar **OAuth 2.0 Authorization Code**: consentimento, `state` anti-CSRF, troca de código por token no backend e refresh automático. A documentação atual do Bling indica o endpoint de token na API v3 e uso de `Authorization: Basic` com client ID/secret na troca/renovação.
- Tokens OAuth gerados em runtime são **dinâmicos**: não tentar gravar refresh tokens renovados no arquivo `.env`. Guardar tokens cifrados no banco/secret store, proteger a chave de criptografia via `.env`/secret manager, controlar rotação e bloquear acessos não autorizados.
- Evitar refresh concorrente; renovação centralizada com lock por conta, margem de expiração e persistência atômica do novo refresh token.
- A URL de autorização e o callback devem ser revistos conforme o aplicativo registrado e a documentação do Bling vigente.
- Nunca exibir no frontend Authorization header, token, refresh token, client secret, cookies ou senha.

## 6. Limites, retries e tratamento de falhas

A documentação do Bling informa limites gerais **por conta** de **3 requisições/segundo** e **120.000/dia**. Aplicar controle **global por conta** (incluindo API e workers), com margem operacional conservadora configurada inicialmente em 2 requisições/segundo. Não assumir que ampliar o número de workers amplia a cota.

- Em HTTP `429`, respeitar `Retry-After` quando presente e aplicar backoff exponencial com jitter; distinguir limite por segundo e limite diário.
- Em HTTP `5xx`, timeout ou falha de rede, usar retry limitado com backoff e circuit breaker; **antes de repetir operação de escrita com resposta ambígua, consultar o destino pela chave de vínculo** para evitar duplicação.
- Em HTTP `400/422`, registrar erros de validação e mover para revisão humana; não repetir sem corrigir dados.
- Em HTTP `401`, tentar a renovação OAuth conforme regra e repetir no máximo a operação autorizada. Em `403`, sinalizar escopo/permissão, não ficar tentando indefinidamente.
- Respeitar paginação real, filtros aceitos e o limite de período da API; documentar comportamento de campos vazios, datas e enumerações.
- Não realizar retry infinito; após `MAX_RETRY_ATTEMPTS`, enviar para fila de falhas (*dead letter*) com erro resumido e opção segura de reprocessar.
- Não confundir sucesso HTTP com sucesso de negócio. Registrar confirmação de entidade/ID/status de destino e reconhecer falhas por item dentro de uma carga.
- Registrar transação **parcialmente aplicada** quando houver mais de uma etapa e falha intermediária; implementar estratégia explícita de reconciliação/compensação, nunca exclusão/estorno automático sem regra homologada.

## 7. Idempotência, consistência e rastreabilidade

Cada transação precisa de um identificador único `correlation_id` que conecte origem → processamento → destino → resposta → auditoria.

Criar tabelas (nomes indicativos; adaptar às convenções do projeto):

1. `integration_runs`: job, direção, início, fim, duração, status, totais, checkpoint anterior/novo, motivo.
2. `integration_events`: correlation_id, empresa, recurso, ação, origem/destino, ID externo, status, tentativas, HTTP code, início/fim, duração, erro sanitizado, hash dos dados e vínculo com run.
3. `entity_links`: empresa/tenant, tipo, `lagom_id`, `bling_id`, número de negócio, origem canônica, versão/hash, datas e UNIQUE conforme regra de negócio.
4. `integration_cursors`: direção, empresa, recurso, cursor, último sucesso confirmado, última execução.
5. `integration_attempts`: log de cada tentativa, método e rota sem segredo, status HTTP, latência, erro, request/response sanitizados e tamanho (metadados mínimos por padrão).
6. `integration_dead_letters`: evento, causa, pendência, status de reprocessamento, responsável.
7. `audit_actions`: usuário, ação administrativa, evento, data/hora, justificativa, resultado.
8. `oauth_connections`: conta autorizada, identificador, escopos, validade, tokens cifrados, status; isolamento por conta.

Regras:

- Chave idempotente: `empresa + direção + tipo_documento + id_origem + versão/ação`, adaptada às características reais do documento; UNIQUE no banco e deduplicação no worker.
- `correlation_id` estável nos retries; `attempt_id` único por tentativa.
- Máquina de estados sugerida: `PENDENTE`, `PROCESSANDO`, `SUCESSO`, `ERRO_VALIDACAO`, `ERRO_TRANSITORIO`, `BLOQUEADO`, `PARCIAL`, `CANCELADO`, `REPROCESSADO`.
- Payloads completos de negócios podem conter dados pessoais ou fiscais: salvar apenas versão **sanitizada** e controlar retenção, acesso e criptografia; armazenar hash para reconciliação quando o corpo não puder ser preservado.
- O mesmo documento enviado duas vezes, sem alteração de conteúdo ou status, **não pode gerar dois documentos no Bling**.
- Erros e exceções devem ficar disponíveis no painel, e não apenas em `console.log`/arquivos locais.

## 8. Regras específicas para compras e transferências

### Compras Lagom → Bling

- Confirmar endpoints de listagem/detalhamento, criação, atualização e alteração de situação de **pedidos de compra** na documentação atual do Bling; considerar o recurso `/pedidos/compras` como família documentada, mas validar cada método e payload.
- Conferir fornecedor, itens, SKU/código, quantidade, unidade, preços, descontos, frete, impostos e parcelas **somente conforme os campos realmente suportados**.
- Resolver IDs internos do Bling por tabelas de vínculo; nunca supor que os IDs de sistemas diferentes são iguais.
- Conferir soma de itens, arredondamento, moeda e integridade; rejeitar incoerência antes do envio.
- Não mudar automaticamente para status de aprovação, recebimento de estoque ou contas a pagar sem regra aprovada.

### Transferências Lagom → Bling

- Interpretar inicialmente como **transferência física entre depósitos/filiais**, sujeita à confirmação do modelo Lagom e das capacidades reais do Bling.
- Verificar se existe API específica de transferência; se não existir, documentar lacuna e apresentar alternativas técnicas com impactos em saldos, rastreabilidade, natureza fiscal e possibilidade de operação atômica.
- **Proibido** assumir que um pedido de compra ou dois lançamentos de estoque equivalem automaticamente a uma transferência válida.
- Campos mínimos de análise: documento, empresa, depósito origem, depósito destino, SKU, lote/série quando aplicável, quantidade, unidade, data, status e referência logística/fiscal.
- Se a API só permitir dois movimentos separados e houver autorização formal para usá-los, definir ordem, proteção contra duplicação, correção/compensação e estados parciais; manter o fluxo desligado até homologação.

## 9. Frontend Node.js — painel operacional obrigatório

Implementar interface responsiva em **Vue 3 + PrimeVue**, com Node.js no desenvolvimento/build e API/backend Node.js. Navegação em português.

### Telas obrigatórias

1. **Dashboard:** conectividade Lagom/Bling, saúde do worker e do scheduler, última execução e próxima execução de cada job, contadores do dia, sucessos, erros, duração média e documentos pendentes.
2. **Transações:** tabela paginada server-side com data/hora, direção, empresa, tipo (Compra/Transferência/Carga), número/ID origem, ID destino, situação, tentativas, latência e `correlation_id`; filtros por período, texto, status, direção, empresa, entidade e job.
3. **Detalhe da transação:** linha do tempo de tentativas, endpoint/método, status HTTP, validações, campos transformados, request/response **sanitizados**, origem/destino e ação de correção/reprocessamento controlada.
4. **Execuções e agendamentos:** próximas e últimas execuções, duração, volume, checkpoints, lacunas, trava de concorrência, estado habilitado/desabilitado, *dry-run* e disparo manual com confirmação.
5. **Pendências/erros:** lista de rejeições, registros não mapeados, falhas de autenticação, rate limits, dead letters, opção de exportação CSV/Excel sem dados sensíveis.
6. **Mapeamentos:** cadastros de correspondências aprovadas de empresas, depósitos, produtos e fornecedores, com histórico de alterações.
7. **Configuração e saúde:** exibir apenas status mascarado das integrações; iniciar/reautorizar OAuth sem revelar secrets; indicadores de última sincronização por recurso; mostrar endpoints validados e contratos pendentes.

### Comportamento UX

- Tabelas com paginação, ordenação, filtros e exportação; não carregar o log inteiro no navegador.
- Autoatualização via SSE/WebSocket autenticado ou polling com intervalo razoável.
- Semáforo de status acessível (texto + ícone, não depender apenas de cor).
- Solicitar confirmação para reprocessar, pausar, habilitar escrita ou realizar carga completa.
- Proteger ações administrativas por RBAC (mínimo `ADMIN`, `OPERADOR`, `LEITURA`) e manter trilha de auditoria.
- A interface **não pode acessar diretamente** Bling ou Lagom nem exibir `.env`.

### API interna sugerida (rotas do nosso middleware, NÃO endpoints das APIs externas)

```text
GET    /api/health
GET    /api/dashboard/summary
GET    /api/integration/runs
GET    /api/integration/runs/:id
GET    /api/integration/events
GET    /api/integration/events/:id
GET    /api/integration/events/:id/attempts
GET    /api/integration/mappings
GET    /api/integration/jobs
POST   /api/integration/jobs/:name/run      # exige RBAC, confirmação e modo
POST   /api/integration/events/:id/retry   # idempotente e auditado
GET    /api/integrations/bling/oauth/start
GET    /api/integrations/bling/oauth/callback
GET    /api/integration/stream             # SSE autenticado ou alternativa
```

Todas as rotas privadas devem aplicar autenticação, autorização, validação de entrada e paginação.

## 10. Alertas e indicadores

Monitorar:

- Sucesso/falha por direção, entidade e empresa; volume criado/atualizado/ignorado/bloqueado.
- Latência p50/p95, fila acumulada, tempo desde última execução bem-sucedida.
- Pedidos ou transferências sem confirmação no destino dentro do SLA operacional.
- Falhas repetidas de autenticação, rate limit, dados inválidos e mapeamentos inexistentes.
- Divergências de contagem/saldo/documentos detectadas por reconciliação.
- Ausência de execução às 20:00 ou de ciclos a cada 10 minutos.

Alertas devem aparecer no dashboard e log; notificações externas (e-mail etc.) só após canal/credenciais definidos. Não criar serviço externo adicional sem necessidade.

## 11. Testes e critérios de aceite

### Testes obrigatórios

- Unitários: transformações, regras de compra/transferência, valores monetários, timezone, identidade e deduplicação.
- Contrato: schemas reais do Bling e Lagom, *fixtures* anonimizadas, validação de campos/erros.
- Integração: OAuth consentimento/refresh/rotação, paginação, checkpoint, `429`, `401`, `403`, `5xx`, timeout, dados incorretos, conflitos e indisponibilidade.
- Concorrência: duas instâncias de worker, lock, reentrada, retries e reinicialização com job pendente.
- Recuperação: resposta ambígua de POST não deve produzir duplicidade.
- UI: filtros, paginação, detalhe de tentativa, exportação, RBAC e ações auditadas.
- Segurança: `.env` no `.gitignore`, secrets sanitizados, HTTPS, CSRF/OAuth state, autenticação da interface, SQL injection/XSS e validação de entradas.

### Critérios formais de aceite

1. Compras elegíveis do Lagom são corretamente criadas/atualizadas no Bling, **sem duplicação**, em ambiente de testes autorizado.
2. Transferências são processadas somente após confirmar e homologar o mecanismo real suportado pelo Bling; se não houver API adequada, entregar o módulo claramente **BLOQUEADO** com análise técnica e não fingir conclusão.
3. O fluxo Lagom → Bling está agendado a cada **10 minutos**; o fluxo Bling → Lagom está agendado **todos os dias às 20:00 (America/Sao_Paulo)**.
4. Cada execução possui log persistente; cada documento possui histórico de tentativas e correlação completa.
5. Falha de uma transação não impede as demais; falhas recuperáveis não geram duplicidade.
6. O frontend exibe resultados reais da persistência, oferece filtros e detalhe e nunca expõe credenciais.
7. Carga inicial, incrementais, reinício e reprocessamento passam pelos testes de homologação.
8. Nenhuma escrita real em ambiente produtivo é ativada sem a aprovação operacional explícita.

## 12. Plano de execução do Manus

Executar nesta ordem, apresentando evidências objetivas ao final de cada fase:

**Fase 1 — Reconhecimento**

- Inspecionar `~/apps/lagom_bling`, dependências, serviços existentes, `.gitignore`, testes e práticas atuais.
- Confirmar se o repositório remoto existe e está acessível com as permissões disponíveis; se privado, não presumir conteúdo que não foi lido.
- Consultar as duas documentações fixas; localizar OpenAPI e autenticação do Lagom, e Bling OAuth, compras, estoque/transferência, limite e paginação.
- Entregar `docs/api-mapping.md`, `docs/gaps.md` e lista de operações CONFIRMADAS/PENDENTES/BLOQUEADAS.

**Fase 2 — Fundamentos**

- Criar estrutura do monorepo (se não houver estrutura existente), `.env.example`, validação de configuração, Docker Compose, banco e migrations.
- Implementar adapters autenticados, cliente HTTP resiliente, OAuth com refresh, fila, lock e esquema de auditoria.
- Todos os jobs e gravações desligados em desenvolvimento até os testes.

**Fase 3 — Fluxos**

- Implementar compras Lagom → Bling com testes e correspondência de IDs.
- Implementar transferência **apenas** após validação do contrato e da semântica.
- Implementar carga Bling → Lagom somente para os recursos autorizados e confirmados.
- Configurar cron e testes de horários/recuperação.

**Fase 4 — Frontend e observabilidade**

- Construir dashboard PrimeVue, tabela de transações, detalhes, tentativas, jobs, pendências e mapeamentos.
- Adicionar controle de acesso, exportação e métricas operacionais.

**Fase 5 — Homologação e entrega**

- Testar com registros de homologação reais, autorizados e anonimizados na documentação.
- Documentar deploy, configuração OAuth, operação, backup/restore, monitoramento, reprocessamento e rollback.
- Entregar comandos reproduzíveis para subir o projeto e rodar testes.
- Demonstrar ciclos de 10 minutos e execução das 20:00 sem precisar aguardar horário real (teste com relógio simulado e execução manual controlada).

## 13. Entregáveis mínimos

```text
lagom_bling/
├── skill.md                       # esta diretriz permanente
├── .env.example                   # nunca conter segredos reais
├── .gitignore
├── docker-compose.yml
├── README.md
├── docs/
│   ├── api-mapping.md
│   ├── gaps.md
│   ├── architecture.md
│   ├── operations.md
│   └── contracts/                 # schemas permitidos e snapshots versionados
├── apps/
│   ├── api/                       # Node.js + TypeScript + Fastify
│   └── web/                       # Vue 3 + PrimeVue
├── packages/
│   ├── connectors/                # Lagom e Bling
│   ├── integrations/              # casos de uso, DTOs, mapeamentos
│   └── shared/                    # tipos, validações, utilitários
├── workers/                       # filas, jobs, schedulers
├── migrations/
└── tests/
```

Esta estrutura é **referência**, não ordem para reescrever uma aplicação preexistente. Adaptar mantendo funcionalidades que já operam.

## 14. Como o Manus deve reportar resultados

No final de cada entrega, apresentar obrigatoriamente:

1. **Implementado e testado:** arquivos, funções, endpoints e evidência de testes.
2. **Pendente de informação externa:** autenticação/rotas Lagom, recursos de carga, estratégia de transferência e campos não disponíveis.
3. **Bloqueios de negócio:** decisões que poderiam criar movimento indevido ou divergência fiscal/estoque.
4. **Segurança e ambiente:** jobs habilitados ou não, escrita habilitada ou não, credenciais necessárias sem divulgar valores.
5. **Próximos passos verificáveis:** o que executar, como homologar, como auditar e como voltar atrás.

**Não afirmar que a integração está funcionando em produção sem evidência de chamadas reais autorizadas e confirmação do estado de destino. Nunca ativar movimentação de estoque, documentos financeiros ou emissão fiscal como efeito colateral não aprovado.**

## 15. Referências oficiais a acompanhar

- Bling — Referência da API: https://developer.bling.com.br/referencia
- Bling — Autenticação e aplicativos: https://developer.bling.com.br/aplicativos
- Bling — Limites: https://developer.bling.com.br/limites
- Bling — Boas práticas: https://developer.bling.com.br/boas-praticas
- Bling — Changelog: https://developer.bling.com.br/changelogs
- Lagom — Swagger sandbox informado para este projeto: https://beta-api-sandbox.lagomtech.com.br/api#/

**Regra final:** desenvolver uma integração auditável e recuperável, não apenas um script de transferência de dados. Segurança, idempotência, fidelidade aos contratos e visibilidade operacional são requisitos obrigatórios.
