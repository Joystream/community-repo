# Upgrade 
## Go to the Joystream root directory
```
cd joystream
```
## Back up your config files 
```
cp .env /someBackupLocation  //just to save old params
cp <root to folder>/storage-node/metadata.json /someBackupLocation
```
## Stop the service 
```
systemctl stop storage-node.service
```
## Stop the query node
```
./query-node/kill.sh
```
## Get the lastest and greatest repo
```
git stash
git pull
```

## apply .env sh - you can use values from old backup file

## Run the setup script
```
 ./setup.sh
```
## logout here and login back 

## Build

```
./build-packages.sh 
```
## Start the services
```
query-node/start.sh
systemctl start storage-node.service
```

## Verify
### Verify that indexer
```
docker ps
docker logs -f -n 100 indexer
docker logs -f -n 100 processor
```

### Verify  
```
https://<your.cool.url>/storage/api/v1/state/data
```
