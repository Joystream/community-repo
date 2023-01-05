
In order to allow for users to upload and download, you have to setup hosting, with an actual domain as both Chrome and Firefox requires `https://`. If you have a "spare" domain or subdomain you don't mind using for this purpose, go to your domain registrar and point your domain to the IP you want. If you don't, you will need to purchase one.

# Caddy
To configure SSL-certificates the easiest option is to use [caddy](https://caddyserver.com/), but feel free to take a different approach. Note that if you are using caddy for commercial use, you need to acquire a license. Please check their terms and make sure you comply with what is considered personal use.

For the best setup, you should use the "official" [documentation](https://caddyserver.com/docs/).

The instructions below are for Caddy v2.4.1:
```
$ wget https://github.com/caddyserver/caddy/releases/download/v2.4.6/caddy_2.4.6_linux_amd64.tar.gz
$ tar -vxf caddy_2.4.6_linux_amd64.tar.gz
$ mv caddy /usr/bin/
# Test that it's working:
$ caddy version
```

# Configure the `Caddyfile`:
```
$ nano ~/Caddyfile
# Modify, and paste in everything below the stapled line
---
# Joystream-node
wss://<your.cool.url>/rpc {
        reverse_proxy localhost:9944
}


# Query-node
https://<your.cool.url> {
        log {
                output stdout
        }
        route /server/* {
                uri strip_prefix /server
                reverse_proxy localhost:8081
        }
        route /graphql {
                reverse_proxy localhost:8081
        }
        route /graphql/* {
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

# Distributor Node
https://<your.cool.url>/distributor/* {
        log {
                output stdout
        }
        route /distributor/* {
                uri strip_prefix /distributor
                reverse_proxy localhost:3334
        }
        header /distributor {
                Access-Control-Allow-Methods "GET, PUT, HEAD, OPTIONS, POST"
                Access-Control-Allow-Headers "GET, PUT, HEAD, OPTIONS, POST"
        }
}
```
# Check
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

# Run caddy as a service
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



```
