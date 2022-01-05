# [KPI 36.OP-1](https://blog.joystream.org/sumer-kpis/#36.OP-1)

The goal is to install a [GIZA](https://github.com/Joystream/joystream/tree/giza_staging) validator, storage provider and distributor on a fresh VPS.

## Setup

### Node

See [Network deployment](../Network-deployment)

### Storage

See [storage-node](https://github.com/Joystream/joystream/tree/giza_staging/storage-node-v2).

### Distributor

See [distributor-node](https://github.com/Joystream/joystream/tree/giza_staging/distributor-node).

### Pioneer

```
cd ~/joystream/pioneer
yarn
yarn build:www
rsync -aP packages/apps/build/ /var/www/pioneer
```

To pre-select your endpoint, edit `packages/apps-config/src/settings/endpoints.js` and add
```
  {
    info: 'Joystream Giza',
    text: t('giza-l1dev', 'Joystream Giza (l1dev)', { ns: 'apps-config' }),
    value: 'wss://giza-l1dev.joystream.app/rpc'
  },
```
as first array entry for `createLive` (line 23). Run `yarn build:www` again and you should see:
> i18next-scanner: Added a new translation key { "giza-l1dev": "Joystream Giza (l1dev)" } to "packages/apps/public/locales/en/apps-config.json"

Alternatively it is possible to set `WS_URL` during build time: `WS_URL=wss://myendpoint yarn build:www`

### Atlas

```
git clone htps://github.com/joystream/atlas
cd atlas
yarn
yarn build
rsync -aP dist/ /var/www/atlas
```

- Set DNS record for `atlas` subdomain (depends on your registrar)

- Create `/etc/nginx/sites-available/atlas` to configure nginx site
```
server {
    listen 443 ssl;
    server_name atlas.DOMAIN;

    root /var/www/atlas;
    index index.html;

    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

- Activate site
```
cd /etc/nginx/sites-enabled
ln -s ../sites-available/atlas
```

- Request TLS certificate: `certbot run`, select the subdomain and hit `enter`.

### Nginx

- Install dependencies:
`apt install nginx certbot python3-certbot-nginx`

- Create `/etc/nginx/sites-available/joysream` to configure nginx site
```
server {
    listen 80;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name giza-l1dev.joystream.app;

    root /var/www/joystream; # build atlas or pioneer and move it there
    index index.html;

    location /rpc {
      proxy_pass http://localhost:9944;
      proxy_redirect off;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "Upgrade";
      proxy_set_header Host $host;
      proxy_set_header    X-Real-IP $remote_addr;
    }

    # query node
    location /graphql {
      rewrite /graphql(/.+) $1 break;
      proxy_pass http://localhost:8081;
      proxy_set_header Access-Control-Allow-Methods "GET, PUT, HEAD, OPTIONS";
    }
    location /@apollographql { rewrite (.*) /graphql$1 last; }

    # storage provider
    location /storage {
      rewrite /storage/?(.*) /$1 break;
      proxy_pass http://localhost:3333;
      proxy_set_header Access-Control-Allow-Methods "GET, PUT, HEAD, OPTIONS";
      proxy_set_header Access-Control-Allow-Headers "GET, PUT, HEAD, OPTIONS";
      client_max_body_size 50G;
    }

    # distributor
    location /distributor {
      rewrite /distributor/?(.*) /$1 break;
      proxy_pass http://localhost:3334;
      proxy_set_header Access-Control-Allow-Methods "*";
      proxy_set_header Access-Control-Allow-Headers "*";
    }

    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

- Activate site
```
cd /etc/nginx/sites-enabled
ln -s ../sites-available/joystream
rm default
```

- Request TLS certificate: `certbot run`.
Enter email address, accept the TOS to create a certbot account. The rest happens automatically.
No need to add a redirect because it is already configured above.

Test:
- open Pioneer and choose as custom endpoint: `wss://giza-l1dev.joystream.app/rpc`
- https://giza-l1dev.joystream.app (if pioneer or atlas are set up)
- https://giza-l1dev.joystream.app/graphql
- https://giza-l1dev.joystream.app/storage/api/v1/version
- https://giza-l1dev.joystream.app/storage/api/v1/state/data-objects
- https://giza-l1dev.joystream.app/distributor/


## Configuration

1. Apply as storage provider and distributor, save files to ~/keys/
2. Have the leads fill the openings
3. Get invited to a bucket
4. Verify group memberships
```
$ ~/joystream/cli/bin/run working-groups:overview

Current Group: storageProviders

___________________ Group lead ___________________

Member id:                    2010                                             
Member handle:                storage_lead_giza                                
Role account:                 5GHPwGqcVjt3KKrEUhkgLJaizRymegx5astt4fekGVmL7F4q 

____________________ Members _____________________

Worker id     Member id     Member handle         Stake            Earned     Role account                  
3             515           l1dev                 10.0000 JOY      0          5DNe6u...ATpk38               
2             2012          storage_2             100.0000 JOY     0          5DGQLX...Fai2MW               
1             2012          storage_2             100.0000 JOY     0          5H8CPz...hoWPtP               
0             2010          storage_lead_giza     100.0000 JOY     0          5GHPwG...mL7F4q

$ ~/joystream/cli/bin/run working-groups:overview -g distributors
Current Group: distributors

___________________ Group lead ___________________

Member id:                    2015                                             
Member handle:                dist_lead                                        
Role account:                 5GJWFApQiMqFjhiLWhxtVAjva7fVy7kYAf8mBgME4rGXX4Vy 

____________________ Members _____________________

Worker id     Member id     Member handle     Stake            Earned     Role account                  
2             515           l1dev             100.0000 JOY     0          5DCCUr...qjEvK9               
1             2016          dist_1            100.0000 JOY     0          5GQZGW...m9z7VA               
0             2015          dist_lead         100.0000 JOY     0          5GJWFA...GXX4Vy
```

### Storage Provider

- [Accept invitation](https://github.com/Joystream/joystream/tree/giza_staging/storage-node-v2#storage-node-operatoraccept-invitation)
```
$ ~/joystream/storage-node-v2/bin/run operator:accept-invitation -i 2 -w 3 -k ~/keys/giza-storage-l1dev.json -t 5DNe6ubsQhmcSZRZdBLJroe9qKThW9CsSGRKHiZx8pATpk38
2022-01-04 15:43:26:4326 info: Initialized runtime connection: ws://localhost:9944
2022-01-04 15:43:30:4330 info: Waiting for chain to be synced before proceeding.
2022-01-04 15:43:30:4330 info: Accepting pending storage bucket invitation...
2022-01-04 15:43:30:4330 debug: Sending storage.acceptStorageBucketInvitation extrinsic...
2022-01-04 15:43:36:4336 debug: Extrinsic successful!
```

- set [metadata](https://github.com/Joystream/joystream/tree/giza_staging/storage-node-v2#metadata): [`storage-node operator:set-metadata`](https://github.com/Joystream/joystream/tree/giza_staging/storage-node-v2#storage-node-operatorset-metadata) ([example json](https://github.com/Joystream/joystream/blob/giza_staging/storage-node-v2/scripts/operatorMetadata.json) - [fields](https://github.com/Joystream/joystream/blob/giza_staging/metadata-protobuf/proto/Storage.proto))
```
$ ~/joystream/storage-node-v2/bin/run operator:set-metadata -i 2 -w 3 -j ~/bucket-2-metadata.json -k ~/keys/giza-storage-l1dev.json
2022-01-04 15:46:21:4621 info: Initialized runtime connection: ws://localhost:9944
2022-01-04 15:46:24:4624 info: Waiting for chain to be synced before proceeding.
2022-01-04 15:46:24:4624 info: Setting the storage operator metadata...
2022-01-04 15:46:24:4624 debug: Sending storage.setStorageOperatorMetadata extrinsic...
2022-01-04 15:46:30:4630 debug: Extrinsic successful!
```

### Distributor

See [docs/node](https://github.com/Joystream/joystream/blob/giza_staging/distributor-node/docs/node/index.md)

- Accept invitaiton
```
~/joystream/distributor-node/bin/run operator:accept-invitation -B 2:0 -w 2 -c ~/joystream/distributor-node/config.yml
2022-01-04 16:08:16:816 CLI info: Accepting distribution bucket operator invitation...
{
    "bucketId": {
        "distribution_bucket_family_id": "2",
        "distribution_bucket_index": "0"
    },
    "workerId": 2
}
? Tx fee of 0 will be deduced from you account, do you confirm the transfer? (y/N) y
? Tx fee of 0 will be deduced from you account, do you confirm the transfer? (y/N) y? Tx fee of 0 will be deduced from you account, do you confirm the transfer? Yes
2022-01-04 16:08:22:822 SubstrateApi info: Sending storage.acceptDistributionBucketInvitation extrinsic from 5DCCUrwUZuqBHMMcaswK5rk1DpFNGvuZvoZHWiHYNyqjEvK9
2022-01-04 16:08:24:824 CLI info: Invitation succesfully accepted!
```

- set [metadata](https://github.com/Joystream/joystream/blob/giza_staging/distributor-node/docs/node/index.md#metadata) (or use the [API](https://github.com/Joystream/joystream/blob/giza_staging/distributor-node/docs/api/operator/index.md))
```
~/joystream/distributor-node/bin/run operator:set-metadata -B 2:0 -w 2 -c ~/joystream/distributor-node/config.yml -i ~/distributor-metadata.json
2022-01-04 16:25:29:2529 CLI info: Setting bucket operator metadata...
{
    "bucketId": {
        "distribution_bucket_family_id": "2",
        "distribution_bucket_index": "0"
    },
    "workerId": 2,
    "metadata": {
        "endpoint": "https://giza-l1dev.joystream.app/distributor",
        "location": {
            "countryCode": "US-NJ",
            "city": "Newark",
            "coordinates": {
                "latitude": 40,
                "longitude": 74
            }
        },
        "extra": "Welcome to Joystream GIZA - America branch! -- operated by l1dev (dev@joystreamstats.live)"
    }
}
? Tx fee of 0 will be deduced from you account, do you confirm the transfer? (y/N) y
? Tx fee of 0 will be deduced from you account, do you confirm the transfer? (y/N) y? Tx fee of 0 will be deduced from you account, do you confirm the transfer? Yes
2022-01-04 16:25:39:2539 SubstrateApi info: Sending storage.setDistributionOperatorMetadata extrinsic from 5DCCUrwUZuqBHMMcaswK5rk1DpFNGvuZvoZHWiHYNyqjEvK9
2022-01-04 16:25:42:2542 CLI info: Bucket operator metadata succesfully set/updated!
```

## Runtime
### Staking and Rewards (WGs)

> For each group (incl. Leads), check that:
> - staking and unstaking works as expected
> - rewards are paid out as they should

### Validator Rewards

> The runtime upgrade included a change in these params. For each `era`, get:
>   - total issuance
>   - total stake
>   - total reward
>   - ~blockheight

| Block | Era | Issuance | Stake | % Staked | Era Reward | Action |
|---|---|---|---|---|---|---|
| 0 | 0 | 574460220 | 15000 | 0.0 | 3275 | |
| 6000 | 10 | 574460120 | 15000 | 0.0 | 3275 | |
| 6600 | 11 | 574455020 | 15000 | 0.0 | 5698 | |
| 7200 | 12 | 1000000000 | 200000000 | 20.0 | 58841 | |
| 13200 | 22 | 1000000000 | 200000000 | 20.0 | 58841 | |
| 13800 | 23 | 999999800 | 200000000 | 20.0 | 14805 | |
| 14400 | 24 | 999999700 | 200000000 | 20.0 | 14780 | |
| 15000 | 25 | 999999700 | 100007500 | 10.0 | 10250 | |
| 15600 | 26 | 999999600 | 100007500 | 10.0 | 10250 | |
| 16200 | 27 | 999999600 | 100007500 | 10.0 | 10250 | |
| 16800 | 28 | 999999600 | 200000000 | 20.0 | 14805 | |
| 151800 | 253 | 999999500 | 200000000 | 20.0 | 14805 | |
| 152400 | 254 | 999999500 | 200000000 | 20.0 | 14780 | |
| 153000 | 255 | 999999500 | 200000000 | 20.0 | 14805 | |
| 161400 | 269 | 999999400 | 200000000 | 20.0 | 14805 | |
| 162000 | 270 | 999999400 | 200500000 | 20.1 | 14828 | |
| 187800 | 313 | 999999400 | 200500000 | 20.1 | 14828 | |
| 188400 | 314 | 999999400 | 200500000 | 20.1 | 15397 | |
| 192000 | 320 | 1099991546 | 200500000 | 18.2 | 15397 | |

## Storage

1. What happens when a storage node runs out of (local) storage?
  - eg. the bucket is configured to accept 100GB, whereas the node runs out at 80GB
2. What happens when a bucket is full (ref. bucket config on-chain) and you upload more from a channel where it's assigned to accept from?
3. What happens when a bucket is full (ref. bucket config on-chain) and you assign a new bag to it?
4. What happens when a SP node, that is the only source of some data goes down?
  - Cases:
    1. No distributor has it (or is assigned): Try to assign the channel bag to another SP, and use the re-upload command (cli and/or atlas)
    2. One or more distributors has it (and is assigned): Try to assign the channel bag to another SP, and use the re-upload command (cli and/or atlas)
    3. One or more distributors has it (and is assigned): Try to assign the channel bag to another SP, and try to fetch 5it from the distributor
5. How does the blacklist work?
  - Cases:
    1. One distributor has (and is assigned) the file. asset it get censored in atlas?
      - What happens if you upload the asset again?
    2. No distributor has the file (or is assigned). When one gets assigned it, does it get it?
      - What happens if you upload the asset again?

### CLI

> - Check that doing `--help` for all commands
>  - provides a useful description
>  - everything is correct
>  - syntax is consistent

See [Commands](Commands.md#storage)

## Distributor

1. What happens when a distributor node runs out of storage?
  - eg. the bucket is configured to accept 100GB, whereas the node runs out at 80GB

### CLI

> - Check that doing `--help` for all commands
>  - provides a useful description
>  - everything is correct
>  - syntax is consistent
>  - all the examples are correct

See [Commands](Commands.md#distributor)

No help:
- start
- dev:batchUpload
- node:*
- leader:cancel-invitation
- leader:create-bucket-family
- leader:delete-bucket-family
- leader:invite-bucket-operator
- leader:remove-bucket-operator
- leader:set-bucket-family-metadata
- leader:set-buckets-per-bag-limit
- leader:update-bucket-mode

# Hours

| Date        | Hours | Task                                           |
|-------------|-------|------------------------------------------------|
| Jan 2 13-17 |     4 | start node, storage provider, distributor      |
| Jan 4 15-18 |     3 | storage provider and distributor configuration |
| Jan 4 19-22 |     3 | check commands, validator eras                 |
