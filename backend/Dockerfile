FROM node:18-bullseye
WORKDIR /usr/src/app

# Install dependencies needed by Prisma
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates bash && rm -rf /var/lib/apt/lists/*

COPY package.json.prisma package-lock.json* ./
# Ensure we use the Prisma-enabled package manifest during image build
RUN mv package.json.prisma package.json
RUN npm install
COPY . .

# Generate Prisma client if schema present (fail build if generation fails)
RUN if [ -f prisma/schema.prisma ]; then npx prisma generate; fi

EXPOSE 4000
CMD ["node","src/index-final.js"]
