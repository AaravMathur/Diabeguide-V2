FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm run build
EXPOSE 5000
CMD ["pnpm", "start"]
