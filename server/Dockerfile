# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR app
# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./
# Install PM2 globally and other dependencies
RUN npm install

# Copy the source code into the container
COPY . .
# Run the build script (compile TypeScript files)
# Expose the application port (e.g., 6000)
EXPOSE 6662
# Start the application using the start:build script
CMD ["npm", "run", "dev"]
