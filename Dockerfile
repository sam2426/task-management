FROM node

WORKDIR /app

COPY package*.json /app

RUN npm install

COPY . /app

EXPOSE 3000

ENV jwtSecret=kjdnfaljnsaknsdansd

CMD [ "npm", "run", "dpl" ]