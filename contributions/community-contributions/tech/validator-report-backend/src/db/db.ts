import { Sequelize} from 'sequelize'

const dbName = process.env.NODE_ENV;
const dbUrl = process.env.DATABASE_URL || `postgres://localhost:5432/${dbName}`;
const db = new Sequelize(dbUrl, {logging: () => false});
// const db = new Sequelize(dbUrl, {logging: console.log});

// export default new Sequelize(dbUrl, {logging: console.log})
export default db;
