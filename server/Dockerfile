FROM node:20-alpine

# Tini reaps zombie processes and forwards signals, so the SIGTERM handling in
# server.js actually fires. Without an init, node runs as PID 1 and receives
# signals with default handlers that skip our graceful shutdown.
RUN apk add --no-cache tini

WORKDIR /app

# Dependencies first, so a code change does not invalidate the install layer.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# The base image ships an unprivileged `node` user. Running as root inside a
# container means a process escape starts with root, for no benefit here.
RUN chown -R node:node /app
USER node

ENV NODE_ENV=production
EXPOSE 5000

# The platform's own health check usually supersedes this, but it makes the
# container self-describing and works with plain `docker run`.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||5000)+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
