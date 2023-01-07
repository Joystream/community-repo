# Joystream Distribution WG Content Delivery Network (Joystream CDN)

Reports are now published on the [forum](https://pioneerapp.xyz/#/forum/thread/2).

Additional communication happens in the [#distributors channel](https://discord.com/channels/811216481340751934/933726271832227911) (find discord invite on joystream.org).

Guides and templates can be found in the [archive](archive) (Sumer, Giza) and [notion](https://joystream.notion.site/Distribution-1f4cfbbb2e934c79bf20b8db7f019d32) (Olympia, Rhodes, Carthage) and will be added here again over time.

Monitoring and test results: https://joystreamstats.live

## Group Composition

| Worker | Member Id | Member Handle   | Discord                   | Location              | Family | Bucket | Storage       | Specs |
|--------|-----------|-----------------|---------------------------|-----------------------|--------|--------|---------------|-------|
|      1 |       209 | 0x2bc           | @xJames#8645              | Paris, France         |      1 |      0 | 2x960 Go SSD  | Intel Core i9, 64GB DDR4 |
|      2 |       458 | sieemma         | @sieemma#3981             | Kiyv, EU              |      2 |      0 | 2TB SSD       | 8 CPU, 16G RAM |
|      3 |      2233 | klaudiusz       | @klaudiusz.eth#6880       | hetzner / nuremberg   |      0 |      0 | 1 TB NVMe SSD | Ryzen 5 3600, 64 GB DDR4 |
|      4 |      3655 | goksel          | @GokselAtasert08#9188     | India, AWS            |      5 |      0 | 16384 GB      | 4 CPU core, 16GB RAM, 12gbit |
|      5 |      3886 | Craci_BwareLabs | @Craci bwarelabs.com#0141 |                       |        |        |               | |
|      6 |      1305 | joystreamstats  | @l1.media#4675            | OVH, Ontario / Canada |     12 |      0 | 155G SSD      | VPS, 2x 2.4 GHz, 4GB RAM |

## Setup

- [create and configure families](families)
- [create buckets](buckets)
- invite operators
```
yarn joystream-distributor leader:invite-bucket-operator -B 0:0 -w 3
yarn joystream-distributor leader:invite-bucket-operator -B 1:0 -w 1
yarn joystream-distributor leader:invite-bucket-operator -B 2:0 -w 2
yarn joystream-distributor leader:invite-bucket-operator -B 5:0 -w 4
yarn joystream-distributor leader:invite-bucket-operator -B 12:0 -w 6
```