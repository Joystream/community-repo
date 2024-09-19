# Release

Find the lasted release [here](https://github.com/Joystream/joystream/releases)


# Setup 

## Run Node

```
$ cd ~/
$ mkdir joystream-node
$ cd joystream-node
# 64 bit debian based Linux
$ wget https://github.com/Joystream/joystream/releases/download/v10.7.1/joystream-node-6.7.0-bdec855-x86_64-linux-gnu.tar.gz
$ tar -vxf joystream-node-6.7.0-bdec855-x86_64-linux-gnu.tar.gz
$ mv joystream-node /usr/local/bin/
$ wget https://github.com/Joystream/joystream/releases/download/v10.5.0/joy-testnet-6.json
# Test is it working. 
$ joystream-node --chain joy-testnet-6.json --pruning archive --validator
```
- If you want your node to have a non-random identifier, add the flag:
  - `--name <nodename>`
- If you want to get a more verbose log output, add the flag:
  - `--log runtime,txpool,transaction-pool,trace=sync`

Your node should now start syncing with the blockchain. The output should look like this:
```
Joystream Node
  version "Version"-"your_OS"
  by Joystream contributors, 2019-2020
Chain specification: "Joystream Version"
Node name: "nodename"
Roles: AUTHORITY
Initializing Genesis block/state (state: "0x…", header-hash: "0x…")
Loading GRANDPA authority set from genesis on what appears to be first startup.
Loaded block-time = BabeConfiguration { slot_duration: 6000, epoch_length: 100, c: (1, 4), genesis_authorities: ...
Creating empty BABE epoch changes on what appears to be first startup.
Highest known block at #0
Local node identity is: "peer id"
Starting BABE Authorship worker
Discovered new external address for our node: /ip4/"IP"/tcp/30333/p2p/"peer id"
New epoch 0 launching at block ...
...
...
Syncing, target=#"block_height" ("n" peers), best: #"synced_height" ("hash_of_synced_tip"), finalized #0 ("hash_of_finalized_tip"), ⬇ "download_speed"kiB/s ⬆ "upload_speed"kiB/s
```
From the last line, notice `target=#"block_height"` and `best: #"synced_height"`
When the `target=#block_height`is the same as `best: #"synced_height"`, your node is fully synced!

**Keep the terminal window open.** or recommended to [Run as a service](#run-as-a-service)


## Configure the service

Either as root, or a user with sudo privileges. If the latter, add `sudo` before commands.

```
$ cd /etc/systemd/system
# you can choose whatever name you like, but the name has to end with .service
$ touch joystream-node.service
# open the file with your favorite editor (I use nano below)
$ nano joystream-node.service
```

#### Example with user joystream

The example below assumes the following:
- You have setup a user `joystream` to run the node

```
[Unit]
Description=Joystream Node
After=network.target

[Service]
Type=simple
User=joystream
WorkingDirectory=/<path to work directory>/joystream-node/
ExecStart=joystream-node \
        --chain /<path to work directory>/joystream-node/joy-testnet-6.json \
        --pruning archive \
        --validator \
        --name <memberId-memberHandle> \
        --log runtime,txpool,transaction-pool,trace=sync
Restart=on-failure
RestartSec=3
LimitNOFILE=10000

[Install]
WantedBy=multi-user.target
```

#### Example as root

The example below assumes the following:
- You have setup a user `root` to run the node

```
[Unit]
Description=Joystream Node
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/<path to work directory>/joystream-node/
ExecStart=joystream-node \
        --chain /<path to work directory>/joystream-node/joy-testnet-6.json \
        --pruning archive \
        --validator \
        --name <memberId-memberHandle> \
        --log runtime,txpool,transaction-pool,trace=sync
Restart=on-failure
RestartSec=3
LimitNOFILE=10000

[Install]
WantedBy=multi-user.target
```

### Starting the service

You can add/remove any `flags` as long as you remember to include `\` for every line but the last. Also note that systemd is very sensitive to syntax, so make sure there are no extra spaces before or after the `\`.

After you are happy with your configuration:

```
$ systemctl daemon-reload
# this is only strictly necessary after you changed the .service file after running, but chances are you will need to use it once or twice.
# if your node is still running, now is the time to kill it.
$ systemctl start joystream-node
# if everything is correctly configured, this command will not return anything.
# To verify it's running:
$ systemctl status joystream-node
# this will only show the last few lines. To see the latest 100 entries (and follow as new are added)
$ journalctl -n 100 -f -u joystream-node

# To make the service start automatically at boot:
$ systemctl enable joystream-node
```
You can restart the service with:
- `systemctl restart joystream-node`

If you want to change something (or just stop), run:
- `systemctl stop joystream-node`

Before you make the changes. After changing:

```
$ systemctl daemon-reload
$ systemctl start joystream-node
```

### Errors

If you make a mistake somewhere, `systemctl start joystream-node` will prompt:
```
Failed to start joystream-node.service: Unit joystream-node.service is not loaded properly: Invalid argument.
See system logs and 'systemctl status joystream-node.service' for details.
```
Follow the instructions, and see if anything looks wrong. Correct it, then:

```
$ systemctl daemon-reload
$ systemctl start joystream-node
```
