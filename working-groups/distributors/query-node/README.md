Table of Contents
==
<!-- TOC START min:1 max:3 link:true asterisk:false update:true -->
- [Overview](#overview)
  - [Get Started](#get-started)
    - [Clone the Repo](#clone-the-repo)
    - [Install a Newer Version of `docker-compose`](#install-a-newer-version-of-docker-compose)
    - [Deploy](#deploy)
    - [Confirm Everything is Working](#confirm-everything-is-working)
  - [Setup Hosting](#setup-hosting)
    - [Caddy](#caddy)
    - [Run caddy as a service](#run-caddy-as-a-service)
  - [Troubleshooting](#troubleshooting)
<!-- TOC END -->

# Overview
This guide will help you deploy a working query-node.

The following assumptions apply:
1. You are `root`, and [cloning](#clone-the-repo) to `~/joystream`
2. in most cases, you will want to run your own `joystream-node` on the same device, and this guide assumes you are.

For instructions on how to set this up, go [here](/roles/validators). Note that you can disregard all the parts about keys before applying, and just install the software so it is ready to go. You do need to run with `--pruning=archive` though, and be synced past the blockheight you are exporting the db from.

## Get Started
You don't need to host your query-node, but if you're connecting to your own node, docker will not "find" it on localhost. So first, go to [Setup Hosting](#setup-hosting).

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

### Deploy

#### Set the Environment
First, get your
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

## Setup Hosting
In order to allow for users to upload and download, you have to setup hosting, with an actual domain as both Chrome and Firefox requires `https://`. If you have a "spare" domain or subdomain you don't mind using for this purpose, go to your domain registrar and point your domain to the IP you want. If you don't, you will need to purchase one.

### Caddy
To configure SSL-certificates the easiest option is to use [caddy](https://caddyserver.com/), but feel free to take a different approach. Note that if you are using caddy for commercial use, you need to acquire a license. Please check their terms and make sure you comply with what is considered personal use.

For the best setup, you should use the "official" [documentation](https://caddyserver.com/docs/).

The instructions below are for Caddy v2.4.6:
```
$ wget https://github.com/caddyserver/caddy/releases/download/v2.4.6/caddy_2.4.6_linux_amd64.tar.gz
$ tar -vxf caddy_2.4.6_linux_amd64.tar.gz
$ mv caddy /usr/bin/
# Test that it's working:
$ caddy version
```

Configure the `Caddyfile`:
**Note** you only "need" the `Joystream-node`, whereas the `Query-node` will have you host the a (public) graphql server.
```
$ nano ~/Caddyfile
# Modify, and paste in everything below the stapled line
---
# Joystream-node
wss://<your.cool.url>/rpc {
	reverse_proxy localhost:9944
}

# Query-node
https://<your.cool.url>{
	log {
		output stdout
	}
	route /server/* {
		uri strip_prefix /server
		reverse_proxy localhost:8081
	}
	route /gateway/* {
		uri strip_prefix /gateway
		reverse_proxy localhost:4000
	}
	route /@apollographql/* {
		reverse_proxy localhost:8081
	}
}
```

Now you can check if you configured correctly, with:
```
$ caddy validate ~/Caddyfile
# Which should return:
--
...
Valid configuration
--
# You can now run caddy with:
$ caddy run --config /root/Caddyfile
# Which should return something like:
--
...
... [INFO] [<your.cool.url>] The server validated our request
... [INFO] [<your.cool.url>] acme: Validations succeeded; requesting certificates
... [INFO] [<your.cool.url>] Server responded with a certificate.
... [INFO][<your.cool.url>] Certificate obtained successfully
... [INFO][<your.cool.url>] Obtain: Releasing lock
```

### Run caddy as a service
To ensure high uptime, it's best to set the system up as a `service`.

Example file below:

```
$ nano /etc/systemd/system/caddy.service

# Modify, and paste in everything below the stapled line
---
[Unit]
Description=Caddy
Documentation=https://caddyserver.com/docs/
After=network.target

[Service]
User=root
ExecStart=/usr/bin/caddy run --config /root/Caddyfile
ExecReload=/usr/bin/caddy reload --config /root/Caddyfile
TimeoutStopSec=5s
LimitNOFILE=1048576
LimitNPROC=512
PrivateTmp=true
ProtectSystem=full
AmbientCapabilities=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
```
Save and exit. Close `caddy` if it's still running, then:
```
$ systemctl start caddy
# If everything works, you should get an output. Verify with:
$ systemctl status caddy
# Which should produce something similar to the previous output.
# To have caddy start automatically at reboot:
$ systemctl enable caddy
# If you want to stop caddy:
$ systemctl stop caddy
# If you want to edit your Caddfile, edit it, then run:
$ caddy reload
```

## Troubleshooting
Make sure your joystream node accept connections from your domain, use the flag `--rpc-cors` flag i.e. `--rpc-cors all`.
