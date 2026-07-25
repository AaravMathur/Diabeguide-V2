FROM node:20-alpine

WORKDIR /app/backend

# Copy backend dependencies
COPY backend/package.json ./

# Install backend dependencies
RUN npm install

# Copy backend source code & config
COPY backend/ ./

# Compile TypeScript code to dist/
RUN npm run build

ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "dist/server.js"]

