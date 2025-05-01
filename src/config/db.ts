import { Sequelize } from 'sequelize';
import { ENV } from '../server';

const sequelize = new Sequelize(
    ENV.DB_NAME as string,
    ENV.DB_USER as string,
    ENV.DB_PASS as string,
    {
        host: ENV.DB_HOST,
        dialect: 'mysql',
        logging: false,
    }
);

export default sequelize;