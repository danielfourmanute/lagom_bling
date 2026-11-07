# Conexão permanente com a Bling

A API agora implementa OAuth Authorization Code, persistência no PostgreSQL com AES-256-GCM, renovação automática e teste de leitura de produtos. Não implementa sincronização de documentos nem ativa as flags de escrita.

## Uso local

O `.env` local já contém as credenciais informadas e chaves administrativas/criptográficas geradas sem exibição em logs. Não versionar esse arquivo. Guarde uma cópia segura de `TOKEN_ENCRYPTION_KEY`: perdê-la impede a leitura dos tokens persistidos. `ADMIN_API_TOKEN` protege as operações administrativas e é informado na tela Conexões; nunca compartilhe essa chave com usuários comuns.

```bash
corepack pnpm install
corepack pnpm db:generate
docker compose up -d postgres
corepack pnpm db:migrate:deploy
corepack pnpm dev:api
# Em outro terminal:
corepack pnpm dev:web
```

Abra http://localhost:5173, entre em Conexões, informe `ADMIN_API_TOKEN` do `.env` e clique em Conectar Bling. Abra o link mostrado em outra aba e autorize a aplicação.

Enquanto o domínio cadastrado ainda não encaminha o callback para esta API, copie a URL de retorno e cole no painel local; clique em Concluir autorização em até 30 segundos. A URL não é acessada pelo servidor: ele valida o endereço e usa apenas o código e o state. Essa etapa exige a mesma aba/navegador que iniciou a conexão, pois também valida um cookie HttpOnly. Depois clique em Testar conexão. Os tokens ficam no banco, não na memória do script Python. O script anterior permanece apenas como diagnóstico isolado.

## Retorno automático em produção

É necessário publicar a API e o painel no mesmo domínio HTTPS. Recomenda-se cadastrar na aplicação Bling `https://fourmanute.com.br/api/bling/callback` e definir exatamente o mesmo valor em `BLING_REDIRECT_URI`, reiniciando a API. O proxy deve encaminhar `/api/` à API, preservando cookies e query strings. Com isso, basta autorizar na Bling; não será necessário copiar a URL.

O callback atual na raiz (`https://fourmanute.com.br/?env=production`) é suportado pelo backend, mas exige que o proxy encaminhe essa requisição à API. Como a raiz normalmente atende o frontend/site, a rota específica `/api/bling/callback` evita conflito. A alteração no cadastro Bling e a publicação do domínio não foram feitas por este código.

Em desenvolvimento também é possível cadastrar `http://localhost:5173/api/bling/callback` na Bling, se aceito pelo cadastro, e ajustar o `.env` para esse endereço. O proxy Vite já encaminha `/api/` à API. Não basta alterar somente o `.env`: a Bling usa o callback cadastrado no aplicativo.

Use `NODE_ENV=production` na API publicada; os cookies OAuth terão Secure. Restrinja o painel administrativo e mantenha a chave administrativa apenas com operadores autorizados. Não registre query strings dos callbacks nem corpos das requisições de conclusão no proxy/APM. A API desabilita os logs automáticos das requisições e não registra payloads externos. A chave administrativa é um controle inicial de acesso único; não substitui autenticação individual/RBAC para um painel com vários usuários. Esta implementação é para uma conta Bling (`accountKey=default`); não conectar várias empresas nesta instalação.

## Operação diária

- A API em execução verifica a conexão a cada minuto e renova quando faltam dois minutos ou menos para a expiração calculada por `expires_in`.
- Antes de uma leitura também verifica o token. Não solicita um token novo para cada chamada.
- Uma transação com advisory lock PostgreSQL serializa conexão/renovação entre instâncias. As duas credenciais retornadas são salvas juntas e criptografadas.
- Reiniciar a API preserva a conexão. Ao voltar, o próximo ciclo ou leitura renova o acesso se necessário.
- Refresh inválido marca EXPIRED e pede reconexão. Falhas temporárias preservam os tokens e são tentadas novamente no ciclo seguinte.
- Uma leitura que recebe 401 força uma renovação e é repetida apenas uma vez. Falta de permissão para produtos e limites da API são informados sem expor dados da conta.
- A API deve permanecer rodando. Após parada longa suficiente para expirar o refresh token, será necessária nova autorização. Não há garantia de conexão eterna.
- O worker de sincronização continua inerte. Futuras rotinas devem reutilizar o gerenciador de conexão e implementar controle global de quota; o teste de conexão não é um conector de sincronização.

