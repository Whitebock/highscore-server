FROM node:10
ENV PORT 80
ENV TOKEN "default-token"

COPY . /app
WORKDIR /app
RUN mkdir /app/data
VOLUME [ "/app/data" ]

EXPOSE ${PORT}
RUN npm install && npm run build
CMD [ "npm", "start" ]