FROM node:7-alpine
RUN mkdir app
WORKDIR app

COPY package.json /src/app/package.json

RUN npm install

COPY . /app

EXPOSE 3000

CMD ["node","index.js"]
