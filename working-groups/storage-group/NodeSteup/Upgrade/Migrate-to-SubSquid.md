1- Repoint your storage to public QN

```
vim .env
#COLOSSUS_QUERY_NODE_URL=http://graphql-server:8081/graphql
COLOSSUS_QUERY_NODE_URL=https://query.joyutils.org/graphql
```

2- Restart your Colossus server 
```
docker-compose up --detach --force-recreate --remove-orphans colossus-1
```

2- Stop old query node 

```
docker stop graphql-server processor hydra-indexer-gateway indexer redis db
docker rm graphql-server processor hydra-indexer-gateway indexer redis db
```

3- Backup exisitng .env
```
vp .env .env.bk
```

Update variables:
[.env](./env)

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
