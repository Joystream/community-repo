# Joystream Distribution WG Content Delivery Network (Joystream CDN)

Reports are now published on the [forum](https://pioneerapp.xyz/#/forum/thread/2).

Additional communication happens in the [#distributors channel](https://discord.com/channels/811216481340751934/933726271832227911) (find discord invite on https://joystream.org).

Guides and templates can be found in the [archive](archive) (Sumer, Giza) and [notion](https://joystream.notion.site/Distribution-1f4cfbbb2e934c79bf20b8db7f019d32) (Olympia, Rhodes, Carthage) and will be added here again over time.

Monitoring and test results: https://joystreamstats.live

## Group Composition

| Worker | Member Id | Member Handle   | Discord                   | Location              | Family | Bucket | Storage       | Specs | Status URL | QN |
|--------|-----------|-----------------|---------------------------|-----------------------|--------|--------|---------------|-------|-----|----|
|      1 |       209 | 0x2bc           | @xJames#8645              | Paris, France         |      1 |      0 | 2x960 Go SSD  | Intel Core i9, 64GB DDR4 | https://dp.0x2bc.com/distributor/api/v1/status | https://dp.0x2bc.com/graphql |
|      2 |       458 | sieemma         | @sieemma#3981             | Kiyv, Ukraine              |      2 |      0 | 2TB SSD       | 8 CPU, 16G RAM | https://sieemmanodes.com/distributor/api/v1/status | https://sieemmanodes.com/graphql |
|      3 |      2233 | klaudiusz       | @klaudiusz.eth#6880       | hetzner, Nuremberg, Germany   |      0 |      0 | 1 TB NVMe SSD | Ryzen 5 3600, 64 GB DDR4 | https://joystream.koalva.io/distributor/api/v1/status | https://joystream.koalva.io/query/graphql |
|      4 |      3655 | goksel          | @GokselAtasert08#9188     | AWS, India |      5 |      0 | 16384 GB      | 4 CPU core, 16GB RAM, 12gbit | https://tiguan08.com/distributor/api/v1/status | https://tiguan08.com/graphql |
|      5 |      3886 | Craci_BwareLabs | @Craci bwarelabs.com#0141 | Singapore |      6 |      0 | 1700 GB SSD NVMe | Intel Xeon-E 2136 - 6c/12t - 3.3 GHz/4.5 GHz, 64 GB ECC | https://joystream-distributor.bwarelabs.com/distributor/api/v1/status | https://joystream-distributor.bwarelabs.com/graphql |
|      6 |      1305 | joystreamstats  | @l1.media#4675            | OVH, Ontario, Canada |     12 |      0 | 155G SSD      | VPS, 2x 2.4 GHz, 4GB RAM |

## Setup

[Report](https://pioneerapp.xyz/#/forum/thread/2)
- [create and configure families](families)
- [create buckets](buckets)
- invite operators
```
yarn joystream-distributor leader:invite-bucket-operator -B 0:0 -w 3
yarn joystream-distributor leader:invite-bucket-operator -B 1:0 -w 1
yarn joystream-distributor leader:invite-bucket-operator -B 2:0 -w 2
yarn joystream-distributor leader:invite-bucket-operator -B 5:0 -w 4
yarn joystream-distributor leader:invite-bucket-operator -B 6:0 -w 5
yarn joystream-distributor leader:invite-bucket-operator -B 12:0 -w 6
```
