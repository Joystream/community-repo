import db from '../db'
import { DataTypes, Op, Model } from 'sequelize'

class ValidatorStats extends Model {}

ValidatorStats.init({
  accountId: {type: DataTypes.INTEGER, allowNull: false},
  eraId: {type: DataTypes.INTEGER, allowNull: false},
  stake_total: { type: DataTypes.DECIMAL, defaultValue: 0},
  stake_own: { type: DataTypes.DECIMAL, defaultValue: 0},
  points: { type: DataTypes.INTEGER, defaultValue: 0},
  rewards: { type: DataTypes.DECIMAL, defaultValue: 0},
  commission: DataTypes.DECIMAL
}, 
{modelName: 'validator_stats', sequelize: db, indexes: [
  {
    unique: true,
    fields: ['accountId', 'eraId']
  }
 ]
})

ValidatorStats.removeAttribute('id')

export const findByAccountAndEra = (account: number, era: number): Promise<ValidatorStats> => {
  return ValidatorStats.findOne( 
    { 
      where: {
        accountId: { [Op.eq]: account },
        eraId: { [Op.eq]: era }
      }
  })
}

export default ValidatorStats
