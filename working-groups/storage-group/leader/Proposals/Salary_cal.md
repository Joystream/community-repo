

# Objective 

This document to address the server operator's compensation. 


## The DAO rewards SWG and DWG for:
- Investment in hardware
- Service availability
- Server capacity
- Bandwidth
- Operator availability 
- Skills 
- Provide performance metrics. 

## What activities expected from SWG and DWG operator:
- Run services
- Monitor services.
- Respond to services issues
- Upgrade software
- Upgrade hardware 
- Optimize deployment. 


## SWG and DWG services deliverables:
- Services availability
- Storage capacity
- Bandwidth capacity
- Processing
- Providing performance metrics.


## Rewards approaches
- Skill and time
  - DAO have to compensate for both active and standby time.
  - DAO have to compensate for server cost risk free. 
- Deliverable


# Historical back group


In the past this calculation was used: https://pioneerapp.xyz/#/forum/thread/327?post=3576.
Adopt a skill and time approach, which make the operator employee and by Definition does not ajust to with the objective of providing a service. 


The below formula was used initially to come with SWG salary. 

## Formula
```
%TOTAL_SALARY = (%BASE_SALARY + % SERVER_COST + %BONUS) * %PENALTY

%TOTAL SALARY_IN_JOY = %TOTAL_SALARY / %JOY_PRICE
```

### %BASE_SALARY
```
%DEVOPS_MONTHLY_SALARY *[{10+ %EXTRA_HOURS}/160]  
```

-	Default: SWG/DWG(625)

| Variable                         | Default | Detail                                                                                       |
| ---------------------------------| ------- | -------------------------------------------------------------------------------------------- |
| %DEVOPS_MONTHLY_SALARY           | 10K     |                                                                                              |
| %EXTRA_HOURS                     | 0       |                                                                                              |
| [{(30/3   )+ %EXTRA_HOURS}/160]  | 0.0625  | worker needs to spend 20 minutes (1/3 of an hour) per day * 30 days per month ~ 10 hours.    |
|                                  |         | 160 = 20*8 = number of hours in an average working month, 8 hr per day for 20 days.          |

### %SERVER_COST

```
%SERVER_COST = %AVERAGE_SERVER_COST * ( %STORAGE_CAPACITY_PROVIDED_IN_TB / %RECOMMENDED_CAPACITY_IN_TB )
```

-	Default: SWG(150) DWG(100)

| Variable                        | Default | Detail                                                |
| ------------------------------- | ------- | ----------------------------------------------------- |
| %AVERAGE_SERVER_COST            | 150     | Average cost of the server                            |
| %STORAGE_CAPACITY_PROVIDED_IN_TB| 10T     | The capacity of the server storage in TB              |
| %RECOMMENDED_CAPACITY_IN_TB     | 10T     | The recommended server capacity set by the lead in TB |

### %BONUS
-	Default: 0 
-	Totally discretionary 

### %PENALTY
-	Default: 1 

| Variable                                 | Default | Detail                         |
| ---------------------------------------- | ------- | ------------------------------ |
| Server up time                           | 1       | Set Penalty to %SERVERS_UPTIME |
| Respond to emergency within 24hrs        | 1       | Set Penalty to 0.5             |
| Respond to routine upgrade within 72hrs  | 1       | Set Penalty to 0.75            |
| Upgrade capacity within 30 days          | 1       | Set Penalty to 0               |

## Disadvantage
- Does not make a direct relation between the rewards and provided capacity
- It is very subjective to quantify been available and time needed to monitor the services. 
- In this approach it's fair to have two rates for active hours and standby hours. The standby was missed totally.
- Devop engineer salary is very subjective based on geographical. 
- Resulted on a SWG $775 salary at a time when the price of Joy was very low made it hard to adopt. 
- The model was hard to adjust the numbers.


## Advantages 
- Similar compensation scheme to the rest of the DAO (Rest of the DAO worker are compensated passed of skills and time)


# Proposal 

## This proposal focus's on deliverables
- Services availability
- Storage capacity
- Bandwidth capacity
- Providing performance metrics.

## The proposal made to encourage:
- Node operator to optimize server cost
- Storage provider to provide the max storage rewardable
- Distribution provider to provide higher bandwidth
- Maximum uptime
- Operator availability


This proposal assumes the cost of the skills and time is encompassed in the deliverable cost. 

