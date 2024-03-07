## 0- Make sure you are in the right directory 
```
 cd /your/joystream/directory
```

## 1- Repoint your storage to public QN

```
vim .env
#COLOSSUS_QUERY_NODE_URL=http://graphql-server:8081/graphql
COLOSSUS_QUERY_NODE_URL=https://query.joyutils.org/graphql
```

## 2- Restart your Colossus server 
```
docker-compose up --detach --force-recreate --remove-orphans colossus-1
```

## 3- Stop old query node 

```
docker stop graphql-server processor hydra-indexer-gateway indexer redis db
docker rm graphql-server processor hydra-indexer-gateway indexer redis db
```

## 4- Backup exisitng files 
```
cp .env .env.bk
cp docker-compose.yml docker-compose.yml.bk
```

## 5- Create new .env and update variables:
[New .env](./.env)

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

## 6- Update docker-compose.yml 

[docker-compose.yml](./docker-compose.yml)

## 7- Bring up SubSquid 

(be careful you do not want to stop your current storage container, the storage container in the new docker-compose.yml is pointing to SubSquid)
```
docker-compose up --detach squid-db squid-processor squid-graphql-server
```
## 8- Check and monitor 
```
# are all containers up and healthy
docker ps
docker logs -f squid-db --tail 100
docker logs -f squid-processor --tail 100
docker logs -f squid-graphql-server --tail 100
```


## 9- Restart your Colossus server 
```
docker stop colossus-1
docker rm colossus-1
docker-compose up --detach storage
```

## 8- Check and monitor 
```
# are all containers up and healthy
docker ps
docker logs -f storage --tail 100
```
