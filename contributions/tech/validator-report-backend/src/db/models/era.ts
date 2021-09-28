import db from '../db'
import { DataTypes, Model } from 'sequelize'

class Era extends Model {}

Era.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  waitingValidators: DataTypes.INTEGER,
  allValidators: DataTypes.INTEGER,
  timestamp: DataTypes.DATE,
  stake: DataTypes.DECIMAL,
  eraPoints: DataTypes.DECIMAL,
  nominators: DataTypes.INTEGER,
}, { modelName: 'era', sequelize: db })

export default Era
