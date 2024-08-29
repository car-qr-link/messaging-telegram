# Stage 1: Build
FROM node:20 AS build

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Run
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy only the necessary files from the build stage
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/dist ./dist

# Install only production dependencies
RUN npm install --omit=dev

# Expose the port the app runs on
EXPOSE 3000

# Define environment variables
ENV NODE_ENV=production
ENV BROKER_URL=redis://localhost:6379/0
ENV SEND_QUEUE=messages:send:sms
ENV RECEIVE_QUEUE=messages:received
ENV GATEWAY_URL=https://sms.capcom.me/api/3rdparty/v1/
ENV WEBHOOK_PORT=3000

# Start the app
CMD ["node", "dist/index.js"]
