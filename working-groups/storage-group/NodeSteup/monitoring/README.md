

# Configure Prometheus

```
$ git clone https://github.com/joystream/community-repo.git
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

> Review prometheus.yml and add or remove jobs. Make sure the name of containers/services match.




# Alert Manger
<details>
  <summary>only if you want to use alert manager.</summary>
  
- Uncomment alert manager section in docker-compose.yml
- ./monitoring/prometheus/prometheus.yml uncomment:
```
#rule_files:
#  - "alert.rules"
```
```
#alerting:
#  alertmanagers:
#  - scheme: http
#    static_configs:
#    - targets:
#      - 'alertmanager:9093'
```

> Review ./monitoring/prometheus/alert.rules and add or remove alerts. Make sure the name of containers/services match

## Configure Telegram
* Go here and create a Bot: https://core.telegram.org/bots#6-botfather, save:
  - Token
  - Bot's name
* Start the Bot
* Create a channel and invite the bot to the channel as admin
* Test your Bot and get chat ID https://api.telegram.org/bot{token}/getUpdates, save:
  - chat ID
    
## Configure Alert Manger
- ./alertmanager/config.yml

```
receivers:
    - name: 'telegramBot'
      telegram_configs:
      - bot_token: <your token>
        api_url: https://api.telegram.org
        chat_id: <your chat ID>
        parse_mode: ''
```

 </details>
 
# Spin it up

> Note: Make usre the hosting is configured for monitoring. Also make sure you joystream node has the correct flags

```
$ docker-compose up -d
$ docker-compose logs -f --tail 100
```

# Node and Storage are running as service
<details>
  <summary>Node and Storage are running as service</summary>
  

[Go here for the installation guide](./monitoring-systemd/README.md)


 </details>
