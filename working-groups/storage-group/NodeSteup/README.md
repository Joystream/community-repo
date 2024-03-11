# Overview

The instructions below will assume you are running as `root`.
Note that this has been tested on a fresh images of `Ubuntu 20.04 LTS`.

Please note that unless there are any openings for new storage providers (which you can check in [Pioneer](https://dao.joystream.org/#/working-groups/storage) , you will not be able to join.

# Upgrade

To upgrade the node please  [go here for the upgrade guide](./Upgrade/README.md)

# Min Requirement

## Hardware
- CPU: 8 Core
- RAM: 32G
- Storage: 1TB nvme OS, 100TB data
- Bandwidth: 1G


## Test your node 
```
(1) speed test: curl -sL yabs.sh | bash -s -- -fg 
(2) disk test : curl -sL yabs.sh | bash -s -- -ig
```
## Location
No more that 15% of the current operator clustered at the same region.


## Key directories
> /root/joystream The main directory of the repo

> /root/keys keys storage directory

> /root/joystream-node joystream node directory

> /data/joystream-storage main storage directory 


## Install needed tools
```
$ apt-get update && apt-get upgrade -y
$ apt install vim git curl -y
```

## Install Docker
```
$ sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
$ sudo mkdir -p /etc/apt/keyrings
$ sudo mkdir -m 0755 -p /etc/apt/keyrings
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
$ echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
$ sudo apt-get update
$ sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Test docker installation
docker run hello-world

# Might also need this if the test is not successful 
apt install apparmor


```

## Install a Newer Version of `docker-compose`
The package manager `apt-get` installs an old version of `docker-compose`, that doesn't take the `.env` file format we have used. We recommend removing the old one, and install the new one, with:

```
$ docker-compose version
# if you see `1.29.2` skip to Deploy
$ cd ~/
$ apt-get remove docker-compose
$ curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
$ chmod +x /usr/local/bin/docker-compose
$ ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```


## Setup joystream-node
[Go here for the installation guide](./joystream-node/README.md)
## Setup Query Node
[Go here for the installation guide](./query-node/README.md)
## Setup hosting
[Go here for the installation guide](./hosting/README.md)

# Setup and Configure the Storage Node


Make sure you have [docker-compose.yml](./docker-compose.yml) and [New .env](./.env)

## Keys
- Member key
- Role key
- Operator key: in the codebase it's referred to as the transactor key.


### Create Operator key	
```
$ mkdir ~/keys/
$ cd ~/joystream/
$ yarn joystream-cli account:create

# give it the name:
  storage-operator-key

# this guide assumes you don't set a password

cat /root/.local/share/joystream-cli/accounts/storage-operator-key.json
```


```
# Paste your <YourStorageRoleKey.json> in the file below

nano /root/keys/storage-role-key.json
```

**Make sure your [Joystream full node](#Setup-joystream-node) and [Query Node](#Setup-Query-Node) is fully synced before you move to the next step(s)!**
```
wget -O /your/joystream/directory/.env https://raw.githubusercontent.com/yasiryagi/community-repo/master/working-groups/storage-group/NodeSteup/.env
wget -O /your/joystream/directory/docker-compose.yml https://raw.githubusercontent.com/yasiryagi/community-repo/master/working-groups/storage-group/NodeSteup/docker-compose.yml

```

## Deploy the Storage Node


### Edit .env

```
COLOSSUS_PORT=3333
COLOSSUS_VERSION=4.0.0
STORAGE_SQUID_VERSION=1.4.
COLOSSUS_1_WORKER_ID=<your.worker.ID>

#Add the password variable
ACCOUNT_PWD=<your.cool.key.password>
JOYSTREAM_ES_URL=https://elastic.joyutils.org/
JOYSTREAM_ES_USERNAME=storage-xxx
JOYSTREAM_ES_PASSWORD=xxxxxxxxx
KEY_FILE
DATA_FOLDER
KEY_FOLDER
LOG_FOLDER
ENDPOINT
STORAGESQUIDENDPOINT
```


### Create entrypoints folder
```
mkdir /your/joystream/directory/entrypoints
wget -O /your/joystream/directory/entrypoints/storage.sh https://raw.githubusercontent.com/yasiryagi/community-repo/master/working-groups/storage-group/NodeSteup/entrypoints/storage.sh
```

```
docker-compose up --detach storage
```

###  Check and monitor 
```
### are all containers up and healthy
docker ps
docker logs -f storage --tail 100
```


## Accept Invitation
Once hired, the Storage Lead will invite you a to "bucket". Before this is done, you will not be able to participate. Assuming:
- your Worker ID is `<workerId>`
- the Lead has invited to bucket `<bucketId>`

```
docker exec -it storage yarn run storage-node operator:accept-invitation -i <bucketId> -w <workerId> -t <StorageOperatorKey> --password=YourRoleKeyPassword -k /keystore/storage-role-key.json

# With bucketId=1, workerId=2, and operatorkey=5StorageOperatorKey that would be:
# docker exec -it storage yarn run storage-node operator:accept-invitation -i 1 -w 1 -t  $5StorageOperatorKey --password=YourRoleKeyPassword -k /keystore/storage-role-key.json
```

## Set Metadata
When you have accepted the invitation, you have to set metadata for your node. If your VPS is in Frankfurt, Germany:

```
$ nano metadata.json
# Modify, and paste in everything below the stapled line
---
{
  "endpoint": "https://<your.cool.url>/storage/",
  "location": {
    "countryCode": "DE",
    "city": "Frankfurt",
    "coordinates": {
      "latitude": 52,
      "longitude": 15
    }
  },
  "extra": "<Node ID>: <Location>, Xcores, <RAM>G, <SSD>G "
}
```
Where:
- The location should really be correct, [IPLocation](https://www.iplocation.net/)
- extra is not that critical. It could perhaps be nice to add some info on your max capacity?

Then, set it on-chain with:
```
docker exec -it storage yarn run storage-node operator:set-metadata -i <bucketId> -w <workerId> -j /path/to/metadata.json -k /keystore/storage-role-key.json

# With bucketId=1, workerId=2, that would be:
docker exec -it storage  yarn run storage-node operator:set-metadata -i 1 -w 2 -j /path/to/metadata.json --password=YourKeyPassword -k /keystore/storage-role-key.json
```

## Check and monitor
```
## are all containers up and healthy
docker ps
docker logs -f storage --tail 100
```

# If it looks ok, it probably is :)
---

 
### Verify everything is working

In your browser, try:
`https://<your.cool.url>/storage/api/v1/version`.
`https://<your.cool.url>/storage/api/v1/state/data`.
# Overview
