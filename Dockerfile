FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm ci --only=production --silent && npm cache clean --force

COPY . .

RUN rm -rf tests/ docs/ *.md .git .gitignore

FROM node:18-alpine AS production

RUN addgroup -g 1001 -S nodejs && adduser -S lmsapp -u 1001

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY --from=builder --chown=lmsapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=lmsapp:nodejs /app/src ./src
COPY --from=builder --chown=lmsapp:nodejs /app/package*.json ./
COPY --from=builder --chown=lmsapp:nodejs /app/server.js ./

RUN mkdir -p uploads logs && chown -R lmsapp:nodejs uploads logs

ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_LEVEL=info

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { \
        if (res.statusCode === 200) process.exit(0); else process.exit(1); \
    }).on('error', () => process.exit(1))"

USER lmsapp

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]


