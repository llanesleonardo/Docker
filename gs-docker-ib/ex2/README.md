# HOW YO RUN IT ON YOU COMPUTER

## YOU HAVE TO DOWNLOAD DOCKER

- Go to docker webpage https://docs.docker.com/desktop/install/windows-install/
- Download Docker Desktop fro Windows
- Activate WSL2 (Read th system requirements)
- Start Docker Desktop

## Apply these commands

- Create two volumes for mongo database, one for data another for configs.

```
docker volume create mongodb
docker volume create mongodb_config

```

- Create a network to allow volumes and containers to communicate with each other.

```

docker network create mongodb

```

- Create two containers running mongo image one for configs, another for databases

```
docker run -it --rm -d -v mongodb:/data/db -v mongodb_config:/data/configdb -p 27017:27017 --network mongodb --name mongodb mongo

```

- const database = require( 'ronin-database' ) this will be the package that will allow you to connect node.js to mongodb

```
npm install ronin-database
```

- re build the docker image (You can name it differently if you want it to)

```
 docker build --tag node-docker .
```

- Then, run the node.js docker container attaching it to mongodb network and assign it a port, in this case port 8000 and a CONNECTIONSTRING that is an enviromental variable and its value is an standard value from the mongodb.

```
docker run   -it --rm -d   --network mongodb   --name rest-server   -p 8000:8000   -e CONNECTIONSTRING=mongodb://mongodb:27017/notes node-docker
```

- node-docker is the name of the image but you can name it whatever you want it to.
