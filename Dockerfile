FROM node:22.14.0

WORKDIR /app

RUN npm install -g npm@latest

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5173

ENV HOST=0.0.0.0
ENV PORT=5173

CMD ["npm", "run", "start"]