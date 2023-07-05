# USE OF DOCKER COMPOSE

## Docker compose

This is a file that can contains one or more services. These services have to be set up by writing them with specific tabs and spaces and group all the parameters need it by docker run commands to initiate a container.

This file is very convenient because it will make your execution commands shorter and simple.

### Example of a docker compose file

```
version: "3.8"

services:
  notes:
    build:
      context: .
    ports:
      - 8000:8000
      - 9229:9229
    environment:
      - SERVER_PORT=8000
      - CONNECTIONSTRING=mongodb://mongo:27017/notes
    volumes:
      - ./:/ex3
      - /ex3/node_modules
    command: npm run debug

  mongo:
    image: mongo
    ports:
      - 27017:27017
    volumes:
      - mongodb:/data/db
      - mongodb_config:/data/configdb
volumes:
  mongodb:
  mongodb_config:

```

as we can see we assigned ports, images, volumes, enviromentals variables and commands to each service, also this file is reusable in any situation.

## Testing our application

After creating our new container we should test it. We can do this task at least in two ways.

- Debugging
- Using a library

If we want to debug our application we have to update package.json file adding a new script and installing nodemon package.

```
  "debug": "nodemon --inspect=0.0.0.0:9229 index.js"

    npm install nodemon

```

Because we modify the file package.json we have to build our image and services one more time. This is a must because the file package.json and package-lock.json are cached in the docker system. IF we do not build the Docker image (Dockerfile) again we will have errors because we are going to be using an old version of the file.

```
docker compose -f docker-compose.dev.yml up --build
```

We could curl our application like this:

```
curl --request GET --url http://localhost:8000/notes
```

And if we want to see the debugging process with a graphical interface on Chrome, you can red more about it here: https://docs.docker.com/language/nodejs/develop/

Chrome has a dedicated tool for Node.

## Using a framework to test your application

We can install any framework you want, but in this docs we are going to install Mocha as a developement dependency.

```
npm install --save-dev mocha

```

After this action we have to update our package.json and build our docker image again.

```
{
...
  "scripts": {
    "test": "mocha ./**/*.js",
    "start": "nodemon --inspect=0.0.0.0:9229 server.js"
  },
...
}
```

Then we have to run our docker compose, the new thing here is the commands after the name of the docker compose file, "npm run notes npm run test".

- notes -> is the node service
- run test -> is how you run the script inside package.json to test your app with Mocha.

The terminal will show something similar as this:

```
docker compose -f docker-compose.dev.yml run notes npm run test
Creating node-docker_notes_run ...

> node-docker@1.0.0 test /ex3 (the name of your folder app)
> mocha ./**/*.js



  Array
    #indexOf()
      ✓ should return -1 when the value is not present


  1 passing (11ms)
```

Sometimes you would like to include these types of unit tests into your image, this could be because you want to run them automatically and focus on others value task.

This seems like a good practice and you can do it like this:

```
# syntax=docker/dockerfile:1

FROM node:18-alpine
ENV NODE_ENV=production

WORKDIR /ex2 (the name of your folder app)

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --include=dev (This includes devDependencies)

COPY . .

CMD ["node", "index.js"]

```

To run this new image with docker compose you just have to include the command --build to the last docker compose command

```
docker compose -f docker-compose.dev.yml run --build notes npm run test
```

There is another way to do these more efficient. You can create a one image that includes the two situations for developement and production. In this case you have to assign an alias to the base image, this action makes possible the communication between more than one stage (Multistage) inside Docker images.

```
# syntax=docker/dockerfile:1
FROM node:18-alpine as base

WORKDIR /ex3 (the name of your folder app)

COPY package.json package.json
COPY package-lock.json package-lock.json

FROM base as test
RUN npm ci
COPY . .
CMD ["npm", "run", "test"]

FROM base as prod
RUN npm ci --production
COPY . .
CMD ["node", "index.js"]
```

as you can see in the example, we assigned a name to the base image, then
as we continue in each stage we have to assign the previous name "base" as
"test" or as "production", the previous names can be others but these names are self explanatories.

Another thing that we changed was the command RUN npm, we add a "ci" command. This "ci" command stands for "clean install", it install package from the package-lock.json file.

Some reason we have to use ci in some cases:

- Cosistency: same exact dependencies and version installed.
- Speed: it is much faster than "npm install"
- Predictability: it does not include any additional updates and modifications.
- Automation: is used in automated enviroments such as continuous integration and deployment pipelines.

Then, we build the image test stage only:

```
docker build -t docker-ex3 --target test .

```

After built hte image we run it:

```
docker run -it --rm -p 8000:8000 docker-ex3

> docker-ex3 test /ex3 (the name of your folder app)
> mocha ./**/*.js



  Array
    #indexOf()
      ✓ should return -1 when the value is not present


  1 passing (12ms)
```

Right now, we improved very much our way to automatically run some tests.
We can improve little bit more this process by including in our image the command RUN instead of CMD.

This command actually run the tests when building the image.

```
# syntax=docker/dockerfile:1
FROM node:18-alpine as base

WORKDIR /ex3 (the name of your folder app)

COPY package.json package.json
COPY package-lock.json package-lock.json

FROM base as test
RUN npm ci
COPY . .
RUN npm run test

FROM base as prod
RUN npm ci --production
COPY . .
CMD ["node", "index.js"]
```

You can build this image as you are doing it with the previous images.
