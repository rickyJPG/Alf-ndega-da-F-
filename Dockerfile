# ====================================================================
#  Portal do Município de Alfândega da Fé
#
#  Imagem para alojar o portal num servidor. Em três andares, para que
#  a imagem final leve só o que corre — nem o código-fonte, nem as
#  ferramentas de compilação, nem as dependências de desenvolvimento.
# ====================================================================

# --- 1. Dependências --------------------------------------------------
FROM node:22-alpine AS dependencias
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- 2. Compilação ----------------------------------------------------
FROM node:22-alpine AS compilacao
WORKDIR /app
COPY --from=dependencias /app/node_modules ./node_modules
COPY . .

# Os segredos verdadeiros entram só no arranque, por variáveis de
# ambiente. Aqui basta um valor qualquer para a compilação correr.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- 3. Execução ------------------------------------------------------
FROM node:22-alpine AS execucao
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Utilizador sem privilégios: se alguém encontrar forma de executar
# código através do portal, encontra-o com o mínimo de poder possível.
RUN addgroup -g 1001 -S portal && adduser -u 1001 -S portal -G portal

COPY --from=compilacao /app/public ./public
COPY --from=compilacao /app/.next ./.next
COPY --from=compilacao /app/node_modules ./node_modules
COPY --from=compilacao /app/package.json ./package.json
COPY --from=compilacao /app/scripts ./scripts

# Cópia de referência das imagens que vêm com o portal. O arranque
# usa-a para repor no volume o que lá faltar — ver
# scripts/arrancar-contentor.sh.
RUN cp -r /app/public/images /app/imagens-base

# As duas pastas onde o painel escreve. Têm de pertencer ao utilizador
# do serviço, senão o portal arranca mas publicar falha.
RUN mkdir -p /app/conteudo /app/public/images \
    && chmod +x /app/scripts/arrancar-contentor.sh \
    && chown -R portal:portal /app/conteudo /app/public/images /app/.next

USER portal
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
    CMD node -e "fetch('http://127.0.0.1:3000/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/app/scripts/arrancar-contentor.sh"]
CMD ["npx", "next", "start"]