## Rotas

| Rota | Proteção | Finalidade |
|---|---|---|
| POST `/api/bling/connect` | Bearer administrativo | Gera state de uso único com validade de dez minutos e cookie de sessão |
| GET callback configurado | State e cookie | Troca o código por tokens sem intervenção manual |
| POST `/api/bling/complete` | Bearer, state e cookie | Conclui pelo painel local com `{ "callbackUrl": "..." }` |
| GET `/api/bling/status` | Bearer administrativo | Retorna estado e datas; nunca tokens |
| POST `/api/bling/test` | Bearer administrativo | Consulta um produto e retorna somente resultado HTTP |

## Verificação

Os testes de integração usam um banco **exclusivo de teste** indicado por `TEST_DATABASE_URL`; apagam conexões OAuth nesse banco. Nunca apontar essa variável para o banco real. Aplique as migrações nesse banco antes da execução. Sem a variável, os testes PostgreSQL são ignorados.

```bash
# Após criar um banco dedicado e aplicar as migrações nele:
TEST_DATABASE_URL=postgresql://app:change_me@localhost:5432/bling_oauth_test corepack pnpm test
corepack pnpm build
```

Os testes simulam o servidor Bling e usam PostgreSQL real para verificar criptografia, persistência, expiração, replay, vinculação ao navegador, renovação concorrente, rotação, falhas e autorização de rotas. A validação da conta real requer que o titular autorize o aplicativo.

Referências: [OAuth Bling](https://developer.bling.com.br/aplicativos), [boas práticas](https://developer.bling.com.br/boas-praticas), [limites](https://developer.bling.com.br/limites).

## Docker: consulta de produtos e conexão automática

```bash
docker compose up -d --build
```

Esse é o comando único para a operação normal. O Compose sobe PostgreSQL, aplica as migrações, inicia a API compilada e serve o frontend compilado via Nginx. Não depende de `pnpm dev` no host. Redis e worker Lagom ficam no perfil opcional `lagom` e não sobem por padrão.

Abra http://localhost:5173/products. Informe a chave administrativa do `.env`. A tela consulta os produtos diretamente na Bling pelo backend e permite filtros por nome e código/SKU, páginas de 25/50/100 registros e navegação entre páginas. Mostra nome, ID, SKU, unidade, preço e situação. A chave é compartilhada em memória com a tela Conexões, sem armazenamento persistente no navegador. Não há gravação de produtos nem dependência da Lagom.

Ao iniciar/reiniciar, a API recupera a conexão persistida e verifica o token imediatamente; continua verificando a cada minuto. A expiração também é verificada antes de cada consulta. A renovação usa o refresh token salvo e não precisa de login diário. O volume `postgres-data` e `TOKEN_ENCRYPTION_KEY` precisam ser preservados: não use `docker compose down -v` se quiser manter a autorização.

O Docker **não substitui o consentimento inicial** na conta Bling. Se ainda não há tokens válidos, use Conexões uma vez para autorizar. O callback automático funciona quando o endereço cadastrado na Bling chega a esse Nginx/API no mesmo domínio do painel. Nginx encaminha `/api/bling/callback` e também o callback na raiz com `state`, mantendo compatibilidade com o cadastro atual. O DNS/proxy HTTPS do domínio não é configurado pelo Compose local. Sem esse encaminhamento, use a conclusão local por URL descrita acima.

O painel publica somente em `127.0.0.1` por padrão. Para uso no domínio cadastrado, coloque um proxy HTTPS à frente desse serviço e acesse o painel por esse domínio; configure `NODE_ENV=production` no `.env` nessa instalação. Os cookies de autorização são vinculados ao navegador/domínio que iniciou a conexão.

Rotas de consulta: `GET /api/bling/products?pagina=1&limite=25&nome=...&codigo=...`, protegida pela mesma chave administrativa. A API valida filtros e retorna somente os campos usados na tela. `hasMore` indica página cheia; como a resposta não fornece um total geral, a próxima página pode estar vazia. Falhas não disparam tentativas ilimitadas.

Para acompanhar os serviços:

```bash
docker compose ps
docker compose logs --tail=50 api
```

`migrate` terminar com código zero é esperado. API, web e PostgreSQL devem permanecer saudáveis. O frontend tem healthcheck próprio. A sincronização Lagom fica para uma fase posterior.