## Formula
```
TOTAL TERM SALARY = ((%BASE_SALARY + % REWARDS  + %BONUS) * %PENALTY )
```

### %BASE_SALARY
The objective of this section is to offer assurance and pay for the basic services i.e. hardware (including processing), setup and basic services.

```
%SERVER_COST_MULTIPLIER * %AVERAGE_COST_OF_SERVER * %NUMBER_OF_SERVERS  * %QN * %METRICS_PROVICED 
```

- Current projection: SWG(187.5)DWG(125)

| Variable                | Default | Detail                                                                                                                                   |
| ----------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| %SERVER_COST_MULTIPLIER | 1.25    | A multiplier to squeue  the average price in a certain direction. His should used in respond the distribution of the prices              |
|                         |         | 0.75:  + 60 less the average.                                                                                                            |
|                         |         | 1.25:  ~50:50                                                                                                                            |
|                         |         | 1.5 : 60% more than the average price                                                                                                    |
| %AVERAGE_COST_OF_SERVER | 150     | The average cost of the server, calculated from all the server in the group                                                              |
| %QN                     | 1       | Run QN and expose GraphQL.                                                                                                               |
|                         |         |  0.75 if false                                                                                                                           |
| %METRICS_PROVICED       | 1       | Provide access to server performance metrics.                                                                                            |
|                         |         |  0.75 if false                                                                                                                           |
| %NUMBER_OF_SERVERS      | 1       | Number of servers run by operator                                                                                                        |

### %REWARDS   
```
%TOTAL_CAPACITY * %PRICE_PER_GB * %BANDWIDTH_MULTIPLIER
```

-	Current projection: SWG(307-450) DWG(300-?)

| Variable              | Default | Detail                                                         |
| --------------------- | ------- | -------------------------------------------------------------- |
| %TOTAL_CAPACITY       |         | the storage provided in GB                                     |
| %PRICE_PER_GB         |  0.0125 | Range: $0.005 - $0.05. The price the DAO willing to pay per GB |
| %BANDWIDTH_MULTIPLIER |  1      | Upper limit to authorized by lead in the group                 |
|                       |         | 1G   -> 1 (Default)                                            |
|                       |         | 10G -> 1.25                                                    |
|                       |         | 40G -> 1.5                                                     |

#### %PRICE_PER_GB  

| Storage   | PRICE_PER_GB |                                                                 |
| --------- | ------------ | --------------------------------------------------------------- |
| < 20TB    | 0.0200       | For this it should consider the storage 20TB even if it is less |
| 20TB-30TB | 0.0100       |                                                                 |
| 30TB-40TB | 0.0050       |                                                                 |
| 40TB-50TB | 0.0025       |                                                                 |
| > 50TB    | 0.0010       |                                                                 |  

#### %UPPER_STORAGE_LIMIT 
- Define the upper limit for the storage that is rewarded.
- Dfeault SWG: 50TB
- Dfeault DWG: 20TB
  
### %BONUS
-	Default: 0 
-	Totally discretionary 

### %PENALTY 

-	Default: 1 

| Variable                                 | Default | Detail                         |
| ---------------------------------------- | ------- | ------------------------------ |
| Server up time                           | 1       | Set Penalty to %SERVERS_UPTIME |
| Respond to emergency within 24hrs        | 1       | Set Penalty to 0.5             |
| Respond to routine upgrade within 72hrs  | 1       | Set Penalty to 0.75            |
| Upgrade capacity within 30 days          | 1       | Set Penalty to 0               |

## Process
- The salaries are set with each OKR with the below variables reviewed
  - %JOY_PRICE
  - %SERVER_COST_MULTIPLIER
  - %AVERAGE_COST_OF_SERVER
  - %PRICE_PER_GB
  - %BANDWIDTH_MULTIPLIER
  - %UPPER_STORAGE_LIMIT 
- Salary changes should be approved by two councils.
- Salary changes take effect at the next council period after council approval.
- All changes to the the salary must not exceed 25% of the current salary in Joy.

## Advantages 
- Focus on deliverables and group added value to the DAO
- line up the DWG, SWG AND validators on their own category
- Flexible
- Reflect storage and CDN market value

## Disadvantages 
- Different compensation scheme to the rest of the DAO (Rest of the DAO worker are compensated passed of skills and time)
- Long term need accurate collection of the data.

