




# Model

## Youtube 

Hours of contents uploaded per minutes 

![image](https://user-images.githubusercontent.com/4862448/214617329-937f43e2-6a81-416a-8599-c762455ce9ae.png)


| 2006 | 2007 | 2008 | 2009 | 2010 | 2011 | 2012 | 2013 | 2014 | 2015 | 2016 | 2017 |
|------|------|------|------|------|------|------|------|------|------|------|------|
| 1    | 3    | 5    | 8    | 12   | 22   | 37   | 53   | 86   | 187  | 336  | 500  |

## Vimeo 

(This year)

Number of videos uploaded daily  : 350,000

Hours of contents uploaded every minute: 60

# Replication

Joystream implement a replication policy for data los prevention. All videos uploaded are replicated to number of server per the configured replication.

All the calaculation on this page assume a replication of 4.

# Capacity 


Below the required storage capacity per year as demand for video upload increase. The numbers below driven form Youtube annd Vimeo data above.

| Hours uploaded per min | 0.01      | 0.05     | 0.25     | 0.5      | 1         | 3         | 8         | 12         | 22         | 53         | 500        |
|------------------------|-----------|----------|----------|----------|-----------|-----------|-----------|------------|------------|------------|------------|
| Number of videos       | 21024     | 105120   | 525600   | 1051200  | 2102400   | 6307200   | 16819200  | 25228800   | 46252800   | 111427200  | 1051200000 |
| Total Storage TB       | 11.755044 | 58.77522 | 293.8761 | 587.7522 | 1175.5044 | 3526.5132 | 9404.0352 | 14106.0528 | 25861.0968 | 62301.7332 | 587752.2   |


# Scaling 

## Vertically 

Scaling vertically by adding move storage per server. 

Initial recommended Joystream storage per server is 10T.

Sever cán scale to 1PB (1000 TB)

Consideration:
- IOP ((input/output operations)
- Bandwidth
- Cost

> Note: 100TB and more are HDD which has a lower IOP.

### Cost 

| Capacity                     | 10TB | 100TB | 500TB | 1PB  |
|------------------------------|------|-------|-------|------|
| Estimated monthly cost (USD) | 250  | 500   | 1250  | 3000 |

## Horizontally  

Scaling Horizontally by adding more servers, with two options:

1- More worker assign to th existing team members
2- More new worker


Below are three models with a server capacity of 10,100 and 500TB


| Replication            | 4         | 4        | 4        | 4        | 4         | 4         | 4         | 4          | 4          | 4          | 4          |
|------------------------|-----------|----------|----------|----------|-----------|-----------|-----------|------------|------------|------------|------------|
| Hours uploaded per min | 0.01      | 0.05     | 0.25     | 0.5      | 1         | 3         | 8         | 12         | 22         | 53         | 500        |
| Number of videos       | 21024     | 105120   | 525600   | 1051200  | 2102400   | 6307200   | 16819200  | 25228800   | 46252800   | 111427200  | 1051200000 |
| Total Storage TB       | 11.755044 | 58.77522 | 293.8761 | 587.7522 | 1175.5044 | 3526.5132 | 9404.0352 | 14106.0528 | 25861.0968 | 62301.7332 | 587752.2   |
| Worker Disk size TB    | 10        | 10       | 10       | 10       | 10        | 10        | 10        | 10         | 10         | 10         | 10         |
| Workers                | 8         | 24       | 120      | 236      | 472       | 1412      | 3764      | 5644       | 10348      | 24924      | 235104     |



| Replication            | 4         | 4        | 4        | 4        | 4         | 4         | 4         | 4          | 4          | 4          | 4        |
|------------------------|-----------|----------|----------|----------|-----------|-----------|-----------|------------|------------|------------|----------|
| Hours uploaded per min | 0.01      | 0.05     | 0.25     | 0.5      | 1         | 3         | 8         | 12         | 22         | 53         | 500      |
| Total Storage TB       | 11.755044 | 58.77522 | 293.8761 | 587.7522 | 1175.5044 | 3526.5132 | 9404.0352 | 14106.0528 | 25861.0968 | 62301.7332 | 587752.2 |
| Worker Disk size TB    | 100       | 100      | 100      | 100      | 100       | 100       | 100       | 100        | 100        | 100        | 100      |
| Workers                | 4         | 4        | 12       | 24       | 48        | 144       | 380       | 568        | 1036       | 2496       | 23512    |



| Replication            | 4         | 4        | 4        | 4        | 4         | 4         | 4         | 4          | 4          | 4          | 4        |
|------------------------|-----------|----------|----------|----------|-----------|-----------|-----------|------------|------------|------------|----------|
| Hours uploaded per min | 0.01      | 0.05     | 0.25     | 0.5      | 1         | 3         | 8         | 12         | 22         | 53         | 500      |
| Total Storage TB       | 11.755044 | 58.77522 | 293.8761 | 587.7522 | 1175.5044 | 3526.5132 | 9404.0352 | 14106.0528 | 25861.0968 | 62301.7332 | 587752.2 |
| Worker Disk size TB    | 500       | 500      | 500      | 500      | 500       | 500       | 500       | 500        | 500        | 500        | 500      |
| Workers                | 4         | 4        | 4        | 8        | 12        | 32        | 76        | 116        | 208        | 500        | 4704     |

