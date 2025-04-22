# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies using npm ci for clean install
RUN npm ci --only=production

# Set environment to production
ENV NODE_ENV=production

# Copy the rest of the application code
COPY . .

# Copy .env if present (optional, will not fail if missing)
COPY .env .

# Expose the port (change if your app uses a different port)
EXPOSE 3000

# Healthcheck for container (optional, adjust path as needed)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the server
CMD ["node", "server/server.js"]
