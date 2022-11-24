# Configure Joystream Node




## Storage Node

In /etc/systemd/system/storage-node.service  add the -e flag
```
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
        -s
```
## Configure Packetbeat and Metricbeat

```
git clone https://github.com/yasiryagi/elasticsearch-docker.git
cd elasticsearch-docker/client/
```

Edit config/packetbeat/packetbeat.yml:
* name:  NodeName_SP 
* tags: ["SP", "Your Node Name", "PB"]

* packetbeat.interfaces.device: Your device interface
* hosts : The elasticsearch host
* username: Username provided by the admin
* password: Username provided by the admin


Edit config/metricbeat/metricbeat.yml:
* name:  NodeName_SP
* tags: ["SP", "Your Node Name", "MB"]

* hosts : The elasticsearch host
* username: Username provided by the admin
* password: Username provided by the admin

## Start the containers

```
docker-compose up -d
```
