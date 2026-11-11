# Middleware Lagom DRP ↔ Bling

Explorador de todas as consultas GET da Bling: [APIs Bling](http://localhost:5173/bling) — veja [docs/bling-get-explorer.md](docs/bling-get-explorer.md). O painel não pede chave: o proxy (nginx no Docker, Vite em dev) injeta `ADMIN_API_TOKEN` do `.env` nas chamadas `/api`. A API direta na porta 3000 continua exigindo a chave. Ambas as portas escutam só em 127.0.0.1; não exponha o painel na rede sem adicionar login.

Para consultar produtos Bling com a conexão mantida pelo Docker: `docker compose up -d --build` e abra [Produtos](http://localhost:5173/products). A autorização inicial é feita uma vez em Conexões; tokens persistidos são renovados automaticamente. Veja [operação Bling e Docker](docs/bling-oauth.md#docker-consulta-de-produtos-e-conexão-automática). Lagom: [APIs Lagom](http://localhost:5173/lagom) (todas as 35 operações, consultas executáveis) e [Cadastros Bling → Lagom](http://localhost:5173/lagom/compatibilidade) (snapshot, compatibilidade e carga). Escrita no Lagom só com `LAGOM_WRITE_ENABLED=true` — veja [docs/lagom-api.md](docs/lagom-api.md).

Scaffold novo em Node.js/TypeScript para construir um middleware auditável entre o Lagom DRP e o Bling API v3. A árvore foi criada nesta sandbox porque a cópia original não estava disponível; não é uma alteração nem uma sincronização do repositório remoto anterior.

## Estado desta entrega

Inclui monorepo pnpm, API Fastify read-only, painel Vue 3/PrimeVue, worker inerte, contratos de domínio, chave de idempotência, máquina de estados, schema Prisma, migrations e configuração Docker Compose completa para API, interface, worker, PostgreSQL e Redis. O painel não apresenta métricas de negócio fictícias.

**Nenhuma operação real de escrita foi implementada ou executada.** Scheduler e fluxos de integração estão desligados; a API recusa flags activas e o worker permanece ocioso. A transferência nativa entre depósitos no Bling continua bloqueada por falta de endpoint confirmado. Esta base não está pronta para produção.

## Executar tudo em Docker

Requisitos: Docker Engine e Docker Compose v2. Na raiz do projecto:

```bash
cp .env.example .env
docker compose config
docker compose up --build
```

O Compose constrói a imagem Node 22/pnpm, espera PostgreSQL e Redis ficarem saudáveis, aplica migrations com um serviço de execução única e depois inicia API, painel Vue e worker inerte. As portas são limitadas a `127.0.0.1`: painel `http://localhost:5173`, API `http://localhost:3000/api/health`, PostgreSQL `localhost:5432` e Redis `localhost:6379`.

Para acompanhar os serviços: `docker compose ps` e `docker compose logs -f api web worker`. Parar sem apagar dados: `docker compose down`. O banco e Redis usam volumes nomeados persistentes; **não** executar `docker compose down -v` salvo se a eliminação desses dados for pretendida.

O `.env` é usado pelo Compose apenas para interpolação local, está ignorado pelo Git e excluído do contexto Docker. Altere `POSTGRES_PASSWORD` para um valor URL-safe se necessário. As credenciais OAuth Bling podem ser configuradas no `.env` local; não devem ser versionadas nem expostas ao frontend. Consulte [Conexão permanente Bling](docs/bling-oauth.md).

## Executar sem Docker

Com Node.js 22+ e pnpm 11, é possível validar localmente:

```bash
pnpm install
pnpm db:validate
pnpm build
pnpm test
pnpm dev:api
```

Num segundo terminal, executar `pnpm dev:web`. Para aplicar migrations num PostgreSQL local já iniciado, configurar `DATABASE_URL` e executar `pnpm db:migrate:deploy`.

## Estrutura

`apps/api` contém a API Fastify e health check; `apps/worker` arranca inerte; `apps/web` contém o painel Vue/PrimeVue; `packages/domain` contém estados e idempotência; `packages/connectors` publica contratos/guardas; `packages/database` define ports de persistência; `prisma/schema.prisma` é o schema único e `prisma/migrations` é a única localização de migrations.

O mapa externo está em `docs/api-mapping.md`; lacunas em `docs/gaps.md`; arquitectura em `docs/architecture.md`; próximos passos e homologação em `docs/implementation-plan.md` e `docs/homologacao.md`.

## Limites e segurança

Além de `GET /api/health`, a API implementa OAuth Bling e teste de leitura, habilitados por `BLING_OAUTH_ENABLED` e protegidos por chave administrativa. Consulte [operação e configuração](docs/bling-oauth.md). Não há reprocessamento ou sincronização real. O frontend não acede directamente a Lagom/Bling e não exibe credenciais. Não publicar fora do localhost antes de adicionar autenticação, RBAC, política CORS, monitorização e testes de segurança.
