# Multi-stage production Build for Rythu Sethu
# Stage 1: Build the React client & compile the Express server with esbuild
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy full application code
COPY . .

# Run build script (`vite build` + `esbuild server.ts --bundle`)
RUN npm run build

# Stage 2: Clean, ultra-lightweight production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Force bind application server on port 3000 as required by ingress routing
ENV PORT=3000

COPY package*.json ./
# Only install production dependencies for minimum attack vector & size
RUN npm ci --only=production

# Copy compiled source artifacts from builders stage
COPY --from=builder /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Start command
CMD ["npm", "run", "start"]