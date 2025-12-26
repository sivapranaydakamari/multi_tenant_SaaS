FROM node:18-alpine

RUN apk add --no-cache postgresql-client netcat-openbsd

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x scripts/start.sh

ENV NODE_ENV=production
EXPOSE 5000

CMD ["sh", "scripts/start.sh"]