## Summary

Current monthly projection as per this proposal
|     | Lower band - USD | Upper band - USD | Lower band - Joy | Upper band - Joy |
| --- | ---------------- | ---------------- | ---------------- | ---------------- |
| SWG | $597             | $726             | 39833            | 50833            |
| DWG | $550             | ??               | 36666            | ??               |


### Comparison with the current status

%JOY_PRICE:	0.015

Current compensation for term 18

| Worker ID | Joystream Name | Server cost, USD | Server compensation | Salary    | Bonus | Total     |
| --------- | -------------- | ---------------- | ------------------- | --------- | ----- | --------- |
| 0         | yyagi          | 110.00           | 3618.421053         | 41745.90  | 0     | 45364.32  |
| 2         | BwareLabs      | 150.00           | 4934.210526         | 16689.81  | 0     | 21624.03  |
| 4         | 0x2bc          | 92.00            | 3026.315789         | 16689.81  | 0     | 19716.13  |
| 6         | kalpakci       | 118.00           | 3881.578947         | 16689.81  | 0     | 20571.39  |
| 7         | freakstatic    | 130.00           | 4276.315789         | 16689.81  | 0     | 20966.13  |
| 8         | itornews       | 150.00           | 4934.210526         | 16689.81  | 0     | 21624.03  |
| 9         | sieemma        | 150.00           | 4934.210526         | 16689.81  | 0     | 21624.03  |
| 10        | JonnyBoy       | 150.00           | 4934.210526         | 16689.81  | 0     | 21624.03  |
| 11        | tomato         | 107.00           | 3519.736842         | 16689.81  | 0     | 20209.55  |
| 12        | adovrn         | 150.00           | 4934.210526         | 16689.81  | 0     | 21624.03  |
| Total     |                |                  | 42993.42105         | 191954.23 | 0     | 234947.65 |



 Compensation using the proposed scheme 
 
| Joystream    Name | Storage capacity, GB | 10TB-20TB | 20TB-30TB | 30TB-40TB | 40TB-50TB | 50TB-100TB | Rewards | BASE_SALARY | Total USD/term | Total Joy  |
| ----------------- | -------------------- | --------- | --------- | --------- | --------- | ---------- | ------- | ----------- | -------------- | ---------- |
|                   |                      | 0.02      | 0.01      | 0.005     | 0.0025    | 0.001      |         |             |                |            |
|                   |                      |           |           |           |           |            |         |             |                |            |
| yyagi             | 29000                | 400       | 90        | 0         | 0         | 0          | 490     | 187.5       | 338.75         | 41000      |
| BwareLabs.com     | 21000                | 400       | 10        | 0         | 0         | 0          | 410     | 187.5       | 298.75         | 19916.6667 |
| 0x2bc             | 32000                | 400       | 100       | 10        | 0         | 0          | 510     | 187.5       | 348.75         | 23250      |
| kalpakci          | 29000                | 400       | 90        | 0         | 0         | 0          | 490     | 187.5       | 338.75         | 22583.3333 |
| freakstatic       | 24000                | 400       | 40        | 0         | 0         | 0          | 440     | 187.5       | 313.75         | 20916.6667 |
| itornews          | 21000                | 400       | 10        | 0         | 0         | 0          | 410     | 187.5       | 298.75         | 19916.6667 |
| sieemma           | 24000                | 400       | 40        | 0         | 0         | 0          | 440     | 187.5       | 313.75         | 20916.6667 |
| JonnyBoy          | 24000                | 400       | 40        | 0         | 0         | 0          | 440     | 187.5       | 313.75         | 20916.6667 |
| tomato            | 35000                | 400       | 100       | 25        | 0         | 0          | 525     | 187.5       | 356.25         | 23750      |
| adovrn            | 50000                | 400       | 100       | 50        | 25        | 0          | 575     | 187.5       | 381.25         | 25416.6667 |
| Total Monthly     |                      |           |           |           |           |            |         |             | 3302.5         | 238583.333 |


## Option:
- Pay a higher %BASE_SALARY (higher %SERVER_COST_MULTIPLIER)
- Make the %REWARDS vesting

# Ref. 
https://www.techradar.com/features/how-much-does-cloud-storage-cost

https://builtin.com/salaries/dev-engineer/devops-engineer
