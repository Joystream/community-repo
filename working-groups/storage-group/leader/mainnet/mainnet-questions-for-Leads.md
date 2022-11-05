# Mainnet Questions For Leads

## Questions 

1. Write step by step guide how the work within your WG will be organized in the first term of the mainent 
 -  1. Council will make a proposal for hiring a Lead
 -  2. Lead will be hired
 -  3. Lead will deploy his node
 -  4. Lead will hire a deputy.
 -  5. Lead will hire monitoring node worker (if ES still in use)
 -  4. lead will hire workers

[Commands](https://github.com/yasiryagi/community-repo/blob/master/working-groups/storage-group/leader/Initial_%20setup_commands.md)

2. Review [Gitbook Scores](https://joystream.gitbook.io/testnet-workspace/testnet/council-period-scoring/general-working-group-score) for your Work Group and tell: 
* Which scores should be excluded? 
  The below shoudl be excluded:
  -  BOUNTY_SCORE
  - Catastrophic Errors
    *No openings
  - Cancel the plan and summary report. Simplify and automate report. 
  
- Which scores should be added? 
NA
3. For each position of your WG in the mainnet, incl. the Lead: 
- Develop the Job Descriptions and provide links to them.
Please find the job descriptions here :[Job descriptions](https://github.com/yasiryagi/community-repo/tree/master/working-groups/storage-group/leader/opening)
- Propose a stake amount in USD (and JOY) required by application for each position.  
See the job descriptions above.
4. If there will be less seats in the WG compared to the number of seats in the current testnet, which people will you hire? Propose your criteria.

This should be purely based on skills and abilities including:
 - Linux and devops skill level
 - Machine specification
 - Willing to commit time and expertise to develop tools and procedures i.e. addd value. 

Preference will be made for testnet contributors who showed the above skills, reliability and commitment.
 
6. How would you manage people who didn’t find their place in your WG, but who are still quite experienced? 
- Create a waiting list.
- Establish stringent practice of preformance measurement to weed out none performing members.  
- Establish a practice of weekly activities to improve the performance. Mmebers who do not comply risk been replaced. 
8. Propose a forecast of _capacity_ utilization for your WG over time (in terms of capacity required over time/ staff number required over time/ overall budget required over time). For example, for the Storage WG _capacity_ will be the total storage space avaliable across all servers. 

The calculation below taking assumption from [here](https://gist.github.com/bedeho/1b231111596e25b215bc66f0bd0e7ccc)

* Min per worker storage is 5TB with a preference for 7TB, max 10TB.
* Initial min total number of workers avaiable should be `2.5 * Min requirement is replication requirement`. Current replication is 5, resulting on a min 5*2.5 ~= 13 nodes and capacity 65T to 130T, taking into account replication capacity 13T to 26T. 
* At 5PB as per docuement above we will be looking at ~ 50 workers with 100TB per worker or ~ 500 workers with 10T per worker. 
* Salaries: 
  - Assuming initialy, 
    * Worker: average 4 hrs weekly effort and a cost of $500 per worker.
    * Deputy Lead: average 7.5 hrs weekly effort and a cost of $500 per worker.
    * Lead: average 15 hrs weekly effort and a cost of $1000 per worker.
  - Propose initial salaries as follow:
    * Lead: $16k (8 Joy/block)
    * Deputy lead: $6k (3 Joy/block)
    * Worker: $2k (1 Joy/block)

