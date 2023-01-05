# [41.DT-1](https://blog.joystream.org/sumer-kpis/#41.DT-1) - A Manifesto for Distributors


## how many workers?
- 6 then 10

The objective is to distribute currently 1.3TB among X nodes for best atlas performance (fast node, close location)
- rough grid:
 - primary families: US, EU, ASIA
 - secondary families: south/central america (SA), africa (AF) - from my research more expensive
 - one family for the line sydney-tokyo-hongkong (at first probably lower demand)
 - I would also experiment with smaller (0.1..1GB) distributors for high demand clusters. Here intelligent (half) automatic bag assignment based on *metrics* (TBD).
 
Start with 6 main workers (1 per primary family) and regional openings for lower amounts.

## Minimum hardware requirements?

- Fastest disk available (SSD)
- 2TB primary cluser, 100GB+ regional (scale up/rplace on demand)

## How many regions are reasonable

6 (rough grid), 3 hot spots++

The amount of workers (ref budget)?
6 in primary regions ($500) with double replication
4 in secondary ($200) for full coverage with low replication*
= 700

[*] a network without redundancy is no network.  low prices means less speed, lower quality services. needs a compromise between redundancy and availability. with one server per region we cannot afford blackouts, with >2 price/GB has to get down. Since this is an ideal scenario and this is still a testnet real costs will start low and build up over time.

Lots of theory, i am here for the fun!

## Where do the requests come from?

I wrote briefly in the [proposal 1100](https://pioneer.joystreamstats.live/#/proposals/1100) comment, this needs more work to combine and anlyze different sources.

## Where should the workers create their nodes?

We are overpresent in EU with SP and can build around that based on needs. Many uploaders are in RU and probably viewers too (check!).

Focus this region + US with 2 fast nodes each, build up with 2 smaller ones for other familiies and try to fill 100Gb.

## What coverage and replication can be reached given all of this?

Depends on the budget. I would try different openings for sizes and regions to find out what is interesting and works.

Every bag should be in 2 buckets but no must because of SP. For more it needs a deeper look at channels per language or requests by county.

## Which commands do you have to make to make your system the way you want?
> create a spreadsheet outlining what bags are in which buckets, including the number of assets and total size of each bag. Include the bucketId (family:index) for each bucket.

This would be a wild guess. Needs size, language per bag (channel) and contact with curators to find a good solution.

As for commands
- create 6 families as outlined above
- identify cyrillic channels ($ru) and assign 2 distributors ($r1, $r2)
```
for $i in $ru ; do
    yarn storage-node leader:update-bag -i dynamic:channel:$i -a $r1 -k $KEY
    yarn storage-node leader:update-bag -i dynamic:channel:$i -a $r2 -k $KEY
done
```
- share english speaking channels ($en1, $en2) among US ($us1, $us2), EU ($eu1, $eu2), ASIA ($as1, $as2)
```
for $i in $en1 ; do
    yarn storage-node leader:update-bag -i dynamic:channel:$i -a $us1 -k $KEY
    yarn storage-node leader:update-bag -i dynamic:channel:$i -a $eu1 -k $KEY
    yarn storage-node leader:update-bag -i dynamic:channel:$i -a $as1 -k $KEY
done 
for $i in $en2 ; do
    yarn storage-node leader:update-bag -i dynamic:channel:$i -a $us2 -k $KEY
    yarn storage-node leader:update-bag -i dynamic:channel:$i -a $eu2 -k $KEY
    yarn storage-node leader:update-bag -i dynamic:channel:$i -a $as2 -k $KEY
done 
```
- weekly re-assign bags that landed in a distant region ([ref](https://github.com/bwhm/helpdesk/tree/giza/roles/distributors-lead#dynamic-bag-creation-policy). This will require effective communication between channel owners and family distributiors (say party). Match could happen via curation (top>down) or with some kind of reward for channel owners (bottom>up). Bucket Operators would collect channels and forward demand to the lead.
- open question:
  - adjust salary to storage held.
  - incentivizes distributors to get more bags assigned (they have little control of they will be demanded and could get filled with dust).
  - process for requesting unassignment of bags (ideally swap similar size bags between buckets), depends on reason. penalty?

## Dynamic Bag Policy (DBP)
 
With 6 families ($RU, $EU, US, $SA, $AF, $AS) it is hard to predict where new content should be placed first.
Is there a functionality to map user origin to a bucket family? Why not :)

Two options:
- place all new bags equally in US, EU, RU (our current main user base, without knowing actual data yet, JSG please share)
```
yarn joystream-distributor leader:update-dynamic-bag-policy -t Channel -p $us:$us1 $eu:$eu1 $ru:$ru2
```

- weekly assessment of new channels together with curators to half-manual reassign
- new $language content to a better region

Distributors do not need to hold everything old and uninteresting. That is what SP are for (and channels owners have to pay to store less demanded items). One big distributor in central europe could hold less demanded but high quality content. And we (freakstatic/me) can offerone slow but big provider (SPB) with 4TB for the rest. Lets see how long that lasts!

With orion and distributor logs is will be possible to drop no-demand channels from distributors or leave it on a cheap one in central europe).

## *where requests come from*

This leads to many questions and options to determine main user base:
- language of uploaded videos (given curators took care that video `language` is set correctly)
- views: tracked by orion
- downloads: could be a requirement for distributors to run a script that collects stats from access logs 

Depending on weighing results for *where do we need how many distributors* may differ.

Orion related issues:
- [future ideas](https://github.com/Joystream/orion/issues/30)
- [discovery node](https://github.com/Joystream/atlas/issues/878)
- [orion queries](https://github.com/Joystream/orion/blob/master/schema.graphql)
- QN: https://orion.joystream.org/graphql (seems to be identical with QNs for current testnet)
- docs has few on [`mostViewedCategories`](https://github.com/search?q=org%3AJoystream+mostViewedCategories&type=code) or [`distributionBucketFamilyGeographicAreas`](https://github.com/search?q=org%3AJoystream+distributionBucketFamilyGeographicAreas&type=code) will have to write.
