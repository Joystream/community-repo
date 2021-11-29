import db from '../db'

import { DataTypes, Model } from 'sequelize'

class Account extends Model {}

Account.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  key: DataTypes.STRING,
  format: DataTypes.STRING,
  about: DataTypes.TEXT,
}, {modelName: 'account', sequelize: db})

export default Account
