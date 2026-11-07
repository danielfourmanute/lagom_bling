# Segurança e operação

## Estado actual

O health check (`GET /api/health`) é a única rota HTTP exposta. Não existem rotas de escrita, execução manual, reprocessamento, OAuth callback ou consulta de dados de negócio. O painel comunica apenas com a API interna pelo proxy Vite.

As flags `SCHEDULER_ENABLED`, `WRITE_ENABLED`, `LAGOM_TO_BLING_ENABLED` e `BLING_TO_LAGOM_ENABLED` têm default `false`; a configuração da API recusa o arranque se qualquer uma estiver activa porque o scaffold ainda não implementa os controlos necessários. O worker não regista filas. Não executar carga retroactiva nem chamar endpoints externos.

## Credenciais e tokens

`.env` e `.env.*` são ignorados pelo Git e pelo Docker build; versionar apenas `.env.example`. Não imprimir variáveis de ambiente, authorization headers, passwords, client secrets, access tokens ou refresh tokens. Pino tem redacção de campos comuns e request logging desactivado. Quando OAuth for implementado, guardar tokens cifrados no banco/secret store, proteger a chave fora do repositório, serializar refresh por conta e nunca os enviar ao browser.

## Antes de expor o painel

Implementar autenticação, RBAC (`ADMIN`, `OPERADOR`, `LEITURA`), CSRF/state de OAuth, validação de entrada, paginação server-side, exportação sanitizada e auditoria das acções administrativas. Configurar HTTPS e política de origem/CORS específica. A interface actual é local/dev e não deve ser publicada em ambiente partilhado.

## Retenção e auditoria

Persistir eventos críticos no PostgreSQL. Guardar apenas payloads sanitizados ou hashes; limitar campos pessoais/fiscais e estabelecer retenção antes de homologação. Separar logs operacionais de auditoria imutável.