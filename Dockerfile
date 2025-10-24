FROM node:22.14.0

WORKDIR /app

RUN npm install -g npm@latest

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "start:dev", "--", "--host", "0.0.0.0"]
