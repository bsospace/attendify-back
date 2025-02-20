# Use an official Node.js runtime as the base image
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Prisma Client generates a Node.js client for the Prisma API. It is used to access the database in the application code.
RUN npm run prisma:generate

# Build the TypeScript code
RUN npm run build

# Start the application
CMD ["npm", "start"]
