FROM node:18-alpine
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
# Build the Next.js production app so `npm start` can serve it
RUN npm run build
EXPOSE 3000
CMD ["npm","run","start"]
