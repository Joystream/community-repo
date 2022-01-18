# Validator Stats Builder

A backend tool which allows Substrate node-runners to obtain an informative timely report about their validator activity. It works off the PostgresSQL database, where blockchain data about blocks, eras and Substrate events is imported. 
Basic usage: 

```
curl http://localhost:3000/validator-report?addr=5EhDdcWm4TdqKp1ew1PqtSpoAELmjbZZLm5E34aFoVYkXdRW&start_block=100000&end_block=2000000
```

Search by date interval is also supported:
```
curl http://localhost:3000/validator-report?addr=5EhDdcWm4TdqKp1ew1PqtSpoAELmjbZZLm5E34aFoVYkXdRW&start_time=2021-07-18&end_block=2021-08-31
```
In the latter case, the search is performed from July 18 00:00:00  to Aug 31 23:59:59. 


## Report Structure Explained

A validator report is produced in a JSON format. 
 
 ## Setup
 
 ### Prerequisites
 
 1. PostgreSQL database[https://www.postgresql.org/]. The tool was developed and tested against PostgreSQL 13.3 and 12.7. Compatibility with other versions is likely, though not confirmed.
 2. NodeJS. Verified versions are 16.4.1 and 15.11.10.
 3. Fully synchronized Substrate https://substrate.dev/ node exposing the Websocket endpoint to connect to. We highly recommend connecting to such a node on localhost, for performance reasons. Although, remote nodes should wor, too, the data import will just be very slow. This tool was specifically developed for Joystream https://joystream.org blockchain. Compatibility with other Substrate-based blockchains is not confirmed.
 4. Empty database created in PostgreSQL.


Clone the repo, ```cd``` to the project folder and execute the build command:
 ```
 yarn && yarn build
 ```

 ## Usage when running from scratch

Run the schema migration (this step will create all needed tables and indices) ``` NODE_ENV=<database name goes here> node lib/init_db.js ```

Run the server by executing ``` NODE_ENV=<database name goes here> node lib/index.js ```
By default, this will start the application on port 3000 connecting to the localhost Substrate node. To change this behavior, use PORT and RPC_ENDPOINT environment variables, respectively: ``` PORT=5555 RPC_ENDPOINT=wss://joystreamstats.live:9945 NODE_ENV=<database name goes here> node lib/index.js ```

From this point on, the application would capture all the new blocks and events that appear in a blockchain aand store them in a database. But what about the past (historical) blocks? To import those, a separate script needs to be used: ```NODE_ENV=<DB> START_BLOCK=<HEIGHT OF THE FIRST BLOCK TO IMPORT> END_BLOCK=<HEIGHT OF THE LAST BLOCK TO IMPORT> node lib/block_range_import.js```. Block heights are just numbers, so by specifying START_BLOCK=1 and END_BLOCK=10000, you essentially import all blocks from 1 to 10000. 

Depending on the size of your blockchain and your system hardware, the importing of all historical blocks may take from couple of hours to a several days. To speed up the process, we recommended to split the range of blocks you want to import to chunks and import them simultaneously in parallel by running the above script several times. 

Note. ```block_range_import.js``` will not automatically stop after importing the last block. You would need to stop it manually using Ctrl+C. 

#### Example
For example, if your chain has 2.000.000 blocks, it's wise to split them in chunks by 500.000 and run the script four times like this:

In Terminal window 1:
```
NODE_ENV=<DB> START_BLOCK=1 END_BLOCK=500000 node lib/block_range_import.js
```

In Terminal window 2:
```
NODE_ENV=<DB> START_BLOCK=500001 END_BLOCK=1000000 node lib/block_range_import.js
```

In Terminal window 3:
```
NODE_ENV=<DB> START_BLOCK=1000001 END_BLOCK=1500000 node lib/block_range_import.js
```

In Terminal window 4:
```
NODE_ENV=<DB> START_BLOCK=1500001 END_BLOCK=2000000 node lib/block_range_import.js
```

### Making sure all blocks are imported
Blockchains are ever-growing systems, constantly producing more and more data, so making sure your database is fully in sync with the chain state and no blocks are missing is very important. 
First of all, you need to make sure all historical blocks are imported. Log in to your database and execute the following SQL: ```select block from start_blocks;``` This should give you the very first block number that your application imported after the start. So, when importing your historical blocks, you can use this value as an END_BLOCK:
```
NODE_ENV=<DB> START_BLOCK=1 END_BLOCK=<'VALUE PRODUCED BY THE SQL'> node lib/block_range_import.js
```

## Usage when the database dump is available
Importing blockchain data into a database from scratch is a time-consuming process, so there is another way to bootstrap things. For instance, you want to do the import on local machine because it's fast, but your production database is elsewhere.  

TODO finish this section

## Queries

List of eras where validator was active
 ```
select a.key, "eraId", stake_total, stake_own, points, rewards, commission from validator_stats vs inner join accounts a on a.id = vs."accountId" where a.key = '55555555555555555555555555555555555555555555' order by "eraId";

 ```



Main report to be executed by an endpoint

```
select 
	vs."eraId", 
	stake_total, 
	stake_own, 
	points, 
	rewards, 
	commission, 
	subq2.blocks_cnt 
from 
	validator_stats vs 
inner join 
	accounts a on a.id = vs."accountId" 
inner join 
	(select 
		"eraId", count(b.id) blocks_cnt 
	from 
		eras e 
	join 
		blocks b 
	on 
		b."eraId" = e.id 
	inner join 
		accounts a 
	on 
		a.id = b."validatorId" 
	and 
		b."validatorId" = (select id from accounts where key = '55555555555555555555555555555555555555555555') and e.id = "eraId" group by "eraId") subq2 
	on 
		subq2."eraId" = vs."eraId" 
where 
	a.key = '55555555555555555555555555555555555555555555' 
and 
	vs."eraId" 
in 
	(select subq.era from (select distinct("eraId") era, min(id) start_height, min(timestamp) start_time, max(id) end_height, max(timestamp) end_time, (max(id) - min(id)) as era_blocks from blocks where blocks.id > 1 and blocks.id < 2000000 group by blocks."eraId") subq) 
order by "eraId";
```

Eras starts and ends (blocks and time)
```
select distinct("eraId") era, min(id) start_height, min(timestamp) start_time, max(id) end_height, max(timestamp) end_time, (max(id) - min(id)) as era_blocks from blocks group by blocks."eraId";
 ```

Ordered list of blocks count produced by validators, per era
```
select distinct(e.id) era, a.key account, count(b.id) blocks_cnt from eras e join blocks b on b."eraId" = e.id inner join accounts a on a.id = b."validatorId" group by e.id, account order by blocks_cnt desc;
```

Same as above, but for one validator
```
select distinct(e.id) era, a.key account, count(b.id) blocks_cnt from eras e join blocks b on b."eraId" = e.id inner join accounts a on a.id = b."validatorId" where a.key = '44444444444444444444444444444' group by e.id, account order by blocks_cnt desc;
```

Find missing blocks (not imported for any reason)
```
SELECT generate_series(1, 2000000) except (select id from blocks where id between 1 AND 2000000);
```
