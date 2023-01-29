




# Video Platforms
## Youtube 

Hours of contents uploaded per minutes 

![image](https://user-images.githubusercontent.com/4862448/214617329-937f43e2-6a81-416a-8599-c762455ce9ae.png)


| Year                   | 2006 | 2007 | 2008 | 2009 | 2010 | 2011 | 2012 | 2013 | 2014 | 2015 | 2016 | 2017 |
|------------------------|------|------|------|------|------|------|------|------|------|------|------|------|
| Hours uploaded per min | 1    | 3    | 5    | 8    | 12   | 22   | 37   | 53   | 86   | 187  | 336  | 500  |

## Vimeo 

(This year)

Number of videos uploaded daily  : 350,000\
Hours of contents uploaded every minute: 60

# Replication

Joystream implement a replication policy for data los prevention. All videos uploaded are replicated to number of server per the configured replication.\
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

# Storage

## Storage type
- File
- Block (Most appropriate) 
- Object 


![image](https://user-images.githubusercontent.com/4862448/214873516-ed3156bd-e025-4e41-91c5-664e54d0da12.png)

![image](https://user-images.githubusercontent.com/4862448/214873826-ba5d41ba-fb83-455d-82ed-64f3e29dd342.png)


## Capacity 


Below the required storage capacity per year as demand for video upload increase. The numbers below driven form parameters above.

| Hours uploaded per min | 0.01      | 0.05     | 0.25     | 0.5      | 1         | 3         | 8         | 12         | 22         | 53         | 500        |
|------------------------|-----------|----------|----------|----------|-----------|-----------|-----------|------------|------------|------------|------------|
| Number of videos       | 21024     | 105120   | 525600   | 1051200  | 2102400   | 6307200   | 16819200  | 25228800   | 46252800   | 111427200  | 1051200000 |
| Total Storage TB       | 11.755044 | 58.77522 | 293.8761 | 587.7522 | 1175.5044 | 3526.5132 | 9404.0352 | 14106.0528 | 25861.0968 | 62301.7332 | 587752.2   |


## Scaling 

### Vertically 

Scaling vertically by adding move storage per server. 

![image](https://user-images.githubusercontent.com/4862448/214621246-30e12914-a5ec-4097-9ce0-4ca478238717.png)




Sever can scale to 1PB (1000 TB)

Consideration:
- Disk read/write &  IOP ((input/output operations): 100-160 MB/s for HDD

|      | Read/Write | IPOS   | Capacity GB | Reliability (MTBF) | Price per GB (USD) |
|------|------------|--------|-------------|--------------------|--------------------|
| HDD  | 100-130    | 100    | 500-18000   | 50k hrs            | 0.014-0.04         |
| SSD  | 300-500    | 100000 | 250-80000   | 1.5M hrs           | 0.05-0.4           |
| NVME | 3500       | 500000 | 250-4000    | 1.5M hrs           | 0.05-0.5           |

- Bandwidth: IG & 10G
- Cost

| Capacity                     | 10TB | 100TB | 500TB | 1PB  |
|------------------------------|------|-------|-------|------|
| Estimated monthly cost (USD) | 200  | 500   | 1250  | 3000 |


> Note: 100TB and more are HDD which has a lower read/write.

### Recommended servers

|                | Storage  | Bandwidth | 
|----------------|----------|-----------|
| Server stage 1&2 | 10T      | 1G        |
| Server stage 3+ | 100T     | 10G       |

### Horizontally  

Scaling Horizontally by adding more servers, with two options:

1- More worker assign to th existing team members.\
2- More new worker.


![image](https://user-images.githubusercontent.com/4862448/214621362-638d192b-9ee8-4ab4-a91a-d3db2280906e.png)


# Calculation  of required workers

## Formulas
```
Formula: Worker Disk size GB=	 (((uploaded hrs per mins* 60(hr) * 24 (day) * 365 (year))*3600) * (%4k * Bitrate-4k + %1080 * Bitrate1080 + %720 * Bitrate720 + %480 * Bitrate48  ))  / (8 (Bytes) *1000)		
```
```
Formula: Workers= 	MAX(ROUNDUP(Total Storage GB / Worker Disk size GB)* Replication, Replication)											
```

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


## Server - 500T


| Hours uploaded per min | 0.01      | 0.05     | 0.25     | 0.5      | 1         | 3         | 8         | 12         | 22         | 53         | 500      |
|------------------------|-----------|----------|----------|----------|-----------|-----------|-----------|------------|------------|------------|----------|
| Total Storage TB       | 11.755044 | 58.77522 | 293.8761 | 587.7522 | 1175.5044 | 3526.5132 | 9404.0352 | 14106.0528 | 25861.0968 | 62301.7332 | 587752.2 |
| Worker Disk size TB    | 500       | 500      | 500      | 500      | 500       | 500       | 500       | 500        | 500        | 500        | 500      |
| Workers                | 4         | 4        | 4        | 8        | 12        | 32        | 76        | 116        | 208        | 500        | 4704     |



# Proposed scaling plan

- Required metrics to be monitored:
  - Storage system capacity
  - Rate of daily upload
 
* Joystream should follow a combination of vertical and horizontal scaling.
* Each update should be considered at 75% capacity 
* Stages
  - Stage 1 : Bootstrap the system:
    - Capacity : 10T
    - Workers  : 5 (replication + 1)
  - Stage 2 : A horizontal upgrades with exisitng or new team members.
    - Each upgrade:
      -  Capacity : 10T
      -  Workers  : 5 (replication + 1)
    - Limit: 
      - Capacity: 62T
      - Workers : 25
    - New workers to have priority 
  - Stage 3 : Horizontal and Vertical upgrade
    - Stage 3.1: Hire 5 new workers with higher vertical capacity
      - Workers : 5
      - Capacity : 100T 
    - Stage 3.2: Upgrade exisitng workers to a higher virtical capacity 
      - Workers: 30
      - Capacity: 750T 
  - Stage 4: continuous expantion horizonly and Verically (using advanced techniques)
  

If Joystream follows the same growth trajectory of Youtube, it is expect a max of one scaling event in the first 2 years. Followed by mutiple yearly of the years to follow. 



# Refs

- [what-content-dominates-youtube](https://pex.com/blog/what-content-dominates-youtube/)
- [statista](https://www.statista.com/topics/2019/youtube/#topicHeader__wrapper)
- [hard-drive-vs-ssd-vs-nvme](https://www.soladrive.com/hard-drive-vs-ssd-vs-nvme/)
- [diskprices](https://diskprices.com/)



