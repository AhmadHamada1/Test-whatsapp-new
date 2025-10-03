# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install all dependencies (make sure dotenv is in "dependencies")
RUN npm install --legacy-peer-deps

# Copy source code into container
COPY . .

# Expose the app port
EXPOSE 6662

# Start the app
CMD ["npm", "start"]
