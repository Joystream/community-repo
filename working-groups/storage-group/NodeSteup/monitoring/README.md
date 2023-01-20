# Configure Telegram
* Go here and create a Bot: https://core.telegram.org/bots#6-botfather, save:
  - Token
  - Bot's name
* Start the Bot
* Create a channel and invite the bot to the channel as admin
* Test your Bot and get chat ID https://api.telegram.org/bot{token}/getUpdates, save:
  - chat ID

# Configure Prometheus

```
$ git clone https://github.com/yasiryagi/community-repo.git
$ cp -R community-repo/working-groups/storage-group/NodeSteup/monitoring ~/
$ cd ~/monitoring

```
Review the .env file and provide the variables
```
PROMETHEUS_HOST=prometheus.<your.cool.url>
ADMIN_USER=<username>
ADMIN_PASSWORD=<Password>
GRAFANA_HOST=grafana.<your.cool.url>
```

> Review prometheus.yml and add or remove jobs. Make sure the name of containers/service match.

> Review alert.rules and add or remove alerts. Make sure the name of containers/service match

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
  
```
$ mv docker-compose_service.yml docker-compose.yml
$ mv prometheus_service.yml prometheus.yml

$ docker-compose up -d
$ docker-compose logs -f --tail 100
```

 </details>
