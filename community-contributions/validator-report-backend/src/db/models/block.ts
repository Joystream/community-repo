import db from '../db'
import { DataTypes, Op, Model } from 'sequelize'

class Block extends Model {}

Block.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
  },
  validatorId: {type: DataTypes.INTEGER, allowNull: false},
  eraId: {type: DataTypes.INTEGER, allowNull: false},
  hash: DataTypes.STRING,
  timestamp: DataTypes.DATE,
  blocktime: DataTypes.BIGINT,
}, {modelName: 'block', sequelize: db})


export const findLastProcessedBlockId = (start: number, end: number): Promise<number> => {
  return Block.max('id', 
    { 
      where: {
        id: {
          [Op.and]: {
            [Op.gte]: start,
            [Op.lt]: end,
          }
        }
      }
  })
}

export default Block
