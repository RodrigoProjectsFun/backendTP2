# Stage 1: Build the frontend
FROM node:18 as build-frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# Stage 2: Build the backend
FROM node:18

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .

# Remove any existing frontend/dist directory
RUN rm -rf ./frontend/dist

# Copy built frontend from previous stage
COPY --from=build-frontend /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 4000

# Start the server
CMD ["node", "index.js"]
