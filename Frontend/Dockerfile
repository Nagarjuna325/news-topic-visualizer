# Stage 1: Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY Frontend/package*.json ./

# Install dependencies
RUN npm ci 

# Copy source code
COPY Frontend/ .


# Build the application
RUN npm run build

# Stage 2: Production stage with Nginx
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration

COPY Frontend/nginx.conf.template /etc/nginx/templates/default.conf.template

# Expose port
EXPOSE 80


# Start nginx
CMD ["nginx", "-g", "daemon off;"]