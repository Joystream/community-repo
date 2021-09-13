import {Moment} from 'moment'
export const pageSize = 50

export const validatorStats = (address: string, startBlock = -1, endBlock = -1, startTime: Moment, endTime: Moment, page = 1, countQuery = false): string => 
`select 
	${countQuery ? ' count(vs."eraId")::integer as "totalCount" ' : ` vs."eraId" as id, 
    stake_total as "stakeTotal", 
    stake_own as "stakeOwn", 
    points, 
    rewards, 
    commission, 
    subq2.blocks_cnt as "blocksCount" `}
from 
	validator_stats vs 
inner join 
	accounts a on a.id = vs."accountId" 
${countQuery ? '' : `inner join 
	(select 
		"eraId", count(b.id) blocks_cnt 
	from 
		blocks b 
	${address != '' ? ` where b."validatorId" in (select id from accounts where key = '${address}') ` : ''}
	    group by "eraId") subq2 
	on 
		subq2."eraId" = vs."eraId"`} 
where ${address != '' ? `a.key = '${address}' and ` : ''}
	vs."eraId" in 
	(select 
        subq.era 
    from 
        (select 
            distinct("eraId") era 
        from blocks 
        where ${startBlock > 0 ? ` blocks.id >= ${startBlock} and blocks.id <= ${endBlock} ` : '1 = 1'} 
        ${startTime ? ` AND blocks.timestamp >= '${startTime.toISOString()}'::date and blocks.timestamp <= '${endTime.toISOString()}'::date ` : ''}) subq
        ) ${countQuery ? '' : ` order by id limit ${pageSize} offset ${pageSize * (page - 1)} `}`


export const countTotalBlocksProduced = (address: string, startBlock = -1, endBlock = -1, startTime: Moment = null, endTime: Moment = null) => 
`SELECT count(b.id) as "totalBlocks"
FROM blocks b 
INNER JOIN accounts a ON a.id = b."validatorId"
WHERE ${address != '' ? `a.key = '${address}' 
    AND ` : ''} ${startBlock > 0 ? ` b.id >= ${startBlock} AND b.id <= ${endBlock} ` : ' 1=1 '} 
    ${startTime ? ` AND b.timestamp >= '${startTime.toISOString()}'::date AND b.timestamp <= '${endTime.toISOString()}'::date ` : ' AND 1=1 '}`

export const findBlockByTime = (timeMoment: Moment) => 
`SELECT b.*
FROM blocks b
ORDER BY (ABS(EXTRACT(epoch
    FROM (b.timestamp - '${timeMoment.toISOString()}'::date))))
LIMIT 1`

export const findFirstAuthoredBlock = (blockIdStart: number, blockIdEnd: number, addr: string) => 
`SELECT b.*
FROM blocks b
INNER JOIN accounts a ON a.id = b."validatorId" AND a.key = '${addr}' 
${blockIdStart > 0 ? ` WHERE b.id >= ${blockIdStart} AND b.id <= ${blockIdEnd} ` : ''}
ORDER BY b.id
LIMIT 1`

export const findLastAuthoredBlock = (blockIdStart: number, blockIdEnd: number, addr: string) => 
`SELECT b.*
FROM blocks b
INNER JOIN accounts a ON a.id = b."validatorId" AND a.key = '${addr}' 
${blockIdStart > 0 ? ` WHERE b.id >= ${blockIdStart} AND b.id <= ${blockIdEnd} ` : ''}
ORDER BY b.id DESC
LIMIT 1`

export interface IValidatorReport {
    startBlock: number, 
    startEra: number, 
    endBlock: number,
    endEra: number,
    startTime: number,
    endTime: number,
    totalBlocks: number,
    totalCount: number,
    pageSize: number,
    report: IValidatorEraStats[]
}

export interface IValidatorEraStats {
    id: number,
    stakeTotal: number,
    stakeOwn: number,
    points: number,
    rewards: number,
    commission: number,
    blocksCount: number
}

export interface ITotalCount {
    totalCount: number
}

export interface ITotalBlockCount {
    totalBlocks: number
}