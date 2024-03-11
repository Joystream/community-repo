
# Overview

The following assumptions apply:
1. You are `root`, and [cloning](#clone-the-repo) to `~/joystream`
2. in most cases, you will want to run your own `joystream-node` on the same device, and this guide assumes you are.

For instructions on how to set this up, go [here](../joystream-node/README.md). Note that you can disregard all the parts about keys before applying, and just install the software so it is ready to go. You do need to run with `--pruning=archive` though, and be synced past the blockheight you are exporting the db from.

## Set the Environment

.env and update variables [New .env](../.env)
```
wget wget -O /your/joystream/directory/.env https://raw.githubusercontent.com/yasiryagi/community-repo/master/working-groups/storage-group/NodeSteup/.env
```
Update the below variables in your new .env


```
JOYSTREAM_NODE_WS
KEY_FILE
COLOSSUS_1_WORKER_ID
JOYSTREAM_ES_USERNAME
JOYSTREAM_ES_PASSWORD
DATA_FOLDER
KEY_FOLDER
LOG_FOLDER
ENDPOINT
STORAGESQUIDENDPOINT
```

### Deploy

#### Get the Requirements
Get docker-compose.yml [docker-compose.yml](../docker-compose.yml)

Copy directories 'database and entrypoints' in this guide into your joystream directory 

```
wget -O /your/joystream/directory/docker-compose.yml https://raw.githubusercontent.com/yasiryagi/community-repo/master/working-groups/storage-group/NodeSteup/docker-compose.yml

# Make folder database
mkdir /your/joystream/directory/database
wget -O /your/joystream/directory/database/pg_hba.conf https://raw.githubusercontent.com/yasiryagi/community-repo/master/working-groups/storage-group/NodeSteup/database/pg_hba.conf
wget -O /your/joystream/directory/database/postgres.conf https://raw.githubusercontent.com/yasiryagi/community-repo/master/working-groups/storage-group/NodeSteup/database/postgres.conf
```

#### Bring up SubSquid 

```
docker-compose up --detach squid-db squid-processor squid-graphql-server

```

#### Check and monitor
```
#are all containers up and healthy
docker ps
docker logs -f squid-db --tail 100
docker logs -f squid-processor --tail 100
docker logs -f squid-graphql-server --tail 100
```
Make sure your joystream node accept connections from your domain, use the flag `--rpc-cors` flag i.e. `--rpc-cors all`.
