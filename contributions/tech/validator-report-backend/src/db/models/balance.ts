import db from '../db'
import { DataTypes, Model } from 'sequelize'

class Balance extends Model {}

Balance.init({
  available: DataTypes.INTEGER,  
  locked: DataTypes.INTEGER,
  frozen: DataTypes.INTEGER,
}, { modelName: 'balance', sequelize: db })

export default Balance
