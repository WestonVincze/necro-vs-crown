FROM node:22 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PORT=2567
RUN corepack enable
WORKDIR /app
# COPY .npmrc .npmrc

FROM base AS build
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# COPY . .
COPY packages/shared/              ./packages/shared/
COPY packages/server/              ./packages/server/

# RUN pnpm run -r build
RUN pnpm --filter @necro-crown/shared build
RUN pnpm --filter @necro-crown/server build
RUN pnpm deploy --filter @necro-crown/server --prod /app/server

FROM base AS server
WORKDIR /app
COPY --from=build /app/server .
COPY --from=build /app/packages/shared/dist ./node_modules/@necro-crown/shared/dist
COPY --from=build /app/packages/shared/node_modules ./node_modules/@necro-crown/shared/node_modules
EXPOSE 2567
CMD ["node", "build/index.js"]
 
# ENV PORT=2567

# RUN npm install -g pnpm
# WORKDIR /app

# COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
# COPY packages/shared/package.json ./packages/shared/
# COPY packages/server/package.json ./packages/server/

# # install deps (hoisted layout)
# RUN pnpm install
# RUN pnpm --filter @necro-crown/shared build
# RUN pnpm --filter @necro-crown/server build

# COPY . .
 
# EXPOSE 2567
 
# CMD [ "npm", "run", "server:start" ]