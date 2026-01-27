FROM node:18-alpine

WORKDIR /app

#copy package files
COPY package*.json ./

#install dependencies
RUN npm install

#copy application code
COPY . .

#expose the port your app runs on
EXPOSE 3000

#start the application
CMD ["node", "app.js"]