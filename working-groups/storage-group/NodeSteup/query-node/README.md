
# Overview

The following assumptions apply:
1. You are `root`, and [cloning](#clone-the-repo) to `~/joystream`
2. in most cases, you will want to run your own `joystream-node` on the same device, and this guide assumes you are.

For instructions on how to set this up, go [here](../joystream-node/README.md). Note that you can disregard all the parts about keys before applying, and just install the software so it is ready to go. You do need to run with `--pruning=archive` though, and be synced past the blockheight you are exporting the db from.

## Get Started
You don't need to host your query-node, but if you're connecting to your own node, docker will not "find" it on localhost. So first, go to [Setup Hosting](../hosting/README.md).

### Install Docker
```
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
sudo echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### Install a Newer Version of `docker-compose`
The package manager `apt-get` installs an old version of `docker-compose`, that doesn't take the `.env` file format we have used. We recommend removing the old one, and install the new one, with:

```
$docker-compose version
# if you see `1.29.2` skip to Deploy
$ cd ~/
$ apt-get remove docker-compose
$ curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
$ chmod +x /usr/local/bin/docker-compose
$ ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

### Clone the Repo
If you haven't already, clone the `Joystream/joystream` (mono)repo:

```
$ git clone https://github.com/Joystream/joystream.git
$ cd joystream
$ ./setup.sh
# this requires you to start a new session. if you are using a vps:
$ exit
#
# Login back again
$ cd joystream
$ ./build-packages.sh
```
The last command will take a while...




### Deploy

#### Set the Environment
This change is needed only if you have your joystream node running as a service.
If your joystream node running as docker skip this section
```
$ cd ~/joystream
$ nano .env
# Change to make, where "old" line is commented out:
---
#JOYSTREAM_NODE_WS=ws://joystream-node:9944/
JOYSTREAM_NODE_WS=wss://<your.cool.url>/rpc
```

#### Deploy - Easy
Assuming you installed the newer version of [docker-compose](#install-a-newer-version-of-docker-compose):
```
$ cd ~/joystream
$ query-node/start.sh
```
And you should be done!

Go and [confirm everything is working](#confirm-everything-is-working)



  
#### Deploy - Elaborate
<details>
  <summary>Elaborate</summary>
  
If you want to use a version of `docker-compose` older than 1.29.0:

First, you need to edit the `.env` file some more:
```
$ cd ~/joystream
$ nano .env
# Change to make, where "old" line is commented out:
---
#COLOSSUS_QUERY_NODE_URL=http://graphql-server:${GRAPHQL_SERVER_PORT}/graphql
COLOSSUS_QUERY_NODE_URL=http://graphql-server:4000/graphql

#DISTRIBUTOR_QUERY_NODE_URL=http://graphql-server:${GRAPHQL_SERVER_PORT}/graphql
DISTRIBUTOR_QUERY_NODE_URL=http://graphql-server:4000/graphql

#PROCESSOR_INDEXER_GATEWAY=http://hydra-indexer-gateway:${HYDRA_INDEXER_GATEWAY_PORT}/graphql
PROCESSOR_INDEXER_GATEWAY=http://hydra-indexer-gateway:4000/graphql
```

You are now ready to run a script that deploys the query node with `docker`.
```
$ cd ~/joystream
$ nano deploy-qn.sh
# paste in below:
---
#!/usr/bin/env bash
set -e

SCRIPT_PATH="$(dirname "${BASH_SOURCE[0]}")"
cd $SCRIPT_PATH

# Bring up db
docker-compose up -d db

# Make sure we use dev config for db migrations (prevents "Cannot create database..." and some other errors)
docker-compose run --rm --entrypoint sh graphql-server -c "yarn workspace query-node config:dev"
# Migrate the databases
docker-compose run --rm --entrypoint sh graphql-server -c "yarn workspace query-node-root db:prepare"
docker-compose run --rm --entrypoint sh graphql-server -c "yarn workspace query-node-root db:migrate"

# Start indexer and gateway
docker-compose up -d indexer
docker-compose up -d hydra-indexer-gateway

# Start processor and graphql server
docker-compose up -d processor
docker-compose up -d graphql-server
```
Then, deploy!
```

$ chmod +x deploy-qn.sh
./deploy-qn.sh
```
</details>

### Confirm Everything is Working
```
# Are all the 6 processes running?
$ docker ps
# Should return: graphql-server, processor, hydra-indexer-gateway, indexer, redis, db

# Is it syncing?
$ docker logs -f -n 100 processor
# this should get all the blocks between 4191207 and the current height. It's fast :)

$ docker logs -f -n 100 indexer
# this should parse all the "interesting" events that the processor processes.
```

You can do a spotcheck to see if you have the correct storageBuckets:
```
curl 'localhost:8081/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: localhost:8081/graphql' --data-binary '{"query":"query {\n  storageBuckets {\n    id\n  }\n}"}' --compressed
```

Finally, if you included hosting of the `Query-node`, you can access the graphql server at `https://<your.cool.url>/server/graphql`.
Note that you'd need to change `https://<your.cool.url>/graphql` address to `https://<your.cool.url>/server/graphql` as well for the server to be reached.


### Troubleshooting
Make sure your joystream node accept connections from your domain, use the flag `--rpc-cors` flag i.e. `--rpc-cors all`.
