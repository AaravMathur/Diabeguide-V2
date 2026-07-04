FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm
COPY . .
RUN pnpm install --shamefully-hoist
EXPOSE 5173
CMD ["npx", "vite", "--host", "0.0.0.0"]
