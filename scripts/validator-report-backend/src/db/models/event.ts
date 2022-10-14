import db from '../db'
import { DataTypes, Model } from 'sequelize'

class Event extends Model {}

Event.init({
  blockId: DataTypes.INTEGER,
  section: DataTypes.STRING,
  method: DataTypes.STRING,
  data: DataTypes.JSONB
}, { modelName: 'event', sequelize: db })

export default Event
