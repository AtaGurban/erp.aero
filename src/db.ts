import { Sequelize } from 'sequelize-typescript';
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from './utils/envConst';

const sequelize = new Sequelize({
    dialect: 'mysql',
    password: DB_PASSWORD,
    host: DB_HOST,
    username: DB_USER,
    database: DB_NAME,
    logging: false,
});

export default sequelize;
