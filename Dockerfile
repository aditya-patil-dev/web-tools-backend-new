# Step 1: Build stage
FROM node:20-slim AS builder

# Install build dependencies for native C/C++ Node.js modules (canvas, sharp, qpdf)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    qpdf \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy TypeScript configuration and source code
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to /app/build
RUN npm run build

# Step 2: Production runtime stage
FROM node:20-slim AS runner

# Install runtime shared libraries for native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    qpdf \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy package manifests
COPY package*.json ./

# Copy pre-built node_modules directly from builder to preserve compiled native binaries
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled JavaScript build & source directory
COPY --from=builder /app/build ./build
COPY --from=builder /app/src ./src

# Ensure local uploads directory exists
RUN mkdir -p /app/uploads

# Expose container port
EXPOSE 8080

# Start server
CMD ["node", "build/server.js"]
