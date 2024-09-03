# Use the official Node.js image
FROM node:20-alpine

# Create and set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

RUN chmod 755 db/*
# Expose the port the app runs on
EXPOSE 5001

# Command to run the application
CMD ["npm", "start"]
