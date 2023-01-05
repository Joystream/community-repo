# Storage working group Objectives and Key Results - Part 2

### Overview

Main quality criteria for Storage Providers:
- Speed
- Capacity
- Reliability
- Geographic Location
- Resilience

Detailed quality criteria for Storage Providers were outlined [here](https://github.com/Joystream/community-repo/blob/master/governance/Storage_WG_OKR.md).

Based on that, a new OKR system with “quantitative” criteria was developed. 

New OKRs are applicable to every Storage provider from the Strorage Working Group.

### Sanctions and Bonuses 

In the event that a Storage Provider has violated our new OKRs, some sanctions will be assigned. The goal of assigning sanctions is to help Storage Providers understand the impact their actions have on Storage WG functioning and Atlas' users experience, prevent future violations, and repair any harm caused. Sanctions are not meant to punish, but to provide growth and development so better choices can be made in the future.

The following guidelines are not absolute, but provide an outline for potential sanctions based on the specific violation. This allows for greater consistency across our Storage standards. Sanctions are assigned to be effective and appropriate based on the circumstances of the individual Storage provider and incident, including aggravating or mitigating factors, and the Storage providers' previous record within Storage WG history.

## OKRs

### KR6 - Uptime

#### Definition

Uptime is the percentage of time when the server is available.

#### Goal 

Any downtime should be avoided as much as possible.

#### Assessment criteria

| Condition          | Action<sup>*</sup>                             |
| ------------------ | --------------------------------------------- |
| Uptime > 90%               | No impact on salary                     |
| Uptime < 90%               | Salary can be decreased by 20%          |
| Uptime < 50%               | Storage provider can be replaced        |


| Condition                                                   | Action<sup>*</sup>              |
| ----------------------------------------------------------- | -------------------------------------- |
| Node is down & URL is not set to empty < 12 hours  | No impact on salary                    |
| Node is down & URL is not set to empty > 12 hours  | Salary can be decreased by 20%      |
| Node is down & URL is not set to empty > 48 hours  | Storage provider can be replaced     |

<sup>*</sup> Sanctions (salary impacts) are not compounded. If there are few sanctions, the most strict one should be applied.
Sanctions can only be removed after 1 month from the incident.

#### Data source

- [Dashboard](http://194.163.131.85:3000/d/pIinMgN7k/joystream-monitoring?orgId=1&refresh=10s&from=now-7d&to=now) 
- [Helios Report Archive](https://joystreamstats.live/static/helios/)

### KR4 - Free storage

#### Definition

Free storage space on Storage provider node that is instantly available for any purposes.

#### Goal 

Maintain an extra storage capacity, in order to handle the increased needs of the platform.
Storage providers must maintain as much free space as has been uploaded during the last three months.

#### Assessment criteria

| Condition                                                                        | Action<sup>*</sup>              |
| ------------------------------------------------------------------------------- | -------------------------------------- |
| FreeStorageSpace  > [ContentDirectory<sub>now</sub>-ContentDirectory<sub>3 months ago</sub>]           | No impact on salary                    |
| FreeStorageSpace  < [ContentDirectory<sub>now</sub>-ContentDirectory<sub>2 months ago</sub>]           | Salary can be decreased by 20%      |
| FreeStorageSpace  < [ContentDirectory<sub>now</sub>-ContentDirectory<sub>1 months ago</sub>] / 4   |  Storage provider can be replaced     |                                        |
 
 
 #### Data source

- Data provided by Storage Providers
- Discord Joystream-bot (shows the current size of Content Directory)

### KR 10 - Datacenter Diversification 

#### Definition

A risk management strategy when Storage providers' nodes are diversified among different data centers or autonomous system (AS).

#### Goal 

Maintain diversity of autonomous system in which Storage nodes are located. Diverse set of Storage nodes is crucial to the success of a well-formed blockchain network.

#### Assessment criteria

- If Storage nodes are in the same AS with the total concentration of nodes > 50%, the last Storage provider (SP) who joined should leave the AS. 
- If that's not clear who is the last one to join, WG Lead will ask one of the SPs to leave the AS. 
- If there is no change after 1 week, the chosen SP will be reduced in salary by 20%. 
- If there is no change after 2 weeks, this SP can be replaced.  

 #### Data source

[Dashboard](http://194.163.131.85:3000/d/pIinMgN7k/joystream-monitoring?orgId=1&refresh=10s&from=now-7d&to=now) 
Autonomous system information can be manually derived from the URLs (IPs) of Storage Provider's node. This information 

## Bonus

If any Storage provider works with no sanctions straight for 3 months, its salary can be increased by 10% in total.  
If any Storage provider works with no sanctions straight for 6 months, its salary can be increased by 25% in total.   
