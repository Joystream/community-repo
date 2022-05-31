
# Instructions

The instructions below will assume you are running as `root`. This makes the instructions somewhat easier, but less safe and robust.

Note that this has been tested on a fresh images of `Ubuntu 20.04 LTS`.


## Upgrade 

To upgrade the node please  [go here for the upgrade guide](./Upgrade/README.md)
 

## Initial setup

```
$ apt-get update && apt-get upgrade -y
```
### Setup hosting
[Go here for the installation guide](./hosting/README.md)
### Setup joystream-node
[Go here for the installation guide](./joystream-node/README.md)
### Setup Query Node
[Go here for the installation guide](./query-node/README.md)



## Install and Setup the Distributor Node


```
$ git clone https://github.com/Joystream/joystream.git
$ cd joystream
$ ./setup.sh
# this requires you to start a new session. if you are using a vps:
$ exit
$ ssh user@ipOrURL
$ cd joystream
$ ./build-packages.sh
$ yarn joystream-distributor --help
```

### Applying for a Distributor opening

Click [here](https://testnet.joystream.org) to open the `Pioneer app` in your browser. Then follow instructions [here](https://github.com/Joystream/helpdesk#get-started) to generate a set of `Keys`, get tokens, and sign up for a `Membership`. This `key` will be referred to as the `member` key.

Make sure to save the `5YourJoyMemberAddress.json` file. This key will require tokens to be used as stake for the `Distributor Provider` application (`application stake`) and further stake may be required if you are selected for the role (`role stake`).

To check for current openings, visit [this page](https://testnet.joystream.org/#/working-groups/opportunities) on Pioneer and look for any `Distributor Provider` applications which are open for applications. If there is an opening available, fill in the details requested in the form required and stake the tokens needed to apply (when prompted you can sign a transaction for this purpose).

During this process you will be provided with a role key, which will be made available to download in the format `5YourDistributorRoleKey.json`. If you set a password for this key, remember it :)

The next steps (below) will only apply if you are a successful applicant.


### Setup and Configure the Distributor Node

On the machine/VPS you want to run your distributor node:

```
$ mkdir ~/keys/
```

Assuming you are running the distributor node on a VPS via ssh, on your local machine:
```
# Go the directory where you saved your <5YourDistributorRoleKey.json>, then rename it to

distributor-role-key.json

$ scp distributor-role-key.json <user>@<your.vps.ip.address>:/root/keys/
```

**Make sure your [Joystream full node](#Setup-joystream-node) and [Query Node](#Setup-Query-Node) is fully synced before you move to the next step(s)!**

### Config File
The default `config.yml` file can be found below. Note that you only need to modify a few lines.
May be should condifer changing: id, maxFiles and maxSize.
```
nano ~/joystream/distributor-node/config.yml
---

id: <your node name>
endpoints:
  queryNode: http://localhost:8081/graphql
  joystreamNodeWs: ws://localhost:9944
directories:
  assets: ./local/data
  cacheState: ./local/cache
logs:
  file:
    level: debug
    path: ./local/logs
    maxFiles: 30 # 30 days or 30 * 50 MB
    maxSize: 50485760 # 50 MB
  console:
    level: verbose
  # elastic:
  #   level: info
  #   endpoint: http://localhost:9200
limits:
  storage: 100G
  maxConcurrentStorageNodeDownloads: 100
  maxConcurrentOutboundConnections: 300
  outboundRequestsTimeoutMs: 5000
  pendingDownloadTimeoutSec: 3600
  maxCachedItemSize: 1G
intervals:
  saveCacheState: 60
  checkStorageNodeResponseTimes: 60
  cacheCleanup: 60
publicApi:
  port: 3334
operatorApi:
  port: 3335
  hmacSecret: this-is-not-so-secret
keys:
  - suri: //Alice
  # - mnemonic: "escape naive annual throw tragic achieve grunt verify cram note harvest problem"
  #   type: ed25519
  # - keyfile: "/path/to/distributor-role-key.json"
workerId: 0
```
The following lines must be changed:
```
# Comment out:
  - suri: //Alice
# uncomment and edit
  - keyfile: "/root/keys/keyfile.json"

# replace 0 with your <workerId>
workerId: 0

# replace with a real secret
hmacSecret: this-is-not-so-secret
```

- `endpoints:` If you are not running your own node and/or query node:
  - change both to working endpoints
- `limits:` These numbers should depend on decisions made by the Lead
- `hmacSecret: this-is-not-so-secret`
- `directories:` You may want to change these. Especially if you are renting extra storage volumes
  - `/path/to/storage/volume`

### Accept Invitation
Once hired, the Distributor Lead will invite you a to "bucket". Before this is done, you will not be able to participate. Assuming:
- your Worker ID is `<workerId>`
- the Lead has invited to bucket family `<bucketFamilyId>` with index `<bucketId>` -> `<bucketFamilyId>:<bucketId>`

```
$ cd ~/joystream/distributor-node
$ yarn joystream-distributor operator:accept-invitation -B <bucketFamilyId>:<bucketId> -w <workerId>
```

### Set Metadata
When you have accepted the invitation, you have to set metadata for your node. If your VPS is in Frankfurt, Germany:

```
$ nano ~/joystream/distributor-node/metadata.json
# Modify, and paste in everything below the stapled line
---
{
  "endpoint": "https://<your.cool.url>/distributor/",
  "location": {
    "countryCode": "DE",
    "city": "Frankfurt",
    "coordinates": {
      "latitude": 52,
      "longitude": 15
    }
  },
  "extra": "Hello world!"
}
```
Where:
- The location should really be correct (you can google your way to latitude/longitude)
- extra is not that critical. It could perhaps be nice to add some info on your max capacity?

Then set it on-chain with:

```
$ cd ~/joystream/distributor-node
$ yarn joystream-distributor operator:set-metadata -B <bucketFamilyId>:<bucketId> -w <workerId> -i /path/to/metadata.json
```

## Deploy the Distributor Node
First, create a `systemd` file. Example file below:

```
$ nano /etc/systemd/system/distributor-node.service

# Modify, and paste in everything below the stapled line
---
[Unit]
Description=Joystream Distributor Node
After=network.target joystream-node.service

[Service]
User=root
WorkingDirectory=/root/joystream/
LimitNOFILE=10000
ExecStart=/root/.volta/bin/yarn joystream-distributor start \
        -c /root/joystream/distributor-node/config.yml
Restart=on-failure
StartLimitInterval=600

[Install]
WantedBy=multi-user.target
```

To start the node:

```
$ systemctl start distributor-node
# If everything works, you should get an output. Verify with:
$ journalctl -f -n 200 -u distributor-node

# If it looks ok, it probably is :)
---

# To have the distributor-node start automatically at reboot:
$ systemctl enable distributor-node
# If you want to stop the distributor node, either to edit the distributor-node.service file or some other reason:
$ systemctl stop distributor-node
```

### Verify everything is working

In your browser, try:
`https://<your.cool.url>/distributor/api/v1/status`.

# Troubleshooting
If you had any issues setting it up, you may find your answer here!
