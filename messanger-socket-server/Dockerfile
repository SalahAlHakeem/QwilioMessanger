FROM node
    WORKDIR /messanger-api
    COPY package*.json ./
    RUN npm install
    RUN npm install -g typescript
    COPY . .
    CMD ["npm", "start"]



