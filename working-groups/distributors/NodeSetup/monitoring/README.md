# Configure Telegram
* Go here and create a Bot: https://core.telegram.org/bots#6-botfather, save:
  - Token
  - Bot's name
* Start the Bot
* Create a channel and invite the bot to the channel as admin
* Test your Bot and get chat ID https://api.telegram.org/bot{token}/getUpdates, save:
  - chat ID


## Distributor Node

In joystream/distributor-node/config.yml configure the below section
```
logs:
  elastic:
    level: info
    endpoint: https://<elasticsearch.your.cool.url>
```

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
git clone https://github.com/Joystream/elasticsearch-docker.git
cd elasticsear
ch-docker/client/
```

Edit config/packetbeat/packetbeat.yml:
* name:  Node Name
* tags:
  - SP : Storage Provider
  - DP : Distributor Provicder
  - PB : Packetbeat
  - MB : Metricsbeat
* packetbeat.interfaces.device: Your device interface
* hosts : The elasticsearch host
* username: Username provided by the admin
* password: Username provided by the admin


Edit config/metricbeat/metricbeat.yml:
* name:  Node Name
* tags:
  - SP : Storage Provider
  - DP : Distributor Provicder
  - PB : Packetbeat
  - MB : Metricsbeat
* hosts : The elasticsearch host
* username: Username provided by the admin
* password: Username provided by the admin

## Start the containers

Review the .env file and provide the variables

```
PROMETHEUS_HOST=prometheus.<your.cool.url>
ADMIN_USER=<username>
ADMIN_PASSWORD=<Password>
GRAFANA_HOST=grafana.<your.cool.url>
```

> Review prometheus.yml and add or remove jobs. Make sure the name of containers/services match.

> Review alert.rules and add or remove alerts. Make sure the name of containers/services match

# Configure Alert Manger

```
receivers:
    - name: 'telegramBot'
      telegram_configs:
      - bot_token: <your token>
        api_url: https://api.telegram.org
        chat_id: <your chat ID>
        parse_mode: ''
```
# Spin it up

> Note: Make usre the hosting is configured for monitoring. Also make sure you joystream node has the correct flags

```
$ docker-compose up -d
$ docker-compose logs -f --tail 100
```

# Node and Storage are running as service
<details>
  <summary>Node and Storage are running as service</summary>

## Option 1 - Docker 
```
$ mv docker-compose_service.yml docker-compose.yml
$ mv prometheus_service.yml prometheus.yml

$ docker-compose up -d
$ docker-compose logs -f --tail 100
```

## Option 2 - As a service

[Go here for the installation guide](./monitoring-systemd/README.md)


 </details>
