




# Replication

Joystream implement a replication policy for data loss prevention. All videos uploaded are replicated to number of server per the configured replication.\
All the calculation on this page assume a replication of 4.

# Video data rates and Average video length

| RESOLUTION  | BITRATE MBPS | % of Videos | RECORDING DURATION PER GB |
|-------------|--------------|-------------|---------------------------|
| 4K (UHD)    | 20           | 0.01        | 12 minutes                |
| 1080p (FHD) | 8            | 0.19        | 50 minutes                |
| 720p (HD)   | 5            | 0.5         | 3.5 hours                 |
| 480p (SD)   | 2.5          | 0.3         | 8 Hours                   |

| Average video length  | 15 |
|-----------------------|----|


## Capacity 


Below the required storage capacity per year as demand for video upload increase. The numbers below driven form parameters above.

| Hours uploaded per min | 0.01      | 0.05     | 0.25     | 0.5      | 1         | 3         | 8         | 12         | 22         | 53         | 500        |
|------------------------|-----------|----------|----------|----------|-----------|-----------|-----------|------------|------------|------------|------------|
| Number of videos       | 21024     | 105120   | 525600   | 1051200  | 2102400   | 6307200   | 16819200  | 25228800   | 46252800   | 111427200  | 1051200000 |
| Total Storage TB       | 11.755044 | 58.77522 | 293.8761 | 587.7522 | 1175.5044 | 3526.5132 | 9404.0352 | 14106.0528 | 25861.0968 | 62301.7332 | 587752.2   |


## Scaling 


Consideration:
- Disk read/write &  IOP ((input/output operations): 100-160 MB/s for HDD

|      | Read/Write | IPOS   | Capacity GB | Reliability (MTBF) | Price per GB (USD) |
|------|------------|--------|-------------|--------------------|--------------------|
| HDD  | 100-130    | 100    | 500-18000   | 50k hrs            | 0.014-0.04         |
| SSD  | 300-500    | 100000 | 250-80000   | 1.5M hrs           | 0.05-0.4           |
| NVME | 3500       | 500000 | 250-4000    | 1.5M hrs           | 0.05-0.5           |

- Bandwidth: IG & 10G
- Cost

| Capacity                     | 10TB | 50TB  | 100TB | 
|------------------------------|------|-------|-------|
| Estimated monthly cost (USD) | 150  | 250   | 500   | 


#### Advanced techniques
- SAN
- NAS 


### Horizontally  

Scaling Horizontally by adding more servers, with two options:

1- More worker assign to th existing team members.\
2- More new worker.


![image](https://user-images.githubusercontent.com/4862448/214621362-638d192b-9ee8-4ab4-a91a-d3db2280906e.png)


# Calculation  of required workers

## Formulas
>```Formula: Worker Disk size GB=	 (((uploaded hrs per mins* 60(hr) * 24 (day) * 365 (year))*3600) * (%4k * Bitrate-4k + %1080 * Bitrate1080 + %720 * Bitrate720 + %480 * Bitrate48  ))  / (8 (Bytes) *1000)```

>```Formula: Workers= MAX(ROUNDUP(Total Storage GB / Worker Disk size GB)* Replication, Replication)```

Below are three models with a server capacity of 10,100 and 500TB

## Server - 10T


| Hours uploaded per min | 0.01      | 0.05     | 0.25     | 0.5      | 1         | 3         | 8         | 12         | 22         | 53         | 500        |
|------------------------|-----------|----------|----------|----------|-----------|-----------|-----------|------------|------------|------------|------------|
| Number of videos       | 21024     | 105120   | 525600   | 1051200  | 2102400   | 6307200   | 16819200  | 25228800   | 46252800   | 111427200  | 1051200000 |
| Total Storage TB       | 11.755044 | 58.77522 | 293.8761 | 587.7522 | 1175.5044 | 3526.5132 | 9404.0352 | 14106.0528 | 25861.0968 | 62301.7332 | 587752.2   |
| Worker Disk size TB    | 10        | 10       | 10       | 10       | 10        | 10        | 10        | 10         | 10         | 10         | 10         |
| Workers                | 8         | 24       | 120      | 236      | 472       | 1412      | 3764      | 5644       | 10348      | 24924      | 235104     |

## Server - 100T


| Hours uploaded per min | 0.01      | 0.05     | 0.25     | 0.5      | 1         | 3         | 8         | 12         | 22         | 53         | 500      |
|------------------------|-----------|----------|----------|----------|-----------|-----------|-----------|------------|------------|------------|----------|
| Total Storage TB       | 11.755044 | 58.77522 | 293.8761 | 587.7522 | 1175.5044 | 3526.5132 | 9404.0352 | 14106.0528 | 25861.0968 | 62301.7332 | 587752.2 |
| Worker Disk size TB    | 100       | 100      | 100      | 100      | 100       | 100       | 100       | 100        | 100        | 100        | 100      |
| Workers                | 4         | 4        | 12       | 24       | 48        | 144       | 380       | 568        | 1036       | 2496       | 23512    |



# Proposed scaling plan

| Stage   | Started        | Node Size    | Max Number of Node | Max Number of operators | Available Storage in TB | Weekly System evaluation criteria to add a node | Weekly Per worker evaluation criteria to add a node                                                      | Comments |
| ------- | -------------- | ------------ | ------------------ | ----------------------- | ----------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- |
| Stage 1 | Mainnet launch | ~10TB        | 5                  | 5                       | 50TB                    |                                                 |                                                                                                          |          |
| Stage 2 | Period 15      | ~25TB        | 10                 | 10                      | 250TB                   |                                                 |                                                                                                          |          |
| Stage 3 | Period 17      | 50TB         | 30-60              | 30                      | 1250TB-2750TB           | add extra node  at 50%                          | Disable accepting new bags at 70%                                                                        |          |
|         |                |              |                    |                         |                         |                                                 | Add extra node or add disks at 70%                                                                       |          |
|         |                |              |                    |                         |                         |                                                 | Replace node operator at 85%"                                                                            |          |
| Stage 4 | Period y       | 50TB - 100TB | 100-200            | 100                     | 4750TB-9750TB           | Add extra 2 node at 65%                         | Disable accepting new bags at 70%                                                                        |          |
|         |                |              |                    |                         |                         |                                                 | Add extra node or add disks at 70%                                                                       |          |
|         |                |              |                    |                         |                         |                                                 | Replace node operator at 85%"                                                                            |          |

# Improvements to achieve scaling:
- Enable pruning                                                          
- Enable multi node per operator/bucket                                   
- Increase onchain number of operators 
- Consider using sharding                                   

 Consilderation:
- Increase replication                                                             
- change the compensation mode to be: base%+server%+Used storage%+ Unused storage%
  
# Need research 

- [proposals](https://github.com/yasiryagi/community-repo/tree/master/working-groups/storage-group/leader/Proposals) 


# Refs

- [what-content-dominates-youtube](https://pex.com/blog/what-content-dominates-youtube/)
- [statista](https://www.statista.com/topics/2019/youtube/#topicHeader__wrapper)
- [hard-drive-vs-ssd-vs-nvme](https://www.soladrive.com/hard-drive-vs-ssd-vs-nvme/)
- [diskprices](https://diskprices.com/)
- [data-storage](https://www.redhat.com/en/topics/data-storage)



