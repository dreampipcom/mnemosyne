FROM node:10.12.0-alpine

# add bash
RUN apk update
RUN apk upgrade
RUN apk add bash
RUN apk add busybox-extras

WORKDIR /app
COPY package.json /app
# https://stackoverflow.com/a/32785014/232619
COPY . /app
RUN npm install
RUN npm install bcryptjs pm2 -g
COPY ./docker/wait-for-it.sh /usr/local
RUN chmod +x /usr/local/wait-for-it.sh

EXPOSE 3000

CMD ["npm", "start"]

