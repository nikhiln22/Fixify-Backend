# 1. Base image
FROM node:18

# 2. Working directory
WORKDIR /app

# 3. Copy only package.json files
COPY package*.json ./

# 4. Install dependencies (production by default)
RUN npm install --legacy-peer-deps

# 5. Copy source code
COPY . .

# 6. Build TypeScript
RUN npm run build

# 7. Expose backend port
EXPOSE 3000

# 8. Start server (runs dist/server.js)
CMD ["npm", "start"]
