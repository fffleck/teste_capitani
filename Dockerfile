FROM --platform=linux/amd64 node:20 AS builder

WORKDIR /app

# Install OpenSSL required for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Copy ALL CODE including prisma/schema.prisma BEFORE installing
COPY package*.json ./
COPY prisma ./prisma

RUN npm install

# NOW we can generate the prisma client (since schema exists)
RUN npx prisma generate

COPY . .

RUN npm run build



# ---- PRODUCTION IMAGE -----
FROM --platform=linux/amd64 node:20

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
