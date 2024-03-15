# Release

Find the lasted release [here](https://github.com/Joystream/joystream/releases)


# Setup 
## Option 1 - Docker 

```
$ cd ~/
$ mkdir joystream-node
$ cd joystream-node
$ wget https://github.com/Joystream/joystream/releases/download/v12.1000.0/joy-mainnet.json
$ cd ~/joystream
```

Edit service joystream-node
```
$ vim docker-compose.yml
# make sure all your containers are using the same network
-----
  joystream-node:
    image: joystream/node:latest
    restart: unless-stopped
    container_name: joystream-node
    volumes:
      - /root/joystream-node:/chain
    command: >
      --pruning archive
      --validator
      --unsafe-ws-external
      --unsafe-rpc-external
      --rpc-methods Safe
      --rpc-cors all
      --base-path /chain
      --chain joy-mainnet.json
      --prometheus-port 9615
      --prometheus-external
      --name COOL-NAME
    expose:
      - 9615
    ports:
      - "127.0.0.1:9944:9944"
      - "127.0.0.1:9933:9933"
      - 30333:30333
```
> create the dictories in the volumes if needed.

Spin the container up

```
$ docker-compose up --detach --build joystream-node
```

### Test and troubleshoot 

```
$ docker logs -f -n 10 joystream-node
```


Make sure your containers running on the same network
```
$ docker network ls
$ docker network inspect <network name>
```

