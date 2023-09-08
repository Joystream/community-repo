# Upgrade 
## Go to the Joystream root directory
```
cd joystream
```
## Back up your config files 
```
$ cp .env /someBackupLocation  //just to save old params
$ cp <root to folder>/storage-node/metadata.json /someBackupLocation
```
## Stop the Storage 
```
$ docker-compose stop colossus-1
$ docker-compose rm colossus-1

```

if you are running as a service

```
$ systemctl stop storage-node.service
```

## Stop the query node (Only if the QN upgrade is part of the upgrade)
```
$ docker stop indexer processor graphql-server
$ docker rm indexer processor graphql-server
```
## Get the lastest and greatest repo
```
$ git stash
$ git pull
$ git stash pop
```

## apply .env sh - you can use values from old backup file

## Run the setup script
```
 $ ./setup.sh
```
check if docker is ok 'docker ps', if not reinstall docker.
```
$ docker ps
$ sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
## logout here and login back 

## Build

```
$ ./build-packages.sh 
```

## Start the QN (Only if the QN upgrade is part of the upgrade)
```
$ query-node/start.sh

```

## Start the Storage service
```
$ docker-compose up --detach --build colossus-1

```

if you are running as a service

```
$ systemctl start storage-node.service
```

## Verify
### Verify that indexer
```
$ docker ps
$ docker logs -f -n 100 indexer
$ docker logs -f -n 100 processor
$ docker logs -f -n 100 colossus-1
```

### Verify  
```
https://<your.cool.url>/storage/api/v1/state/data
```
