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
- Storage: 1TB nvme OS, 50TB data
- Bandwidth: 1G


## Test your node 
```
(1) speed test: curl -sL yabs.sh | bash -s -- -fg 
(2) disk test : curl -sL yabs.sh | bash -s -- -ig
```
## Location
No more that 15% of the current operator clustered at the same region.

# Initial setup

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

## Keys
- Member key
- Role key
- Operator key: in the codebase it's referred to as the transactor key.


<details>
  <summary>IGNORE</summary>
	
```
$ mkdir ~/keys/
$ cd ~/joystream/
$ yarn joystream-cli account:create

# give it the name:
  storage-operator-key

# this guide assumes you don't set a password

cat /root/.local/share/joystream-cli/accounts/storage-operator-key.json
```
This will give show you the address:
`..."address":"5StorageOperatorKey"...`

 </details>

```
# Paste your <YourStorageRoleKey.json> in the file below

nano /root/keys/storage-role-key.json
```

**Make sure your [Joystream full node](#Setup-joystream-node) and [Query Node](#Setup-Query-Node) is fully synced before you move to the next step(s)!**

## Install and Setup the  Node

<details>
  <summary>If you have done this on the query node setup, you can skip this section.</summary>


```
$ git clone https://github.com/Joystream/joystream.git
$ cd joystream
$ ./setup.sh
# this requires you to start a new session. if you are using a vps:
$ exit
$ ssh user@ipOrURL
$ cd joystream
$ ./build-packages.sh
$ yarn storage-node --help
```
 </details>
 
## Accept Invitation
Once hired, the Storage Lead will invite you a to "bucket". Before this is done, you will not be able to participate. Assuming:
- your Worker ID is `<workerId>`
- the Lead has invited to bucket `<bucketId>`

```
$ cd ~/joystream
yarn run storage-node operator:accept-invitation -i <bucketId> -w <workerId> -t <StorageRolerKey> --password=YourKeyPassword -k /root/keys/storage-role-key.json

# With bucketId=1, workerId=2, and operatorkey=5StorageOperatorKey that would be:
# yarn run storage-node operator:accept-invitation -i 1 -w 1 -t $5StorageRolerKey --password=YourKeyPassword -k /root/keys/storage-role-key.json
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
$ cd ~/joystream
$ yarn run storage-node operator:set-metadata -i <bucketId> -w <workerId> -j /path/to/metadata.json -k /root/keys/storage-role-key.json

# With bucketId=1, workerId=2, that would be:
# yarn run storage-node operator:set-metadata -i 1 -w 2 -j /path/to/metadata.json --password=YourKeyPassword -k /root/keys/storage-role-key.json
```

## Deploy the Storage Node
### Option 1 - Docker


Edit .env

``` 
COLOSSUS_1_WORKER_ID=<your.worker.ID>

#Add the password variable
SUPER_PASSWORD=<your.cool.key.password>
JOYSTREAM_ES_URL=https://elastic.joyutils.org/
JOYSTREAM_ES_USERNAME=storage-xxx
JOYSTREAM_ES_PASSWORD=xxxxxxxxx
``` 


``` 
$ vim docker-compose.yml
```

Edit service colossus-1

```
  colossus-1:
    image: joystream/storage-node:3.10.2
    container_name: colossus-1
    restart: on-failure
    volumes:
      - /data/joystream-storage:/data
      - /root/keys:/keystore
      - /data/joystream-storage/log:/logs
      - ./entrypoints/storage.sh:/joystream/entrypoints/storage.sh:ro
    working_dir: /joystream/storage-node
    ports:
      - 3333:3333
    env_file:
      # relative to working directory where docker-compose was run from
      - .env
    command: [
      'server', '--worker=${COLOSSUS_1_WORKER_ID}', '--port=3333', '--uploads=/data',
      '--sync', '--syncInterval=1',
      '--queryNodeEndpoint=${COLOSSUS_QUERY_NODE_URL}',
      '--apiUrl=${JOYSTREAM_NODE_WS}',
      '--keyFile=/keystore/storage-role-key.json',
      '--password=${SUPER_PASSWORD}',
      '--elasticSearchEndpoint=${JOYSTREAM_ES_URL}',
      '--elasticSearchPassword=${JOYSTREAM_ES_PASSWORD}',
      '--elasticSearchUser=${JOYSTREAM_ES_USERNAME}',
      '--logFilePath=/logs'
    ]


```

Under volume make sure to comment out this for all containers

```
   # type: bind
   #       source: .
   #       target: /joystream
```

Bring your node up and check logs
```
$ docker-compose up --detach --build colossus-1

$ docker logs -f -n 100 colossus-1
```

Make sure your containers running on the same network
```
$ docker network ls
$ docker network inspect <network name>
```

### Option 2 - Service (your own responsibilities - not maintained)

<details>
  <summary>Option 2 as a service</summary>
  
First, create a `systemd` file. Example file below:

```
$ nano /etc/systemd/system/storage-node.service

# Modify, and paste in everything below the stapled line
---
[Unit]
Description=Joystream Storage Node
After=network.target joystream-node.service

[Service]
User=root
WorkingDirectory=/root/joystream/
LimitNOFILE=10000
ExecStart=/root/.volta/bin/yarn storage-node server \
        -u ws://localhost:9944 \
        -w <workerId> \
        -o 3333 \
        -l /<root/joystream-storage>/log/ \
        -d /<root/joystream-storage> \
        -q http://localhost:8081/graphql \
	-p <Passowrd> \
        -k /root/keys/storage-role-key.json \
	-e https://<elasticsearch.your.cool.url> \
        --elasticSearchPassword=<elasticSearchPassword> \    
        --elasticSearchUser=<elasticSearchUser> \
        -s
Restart=on-failure
StartLimitInterval=600

[Install]
WantedBy=multi-user.target
```

If you (like most) have needed to buy extra storage volume, remember to set `-d /path/to/volume`
Save and exit.

```
$ systemctl start storage-node
# If everything works, you should get an output. Verify with:
$ journalctl -f -n 200 -u storage-node

# If it looks ok, it probably is :)
---

# To have colossus start automatically at reboot:
$ systemctl enable storage-node
# If you want to stop the storage node, either to edit the storage-node.service file or some other reason:
$ systemctl stop storage-node
```
 </details>
 
### Verify everything is working

In your browser, try:
`https://<your.cool.url>/storage/api/v1/version`.
`https://<your.cool.url>/storage/api/v1/state/data`.


###  Missing objects fix for Storage provider
1) Upload data to the pending folder
2) Restart colossus-1 container

```
# Example:
cd /home/data/joystream-storage/pending
wget <link_to_the_file>
cd $HOME/joystream
docker-compose up --detach --force-recreate --remove-orphans colossus-1
```

* if that didn't help:
3) Go to the console using the next link: https://graphql-console.subsquid.io/?graphql_api=https://joystream.yyagi.cloud/graphql) and find the necessary storage bag by request
```
# Example:
query MyQuery {
  storageDataObjects(where: {id_eq: "985358"}) {   <-------------------------- replace 985358 with your object
    storageBag {
      id
      storageBuckets {
        id
      }
    }
    id
  }
}
```

4) You can now explicitly process an object via Polkadot.js (screenshot below)
![img.png](img.png)
