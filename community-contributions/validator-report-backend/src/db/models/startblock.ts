import db from '../db'
import { DataTypes, Model } from 'sequelize'

class StartBlock extends Model {}

StartBlock.init({
  block: DataTypes.INTEGER,
}, {modelName: 'start_block', sequelize: db})

export default StartBlock
