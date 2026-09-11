FROM ghcr.io/gitroomhq/postiz-app:v2.23.0
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
ENV NODE_OPTIONS=--max-old-space-size=6144
RUN pnpm run build
RUN tar --exclude=node_modules --exclude=.next --exclude=dist --exclude=.git --exclude=source.tar.gz -czf /tmp/source.tar.gz . && mv /tmp/source.tar.gz apps/frontend/public/source.tar.gz
