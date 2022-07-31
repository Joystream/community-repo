# Overview

The instructions below will assume you are running as `root`.
Note that this has been tested on a fresh images of `Ubuntu 20.04 LTS`.

Please note that unless there are any openings for new storage providers (which you can check in [Pioneer](https://dao.joystream.org/#/working-groups/storage) , you will not be able to join.

# Upgrade

To upgrade the node please  [go here for the upgrade guide](./Upgrade/README.md)


# Initial setup

```
$ apt-get update && apt-get upgrade -y
$ apt install vim git curl -y
```

## Setup hosting
[Go here for the installation guide](./hosting/README.md)
## Setup joystream-node
[Go here for the installation guide](./joystream-node/README.md)
## Setup Query Node
[Go here for the installation guide](./query-node/README.md)


# Applying for a Storage Provider opening

Click [here](https://dao.joystream.org/#/working-groups/storage) to open the `Pioneer app` in your browser. 

Make sure to save the `5YourJoyMemberAddress.json` file. This key will require tokens to be used as stake for the `Storage Provider` application (`application stake`) and further stake may be required if you are selected for the role (`role stake`).
During this process you will be provided with a role key, which will be made available to download in the format `5YourStorageRoleKey.json`. If you set a password for this key, remember it :)

The next steps (below) will only apply if you are a successful applicant.

# Setup and Configure the Storage Node

## Keys
- Member key
- Role key
- Operator key: in the codebase it's referred to as the transactor key.

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


```
# Go the directory where you saved your <5YourStorageRoleKey.json>, then rename it to

storage-role-key.json
#copy the role key to your keys directory, the below if you are copying from another server.
$ scp storage-role-key.json <user>@<your.vps.ip.address>:/root/keys/
```

**Make sure your [Joystream full node](#Setup-joystream-node) and [Query Node](#Setup-Query-Node) is fully synced before you move to the next step(s)!**

## Install and Setup the  Node
> If you have done this on the query node setup, you can skip this section.

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

## Accept Invitation
Once hired, the Storage Lead will invite you a to "bucket". Before this is done, you will not be able to participate. Assuming:
- your Worker ID is `<workerId>`
- the Lead has invited to bucket `<bucketId>`

```
$ cd ~/joystream
yarn run storage-node operator:accept-invitation -i <bucketId> -w <workerId> -t <5StorageRolerKey> --password=YourKeyPassword -k /root/keys/storage-role-key.json

# With bucketId=1, workerId=2, and operatorkey=5StorageOperatorKey that would be:
# yarn run storage-node operator:set-metadata -i 1 -w 2 -t 5StorageOperatorKey -k /root/keys/storage-role-key.json
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
# yarn run storage-node operator:set-metadata -i 1 -w 2 -j /path/to/metadata.json -k /root/keys/storage-role-key.json
```

## Deploy the Storage Node
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

### Verify everything is working

In your browser, try:
`https://<your.cool.url>/storage/api/v1/state/data`.

