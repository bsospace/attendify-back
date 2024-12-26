# Stage 1: Build Stage
FROM node:20-alpine3.17 AS build

# Set the working directory
WORKDIR /app

# Copy only package files for dependency installation
COPY package*.json tsconfig.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Production Runtime Stage
FROM node:20-alpine3.17

# Set the working directory
WORKDIR /app

# Copy only production dependencies from the build stage
COPY package*.json ./
RUN npm ci --only=production

# Copy the built application from the build stage
COPY --from=build /app/dist ./dist

# Copy Prisma schema and other necessary files (if needed)
COPY --from=build /app/prisma ./prisma

# Generate Prisma client (if Prisma is used)
RUN npx prisma generate

# Start the application
CMD ["npm", "run", "start"]