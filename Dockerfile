# Stage 1: Build Stage
FROM node:22-slim AS build

# Set the working directory
WORKDIR /app

# Copy only package files for dependency installation
COPY package*.json tsconfig.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate Prisma client (if Prisma is used)
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

# Stage 2: Production Runtime Stage
FROM node:22-slim

# Set the working directory
WORKDIR /app

# Copy only production dependencies from the build stage
COPY package*.json ./
RUN npm ci --only=production

# Copy the built application from the build stage
COPY --from=build /app/dist ./dist

# Copy Prisma schema and other necessary files (if needed)
COPY --from=build /app/prisma ./prisma

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]