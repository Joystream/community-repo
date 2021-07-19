import { addBlock } from './joystream'
import { connectUpstream } from './joystream/ws'
import express from 'express'
import cors from 'cors'
import ascii from './ascii'
import db from './db'
import moment from 'moment'
import { QueryOptionsWithType, QueryTypes, Sequelize } from 'sequelize'
import {
    validatorStats, 
    countTotalBlocksProduced, 
    findBlockByTime, 
    findFirstAuthoredBlock,
    findLastAuthoredBlock,
    IValidatorReport, 
    ITotalCount, 
    ITotalBlockCount, 
    IValidatorEraStats,
    pageSize} from './db/native_queries'
import { Header } from './types'

import {
    Block,
    StartBlock
} from './db/models'

const PORT: number = process.env.PORT ? +process.env.PORT : 3500

const app = express()

app.listen(PORT, () =>
  console.log(`[Express] Listening on port ${PORT}`, ascii)
)

;(async () => {
  
    const api = await connectUpstream()

    let lastHeader: Header = { number: 0, timestamp: 0, author: '' }
    let firstProcessedBlockLogged = false


    let highId = 0
    Block.max('id').then(
        (highestProcessedBlock: number) => {
            highId = highestProcessedBlock === undefined || isNaN(highestProcessedBlock) ? 0 : highestProcessedBlock
            StartBlock.destroy({where: {}})
            api.rpc.chain.subscribeNewHeads(async (header: Header) => {
                const id = +header.number
                if (id === +lastHeader.number)
                    return console.debug(
                        `[Joystream] Skipping duplicate block ${id} (TODO handleFork)`
                    )
                lastHeader = header
                await addBlock(api, header)
                if(!firstProcessedBlockLogged) {
                    StartBlock.create({block: id})
                    console.log(`[Joystream] Subscribed to new blocks starting from ${id}`)
                    firstProcessedBlockLogged = true
                }
            })
        }
    )
})()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const corsOptions = {
    origin: process.env.ALOWED_ORIGIN || 'http://localhost:3000',
    optionsSuccessStatus: 200
}

const ADDRESS_LENGTH = 48

const opts = {type: QueryTypes.SELECT, plain: true} as QueryOptionsWithType<QueryTypes.SELECT> & { plain: true }

app.get('/validator-report', cors(corsOptions), async (req: any, res: any, next: any) => {
    try {
        const address = (req.query.addr && req.query.addr.length == ADDRESS_LENGTH) ? req.query.addr : ''
        const page = !isNaN(req.query.page) ? req.query.page : 1
        const startBlock = !isNaN(req.query.start_block) ? +req.query.start_block : -1
        const endBlock = !isNaN(req.query.end_block) ? +req.query.end_block : -1
        console.log(`Start block = ${startBlock}, end block = ${endBlock}`)
        if(startBlock > 0 && endBlock > 0 && endBlock > startBlock) {
            return res.json(await fetchReportPage(
                validatorStats(address, startBlock, endBlock, null, null, page), 
                validatorStats(address, startBlock, endBlock, null, null, page, true), 
                countTotalBlocksProduced(address, startBlock, endBlock),
                findFirstAuthoredBlock(startBlock, endBlock, address),
                findLastAuthoredBlock(startBlock, endBlock, address)
            ))
        } else {

            const startTime = moment.utc(req.query.start_time, 'YYYY-MM-DD').startOf('d')
            const endTime = moment.utc(req.query.end_time, 'YYYY-MM-DD').endOf('d')
            console.log(`Start time: [${startTime}]-[${endTime}]`)
            if(endTime.isAfter(startTime)) {
                return res.json(await fetchReportPage(
                    validatorStats(address, -1, -1, startTime, endTime, page), 
                    validatorStats(address, -1, -1, startTime, endTime, page, true), 
                    countTotalBlocksProduced(address, -1, -1, startTime, endTime),
                    findBlockByTime(startTime), 
                    findBlockByTime(endTime) 
                  ))
            } else {
                return res.json(await fetchReportPage(
                    validatorStats(address, -1, -1, null, null, page), 
                    validatorStats(address, -1, -1, null, null, page, true), 
                    countTotalBlocksProduced(address),
                    findFirstAuthoredBlock(startBlock, endBlock, address),
                    findLastAuthoredBlock(startBlock, endBlock, address)
                    ))
              }
            }
    } catch (err) {
        console.log(err)
        return res.json({})
    }
  })

const fetchReportPage = async (
    validatorStatsSql: string, 
    validatorStatsCountSql: string, 
    totalBlocksSql: string,
    firstBlockSql: string,
    lastBlockSql: string,
    ): Promise<IValidatorReport> => {

    const dbBlockStart = (await db.query<any>(firstBlockSql, opts)) // TODO <Block> instead of <any> produces an object with no get() function  
    const dbBlockEnd = (await db.query<any>(lastBlockSql, opts))
    const dbCount = (await db.query<ITotalCount>(validatorStatsCountSql, opts))
    const blockCount = (await db.query<ITotalBlockCount>(totalBlocksSql, opts))

    return db.query<IValidatorEraStats>(validatorStatsSql, {type: QueryTypes.SELECT}).then((stats: IValidatorEraStats[]) => {
        const validationReport: IValidatorReport = {
            pageSize: pageSize,
            totalCount: dbCount.totalCount,
            startBlock: dbBlockStart?.id,
            endBlock: dbBlockEnd?.id,
            startTime: dbBlockStart?.timestamp,
            endTime: dbBlockEnd?.timestamp,
            startEra: dbBlockStart?.eraId,
            endEra: dbBlockEnd?.eraId,
            totalBlocks: blockCount.totalBlocks | 0,
            report: stats
        }
        return validationReport
    })
}