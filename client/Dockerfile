FROM node:18

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

# Use a lightweight static file server for the built site
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]