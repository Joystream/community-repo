
In order to allow for users to upload and download, you have to setup hosting, with an actual domain as both Chrome and Firefox requires `https://`. If you have a "spare" domain or subdomain you don't mind using for this purpose, go to your domain registrar and point your domain to the IP you want. If you don't, you will need to purchase one.

# Caddy
To configure SSL-certificates the easiest option is to use [caddy](https://caddyserver.com/), but feel free to take a different approach. Note that if you are using caddy for commercial use, you need to acquire a license. Please check their terms and make sure you comply with what is considered personal use.

For the best setup, you should use the "official" [documentation](https://caddyserver.com/docs/).

## DNS

Make sure the below resolve to your server:
- <your.cool.url>
- prometheus.<your.cool.url>
- grafana.<your.cool.url>

## Option 1 - Docker 

```
$ mkdir ~/caddy
$ cd ~/caddy

```

### Configure the `Caddyfile`:

Please note below the names of the follwoing containers
- GraphQl           : graphql-server
- Joystream node    : joystream-node
- Joystream Storange: colossus-1


```
$ nano ~/caddy/Caddyfile
# Modify, and paste in everything below the stapled line

# Prometheus
https://prometheus.<your.cool.url> {
        basicauth /* {
        admin JDJhJDE0JFdVTjhqWW1zODdUUVM1OUJ4amRWb09SNm1Rd1VmVndiQUJjRlRjSnA0U0hjUXQ0bXZIT0Ft
        }
        reverse_proxy prometheus:9090
}

# Grafana
https://grafana.<your.cool.url> {
        reverse_proxy grafana:3000
}

# Storage Node
https://<your.cool.url>/storage/* {
        log {
                output stdout
        }
        route /storage/* {
                uri strip_prefix /storage
                reverse_proxy colossus-1:3333
        }
        header /storage/api/v1/ {
                Access-Control-Allow-Methods "GET, PUT, HEAD, OPTIONS"
                Access-Control-Allow-Headers "GET, PUT, HEAD, OPTIONS"
        }
        request_body {
                max_size 60GB
        }
}

```
### Create docker-compose file

```
$ nano ~/caddy/docker-compose.yml
# make sure all your containers are using the same network
---
version: "3.7"

services:
  caddy:
    image: caddy:2.6
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /root/caddy:/data
      - /root/caddy/Caddyfile:/etc/caddy/Caddyfile

networks:
  default:
    external:
      name: <network -name>
```

### Bring your service up
```
$ docker-compose up -d --build
```


### Test and troubleshoot 

Get the name of the container
```
$ docker ps 
```

Check the log
```
$ docker logs -f -n 100  <container name>
```


Make sure your containers running on the same network
```
$ docker network ls
$ docker network inspect <network name>
```

