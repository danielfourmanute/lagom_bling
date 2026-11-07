FROM node:22-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache openssl && corepack enable && corepack prepare pnpm@11.25.0 --activate
COPY . .
RUN pnpm install --frozen-lockfile \
    && pnpm db:generate \
    && pnpm build \
    && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]

FROM nginx:1.28-alpine AS web
# O entrypoint do nginx gera conf.d/default.conf a partir do template (envsubst).
RUN rm -f /etc/nginx/conf.d/default.conf
COPY infra/docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=runtime /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
