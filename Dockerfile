FROM node:14

# Specify working directory
WORKDIR /usr/src/app

# Copy package.json AND package-lock.json
COPY package*.json ./

# Install npm dependencies
RUN npm install

COPY . .

CMD [ "npm", "run", "start" ]