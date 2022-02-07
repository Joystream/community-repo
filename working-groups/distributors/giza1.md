# Giza - Council 42

First complete [Giza](..) term. Lead: @l1dev

## [42.DT-1 - Maintain Distributor System](https://blog.joystream.org/sumer-kpis/#42.DT-1)

> As of block #4,307,237, the status is:
> - 9 (5+Lead hired by non-Jsg) workers
> - 4 (new) families created (6 in total)
> - 6 (new) buckets created (9 in total)
> - 2 (new) are acceptingNewBags and distributing (4 in total)
> - 3 (new) have accepted invite+set metadata (6 in total)
> - 5/6 have working, running nodes

- [Families](#families)
- [Quality of Service](#qos)
- [Config](#config)
- [Workers](#workers)
- [Log](#log)

## Distribution Bucket Families

Preliminary targets during Giza based on [this abstract](Distribution_Concept.md). Bucket details: https://joystreamstats.live/distribution
> primary families: US, EU, ASIA
> secondary families: south/central america (SA), africa (AF) - from my research more expensive

The strategy was to find at least 1 worker per family and compare prices per TB and latency.

| # | Family                      |       Distributing | Hired         | Capacity TB | Target Providers | Target Capacity TB |
|---|-----------------------------|--------------------|------------------|----------|------------------|-----------------|
| 0 | Temporary                   |              @bwhm |                  |          |                  |                 |
| 1 | Central and northern Europe | @razumv @maxlevush @art_khabibullin | | 5.7      |                2 | 2               |
| 2 | Russia and eastern Europe   | @lkskrn@Ilichhh @MikeShipa (@l1dev) | | 5.5 (4 HDD) |             2 | 2 TB            |
| 3 | North America (east)        | @l1dev            |                   | .1       |                2 | 1 TB            |
| 4 | Central and South America   |                   |                   |          |                1 | 500 GB          |
| 5 | North Africa                |                   |                   |          |                1 | 100 GB          |
| 6 | East and South East Asia    | @igrex            | @leetjoy          | 2.39     |                2 | 1 TB            |
| 7 | Australia                   | @l1dev            |                   | .1       |                1 | .1              |


## Quality of Service

> Outline a quick approach to measuring the "quality of service" for each node, that takes into accout ...

### What is QoS

> [Quality of service](https://en.wikipedia.org/wiki/Quality_of_service) (QoS) is the description or measurement of the overall performance of a service, such as a telephony or computer network or a cloud computing service, particularly the performance seen by the users of the network. To quantitatively measure quality of service, several related aspects of the network service are often considered, such as packet loss, bit rate, throughput, transmission delay, availability, jitter, etc.

Example: [Network traffic](https://www.paloaltonetworks.com/cyberpedia/what-is-quality-of-service-qos)

> In the field of computer networking and other packet-switched telecommunication networks, quality of service refers to traffic prioritization and resource reservation control mechanisms rather than the achieved service quality. Quality of service is the ability to provide different priorities to different applications, users, or data flows, or to guarantee a certain level of performance to a data flow.

### Latency

> ... ping/latency whether the object is in cache or not/whether they first have to get it from an SP or not.
> Every day, measure how well each of them performs under said conditions.

To verify bag availability per bucket from anywhere: https://joystreamstats.live/distributors

This shows the latency for a simple head request to the first bag of each bucket. Randomization can help to find *holes* (see [availability](#availability)).

Automated regular latency tests from different locations will be more meaningful over time to measure provider performance. The [scripts/sp-downloader-tester/
](../../scripts/sp-downloader-tester) could be updated for that task.

### Availability

#### Goals

A complete availability test for each provider to measure their performance (usability, latency).

#### Scope

This test informs providers to cache an object by either requesting (parts) or with a `HEAD` request and records latency for each.

#### Notes

Excessive tests can distort request stats and confuse cache algorithms. If the test is designed to request each object once per day it can be easily subtracted from stats.

Bag Assignment: For meaningful results each bucket needs to be assigned to assets ([bags](https://github.com/joystream/helpdesk/tree/master/roles/distributors-lead#bags)) most relevant for that region. 

## Config
> Get a ("censored") version of each distributors config.yml file, share them, and propose/require changes.

```
id: test-node # change to: `<countryCode>-<familyId>-<bucketIndex>-<memberID>-<handle>` for example *ca-3-0-515-l1dev* (need to be unique to identify test results)
endpoints:
  queryNode: https://distributor.razumv.tech/server/graphql  # ideally this is your own node, ask co-workers for help.
  joystreamNodeWs: wss://distributor.razumv.tech/rpc         # use  ws://localhost:9944 for local connections when fully synced
directories:
  assets: ./local/data                                       # can be any directory or mountpoint, see role guide
  cacheState: ./local/cache                                  # ^
logs:
  file:
    level: debug
    path: ./local/logs                       # same. just keep it in mind to know where to look when needed. for *.bashrc*: `alias dnlog="journalctl -f -n 200 -u distributor-node"`
    maxFiles: 30 # 30 days or 30 * 50 MB     # 30 sounds sensible. the latency test script will be run at least weekly to anylize logs.
    maxSize: 50485760 # 50 MB
  console:
    level: verbose                           # adjust to your needs for testing, should run as system service with log file during production (see guide).
  # elasti
  #   level: info
  #   endpoint: http://localhost:9200/       # this will become interesting: https://www.elastic.co/elasticsearch/
limits:
  storage: 100G				     # **IMPORTANT** small (default) = higher rotation, will directly influence salary, set to max available with buffer for the validator.
  maxConcurrentStorageNodeDownloads: 100     #  also understand in detail: https://github.com/Joystream/joystream/blob/master/distributor-node/docs/node/index.md#caching
  maxConcurrentOutboundConnections: 300
  outboundRequestsTimeoutMs: 5000
  pendingDownloadTimeoutSec: 3600
  maxCachedItemSize: 1G
intervals:
  saveCacheState: 60
  checkStorageNodeResponseTimes: 60
  cacheCleanup: 60
publicApi:
  port: 3334
operatorApi:
  port: 3335
  hmacSecret: not-a-good-password
keys:
workerId: 0                                  # also important
```

## Costs

target budget:
> 6 in primary regions ($500) with double replication
> 4 in secondary ($200) for full coverage with low replication*
= 700 / month - to stay below $900 in F72 https://docs.google.com/spreadsheets/d/1j-YGq6NyqwCmA2wMdKNHMqicosUXzDFEx6lrxhvwaFI/edit#gid=0

Sever cost total: `$768` (without setup fee).

See [Discussion](https://pioneer.joystreamstats.live/#/forum/threads/943) about salary models.

## Workers

This simple model pays 25% increased server costs to insure for good performance and high responsiveness.                                                        
| Member         | Worker | Bucket | Location | Cache TB |      GB/$ | cost $/m | cost+25% | salary $/w |   MtJOY/w | payouts | tJOY/payout |
|---|---|---|---|---|---|---|---|---|---|---|---|
| bmwh           |      1 |    0:0 | Frankfurt/M |       |        |          |       0 |         0 |        0 |         |         |
| maxlevush      |      2 |    1:0 | Helsinki    |   1.7 |      29.8 |       57 |    71.25 |      17.81 |       2.9 |      84 |       34905 |
| razumv         |      3 |    1:1 | Helsinki    |     4 |     133.3 |       30 |     37.5 |       9.37 |       1.5 |      84 |       18371 |
| art_khabibulin |      4 |    1:2 | Munich      |    .5 |     0.025 |       20 |      25. |       6.25 |         1 |      84 |       11904 |
| ilich          |      6 |    2:0 | Novosibirsk |    .5 |      11.3 |       44 |       55 |      13.75 |       2.2 |      28 |       80834 |
| lkskrn         |      7 |    2:1 | Moscow      |   .48 |       9.4 |       51 |    63.75 |      15.93 |       2.6 |      28 |       93694 |
| oxygen         |      8 |    2:2 | Moscow      |   .43 |       9.1 |       47 |    58.75 |      14.68 |       2.4 |      28 |       86346 |
| l1dev          |      5 |    2:3 | Petersburg  |     4 |     117.6 |       34 |     42.5 |      10.62 |       1.7 |      84 |       20821 |
| l1dev          |      5 |    3:0 | Quebec      |    .1 |         5 |       20 |      25 |       6.25 |       1.0 |      84 |       12247 |
| leet_joy       |      9 |  (2:4) | Vladivostok |   .48 |         3 |      160 |     200 |        50. |       8.2 |      28 |      293944 |
| leet_joy       |      9 |    6:0 | Singapore   |  1.75 |       9.7 |      180 |     225 |      56.25 |       9.2 |      28 |      330687 |
| igrex          |     10 |    6:1 | Tokio       |   .64 |         4 |      160 |     200 |        50. |       8.2 |      28 |      293944 |
| l1dev          |      5 |    7:0 | Sydney      |    .1 |         5 |       20 |      25 |       6.25 |       1.0 |      28 |       36743 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Total          |        |        |             | 13.9 | 30.7 |      768 |     960 |       240. | 39.5 |     504 |   78385 |

Following is a commented sample cost calculation for selected workers only (preparing these manually takes time and needs to be automated based on the choosen model).

## ilich (6)

### Bucket `2:0`

- Hired at block: `#4295315`
- Functional at: `#4330964`
- Setup time: `59h`
- Capacity: `.5 TB`
- Type: `SSD`
- Cost: `$44` monthly

| reward calculation per bucket                                      |                         2:0 |    $   |
|---|---|---|
| monthly costs + 25%                                                |                         +55 |    55 |
| GB/$ bonus: equivalent value in $                                  |                      +11.36 | 66.36 |
| rarity factor:  target buckets in fam / buckets in fam             |                        *.66 | 43.56 |
| location factor: 1.5=primary, 1.2 secondary, 1 regional)           |                        *1.5 | 65.34 |
| cap at $200/term and convert to possible term salary (/4)          |                          /4 | 16.33 |
| setup bonus: +$80                                                  |                         +80 | 86.33 |
| setup time from hiring to functional node: -$1/h                   | -59 | 37.33 |
| response time on incidents ($1 penalty per hour, fire at 0 salary) |                             | 37.33 |
| latency penalty: average latency in ms /100                        |                             | 37.33 |
| Paid this term                                                     |                             | 37.33 |
|---|---|---|| Total                                                              |                             | 37.33 |

This would leave the worker with a term reward of $37.33 at monthly costs at $44.

Expected salary next term (without penalties): $16.33 ($65.34/m)

## oxygen (8)

### Bucket `2:2`

- Hired at block: `#4295315`
- Functional at: `#4341647`
- Setup time: `77h`
- Capacity: `.48 TB`
- Type: `SSD`
- Cost: `$47` monthly

| reward calculation per bucket                                      |                          2:2 |      $ |
|---|---|---|
| monthly costs + 25%                                                |                        58.75 |  58.75 |
| GB/$ bonus: equivalent value in $                                  |                         9.14 |  57.89 |
| rarity factor:  target buckets in fam / buckets in fam             |                  *0.66 (2/3) |  38.21 |
| location factor: 1.5=primary, 1.2 secondary, 1 regional)           |                         *1.5 |     57 |
| cap at $200/term and convert to possible term salary (/4)          |                           /4 |  14.33 |
| setup bonus: +$80                                                  |                          +80 |     80 |
| setup time from hiring to functional node: -$1/h                   | -77 |      3 |
| response time on incidents ($1 penalty per hour, fire at 0 salary) |                              |        |
| latency penalty: average latency in ms /100                        |                              |        |
| Paid this term                                                     |                       -17 | 0 |
|---|---|---|
| Total                                                              |                              |        |

This would leave the worker with a term reward of $0 at monthly costs of $340.

Expected salary next term (without penalties): $14.33 ($38.21/m)

In this case a restrictive lead who hired more workers than targeted punishes the worker. In response bucket workers could coordinate for one or more to switch into less crowded regions following month.

If a similar model is applied future reports could be generated by a script based on input by the lead (cost).

### leet_joy (9)

Example criteria for performance based salary with real values. Final value defines salary for coming term.

### Bucket `6:0`

- Hired at block: `#4295315`
- Functional at: `#4367580`
- Setup time: `120h`
- Capacity: `1.75 TB`
- Type: `SSD`
- Cost: `$180` monthly

| reward calculation for bucket                                      |      6:0 |      $ |
|---|---|---|
| monthly costs + 25%                                                |     +225 |    225 |
| GB/$ bonus: equivalent value in $                                  |    +9.71 | 234.71 |
| rarity factor:  target buckets in fam / buckets in fam             | *1 = 2/2 | 234.71 |
| location factor: 1.5=primary, 1.2 secondary, 1 regional)           |     *1.5 | 352.06 |
| cap at $200/term and convert to possible term salary (/4)          |       50 |     50 |
| setup bonus: +$80                                                  |      +80 |    130 |
| setup time from hiring to functional node: -$1/h                   |     -120 |     10 |
| response time on incidents ($1 penalty per hour, fire at 0 salary) |          |     10 |
| latency penalty: average latency in ms /100                        |          |     10 |
| Paid this term                                                     |        0 |     10 |
|---|---|---|
| Total                                                              |          |     10 |

During the first term salary was $80 for all and not individual like in these examples. The full setup bonus could only be reached by providers who were up early.

### Bucket (`2:4`)

The worker decided to add another VPS for a bucket in Vladivostok. Formalizing this process allows workers to react to demand and set up nodes in agreement with the lead (after receiving a bucket invitation) and is responsibility of lead to stay within budget - if necessary close buckets or reprioritize regions (`rarity` factor). These changes should be announced with enough time for providers to adjust (2 weeks).

- Functional at: ``
- Setup time: `` 
- Capacity: `.48 TB`
- Type: `SSD`
- Cost: `$160` monthly

| reward calculation per bucket                                      |                   (2:4) |      $ |
|---|---|---|
| monthly costs + 25%                                                |                +200 |    200 |
| GB/$ bonus: equivalent value in $                                  |                  +3 |    203 |
| rarity factor:  target buckets in fam / buckets in fam             | /2 = 2/4 (now 3) |    102 |
| location factor: 1.5=primary, 1.2 secondary, 1 regional)           |                *1.5 |    151 |
| cap at $200/term and convert to possible term salary (/4)          |                  /4 |  37.75 |
| setup bonus: +$80                                                  |                 +80 | 117.75 |
| setup time from hiring to functional node: -$1/h                   |                     | 117.75 |
| response time on incidents ($1 penalty per hour, fire at 0 salary) |                     | 117.75 |
| latency penalty: average latency in ms /100                        |                     | 117.75 |
| Paid this term                                                     |                   0 | 117.75 |
|---|---|---|
| Total                                                              |                     | 117.75 |

This would leave the worker with a term reward of $151.75 at monthly costs at $340.

Expected salary next term (without penalties): $87.57 ($350/m)


## Log
> For each of these:
> - keep a log of the status, and share a TL;DR update every day (starting from #4323600)
> - record ALL transactions you as the Lead does, including blockheights and purpose (for moving bags, just do did x across blocks[a,b])
> - share the thoughts behind your actions

Since i was [hired](https://pioneer.joystreamstats.live/#/proposals/1112) at block #4290298:
- added 5 families and announced in #distributors [read](https://discord.com/channels/811216481340751934/933726271832227911/938468669753815160)
  - `storage.updateDistributionBucketMode` https://pioneer.joystreamstats.live/#/explorer/query/4291331
  - `storage.DistributionBucketFamilyCreated`
  - `storage.setDistributionBucketFamilyMetadata` https://pioneer.joystreamstats.live/#/explorer/query/4291537
```
yarn joystream-distributor leader:set-bucket-family-metadata -f 2 -i ~/distribution-family2.json
yarn run v1.22.15
$ /home/joystream/joystream/node_modules/.bin/joystream-distributor leader:set-bucket-family-metadata -f 2 -i /home/joystream/distribution-family2.json
2022-02-02 13:24:27:2427 CLI info: Setting bucket family metadata
{
    "familyId": 2,
    "metadata": {
        "region": "ru_eu-east",
        "description": "Russia and eastern Europe",
        "latencyTestTargets": [],
        "areas": [
            {
                "continent": 5
            },
            {
                "continent": 6
            }
        ]
    }
}
? Tx fee of 0 will be deduced from you account, do you confirm the transfer? Yes
2022-02-02 13:24:40:2440 SubstrateApi info: Sending storage.setDistributionBucketFamilyMetadata extrinsic from 5EEucXxsz1jZhF5HwQ38cNn5LuZa7RquHquzzyKfnVc1trMy
2022-02-02 13:24:42:2442 CLI info: Bucket family metadata succesfully set/updated!
```
- [filled opening](https://discord.com/channels/811216481340751934/933726271832227911/938505805861388379) [Distributors in Russia and eastern Europe](https://discord.com/channels/811216481340751934/933726271832227911/938448051121578004) (created block #4293044), hired: lkskrn, ilich, oxygen
- added all channels to bucket `2:3` to cache everything
```
Process was interrupted at channel 862:
$ /home/pioneer/joystream/node_modules/.bin/joystream-distributor leader:update-bag -f 2 -a 3 -b dynamic:channel:862 -y
2022-02-03 04:40:11:4011 CLI info: Updating distribution buckets for bag...
{
    "bagId": {
        "Dynamic": {
            "Channel": "862"
        }
    },
    "familyId": 2,
    "add": [
        3
      ],
    "remove": []
}
2022-02-03 04:40:11:4011 SubstrateApi info: Sending storage.updateDistributionBucketsForBag extrinsic from 5EEucXxsz1jZhF5HwQ38cNn5LuZa7RquHquzzyKfnVc1trMy
2022-02-03 04:40:11        RPC-CORE: submitAndWatchExtrinsic(extrinsic: Extrinsic): ExtrinsicStatus:: 1014: Priority is too low: (10000000 vs 10000000): The tansaction has too low priority to replace another transaction already in the pool.
```
- [filled opening](https://discord.com/channels/811216481340751934/933726271832227911/938536960925003807) [Distributor in Asia (east, south east) ](https://discord.com/channels/811216481340751934/933726271832227911/938514940619268147) (created block #4295672), hired: igrex, leet_joy (coolene)
- created opening [￼ Distributor in Central and South America ￼](https://discord.com/channels/811216481340751934/933726271832227911/938557848294678598) at block #4297360:
> ~/cli working-groups:createOpening -i ~/distributor-opening.json -g distributor
```
[
    {
        "activateAt": { "CurrentBlock": null },
        "maxReviewPeriodLength": 432000,
        "applicationStake": { "mode": "AtLeast", "value": 50000 },
        "roleStake": {"mode": "AtLeast", "value": 1000000 }
    },
    {
        "version": 1,
        "headline": "Distributor in Central and South America",
        "job": {
            "title": "Looking for SA Distributors",
            "description": "Requirements: SSD, 500+ GB Storage, synced validator and query node."
        },
        "application": {
            "sections": [
                {
                    "title": "About you",
                    "questions": [
                        { "title": "Your name", "type": "text" },
                        { "title": "What makes you a good fit for the job?", "type": "text area" }
                    ]
                }
            ]
        },
        "reward": "40k tJOY per 1200 blocks ($80 / week)",
        "creator": { "membership": { "handle": "l1dev"  } },
        "process": { "details": [] }
    }
]
```
- 2022-02-03 00:40:58:4058 CLI info: Updating distribution bucket mode... Bucket mode succesfully updated! (`-B 6:0 -d off`)
- 2022-02-03 00:41:14:4114 CLI info: Updating distribution bucket mode...Bucket mode succesfully updated! (`-B 6:1 -d off`)
- 2022-02-03 01:12:53:1253 CLI info: Setting bucket operator metadata... (with wrong endpoint)
- 2022-02-03 01:14:53:1453 CLI info: Updating distribution bucket status... Bucket status succesfully updated! (`-B 2:3 -a yes`)
- 2022-02-03 02:37:43:3743 CLI info: Updating distribution bucket status... Bucket mode succesfully updated! (`-B 2:1 -a yes`)
- 2022-02-03 02:41:09:419 CLI info: Updating distribution bucket mode... Bucket mode succesfully updated! (-B 2:2 -d off``)
- 2022-02-03 04:41:27:4127 CLI info: Updating dynamic bag policy... Dynamic bag creation policy succesfully updated! (`-t Channel -p 1:2 2:2`)
- added RU channels to bucket `2:1` in moscow:
```
set -e
cd ~/joystream/distributor-node

# found with query { channels (where: { language: { iso_eq: "ru" } }) { id } }
# needs confirmation with curators that these were all
ru="734 735 736 737 738 746 750 752 753 755 758 764 765 769 772 774 779 781 782 783 785 786 787 788 790 791 800 801 802 803 804 806 808 810 811 817 818 819 826 827 828 831 832 835 836 839 842 843 844 846"

for i in $ru ; do
  yarn joystream-distributor leader:update-bag -f 2 -a 1 -b dynamic:channel:$i -y
done
---
Finished with:
$ /home/pioneer/joystream/node_modules/.bin/joystream-distributor leader:update-bag -f 2 -a 1 -b dynamic:channel:846 -y
2022-02-03 07:37:41:3741 CLI info: Updating distribution buckets for bag...
{
    "bagId": {
        "Dynamic": {
            "Channel": "846"
        }
    },
    "familyId": 2,
    "add": [
        1
    ],
    "remove": []
}
2022-02-03 07:37:41:3741 SubstrateApi info: Sending storage.updateDistributionBucketsForBag extrinsic from 5EEucXxsz1jZhF5HwQ38cNn5LuZa7RquHquzzyKfnVc1trMy
2022-02-03 07:37:43:3743 CLI info: Bag succesfully updated!
```
- 2022-02-03 19:04:48:448 CLI info: Updating distribution bucket mode... Bucket mode succesfully updated! (`-B 1:0 -d on`)
- 2022-02-03 19:28:34:2834 CLI info: Updating distribution bucket status... Bucket status succesfully updated! (`-B 1:0 -a yes`)
- 2022-02-03 23:51:06:516 CLI info: Setting bucket operator metadata... to fix `metadata.endpoint`
- [adjusted worker rewards](https://discord.com/channels/811216481340751934/933726271832227911/938942029344407563) for all operational nodes to $80 per term (120k/3600 blocks, 40k/1200 blocks)
- 2022-02-04 16:38:50:3850 CLI info: Updating distribution bucket mode... `-B 1:0 -d of` - uses wrong chain
- 2022-02-04 16:39:22:3922 CLI info: Updating distribution bucket status... `-B 1:0 -a no` and fixed some time later.
- 2022-02-04 21:58 toggled bucket `2:0` a few times for testing
- [#4324724](https://pioneer.joystreamstats.live/#/explorer/query/4324724)++: add mixed `en-ru` bags to bucket `2:1` (745 751 760 761 762 768 770 778)
- #4330964++: add ru en-ru asia bags to bucket 2:0
- #4331741++: add ru en-ru asia bags to bucket 2:2
- 2022-02-05 19:35 deployed https://joystreamstats.live/distribution
-  2022-02-05 19:42: `1-2` accepting + distributing
-  2022-02-05 19:42: `2-2` accepting + distributing
- 2022-02-05 19:43: 745 751 760 761 762 768 770 - add to `1-2`, remove from `0:0`
- 2022-02-06 22:07:01: create buckets for families 3 and 7, invite worker 5 to both, set `accepting=yes`, add one bag, both are up.
- [4341647](https://discord.com/channels/811216481340751934/933726271832227911/939682886867636275): reward worker 8
- [4341651](https://discord.com/channels/811216481340751934/933726271832227911/939682987258302534): reward worker 4
- [4347096](https://discord.com/channels/811216481340751934/933726271832227911/939820266811437106): reward worker 6
- `leader:update-bag -f 0 -r 0 -b dynamic:channel:776`
- `leader:update-bag -f 6 -a 1 -b dynamic:channel:776`
- 2022-02-06 13:31: Bucket `6:1 is u! `leader:update-bucket-mode -B 6:1 -d on -y` + `leader:update-bucket-status -B 6:1 -a yes -y`
- [4350105](https://discord.com/channels/811216481340751934/933726271832227911/939682987258302534): reward worker 10
- [4367580](https://discord.com/channels/811216481340751934/933726271832227911/940336769130459206): reward worker 9
```
yarn joystream-distributor leader:update-bag -f 1 -a 2 -b dynamic:channel:777 -y
yarn run v1.22.17
$ /home/pioneer/joystream/node_modules/.bin/joystream-distributor leader:update-bag -f 1 -a 2 -b dynamic:channel:777 -y
2022-02-05 23:17:26:1726 CLI info: Updating distribution buckets for bag...
{
    "bagId": {
        "Dynamic": {
            "Channel": "777"
        }
    },
    "familyId": 1,
    "add": [
        2
    ],
    "remove": []
}
2022-02-05 23:17:26:1726 SubstrateApi info: Sending storage.updateDistributionBucketsForBag extrinsic from 5EEucXxsz1jZhF5HwQ38cNn5LuZa7RquHquzzyKfnVc1trMy
 ›   Error: Extrinsic failed! Extrinsic execution error: DistributionBucketIsBoundToBag ( Distribution bucket is bound to a bag.)
```
what does this mean? the bag is not bound to this bucket yet. Better to say clearly if `BagsPerBuckLimit` is reached.
