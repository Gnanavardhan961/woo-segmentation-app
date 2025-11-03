# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the source
COPY . .

# Expose the port used in index.js
EXPOSE 4001

# Start the app
CMD ["npm", "start"]
