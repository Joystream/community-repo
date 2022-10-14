import Account from './account'
import Balance from './balance'
import Block from './block'
import Era from './era'
import Event from './event'
import ValidatorStats from './validatorstats'
import StartBlock from './startblock'

Account.hasMany(Balance)

Balance.belongsTo(Account)
Balance.belongsTo(Era)

Era.hasMany(Balance)
Era.hasMany(Block)

Block.belongsTo(Account, { as: 'validator' })
Block.belongsTo(Era)
Block.hasMany(Event)

Event.belongsTo(Block)

ValidatorStats.belongsTo(Era)
ValidatorStats.belongsTo(Account)

export {
  Account,
  Balance,
  Block,
  Era,
  Event,
  ValidatorStats,
  StartBlock
}
