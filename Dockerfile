# use the official node image as a base image
FROM node:latest

# set the working directory in the container
WORKDIR /usr/src/app

# copy the package.json file to the working directory
COPY package*.json ./

# install the dependencies
RUN npm install

# copy rest of the files to the working directory
COPY . .

# expose the port 3000 on which our app will run
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "start"]
