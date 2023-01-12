# Configure Telegram
* Go here and create a Bot: https://core.telegram.org/bots#6-botfather, save:
- Token
- Bot's name
* Create a channel and invite the bot to the channel as admin
* Test your Bot and get chat ID https://api.telegram.org/bot{token}/getUpdates, save:
- chat ID

# Configure PROMETHEUS
Review the .env file and provide the variables
```
PROMETHEUS_HOST=<prometheus.your.cool.url>
ADMIN_USER=<username>
ADMIN_PASSWORD=<Password>
GRAFANA_HOST=<grafana.your.cool.url>
```

> Review prometheus.yml and add or remove jobs.

> Review aleret.rules and add or remove alerts

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
```
$ git clone https://github.com/yasiryagi/community-repo.git
$ cp -R community-repo/working-groups/storage-group/NodeSteup/monitoring ~/
$ cd ~/monitoring
$ docker-compose up -d
$ docker-compose logs -f --tail 100
```
