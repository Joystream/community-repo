import db from './db'
import {
  Block,
  Event,
  Category,
  Channel,
  Council,
  Consul,
  ConsulStake,
  Member,
  Post,
  Proposal,
  Thread,
} from './models'

const blocks: any[] = [] //require('../../blocks.json')

async function runSeed() {
  await db.sync({ force: true })
  console.log('db synced!')
  console.log('seeding...')
  try {
    if (blocks.length) {
      console.log('importing blocks')
      const b = await Block.bulkCreate(blocks)
      console.log(`${b.length} blocks imported`)
    }
  } catch (err) {
    console.error(`sequelize error:`, err)
    process.exitCode = 1
  } finally {
    console.log('closing db connection')
    await db.close()
    console.log('db connection closed')
  }
}

runSeed()
