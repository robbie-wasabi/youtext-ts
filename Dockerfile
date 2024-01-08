# Dockerfile

# Use the official Node image as the base image
FROM node

# Set the working directory in the container
WORKDIR /app

# Copy packageon and package-lockon to the working directory
COPY package*on ./

# Install the required dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the API port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
