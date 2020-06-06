FROM node:latest

RUN npm config set user root
RUN npm i -g @streamrail/dsui

EXPOSE 3000

ENTRYPOINT [ "dsui" ]