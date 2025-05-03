import { Sequelize } from 'sequelize';
import { ENV } from '../server';

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: ENV.DB_HOST,
  port: Number(ENV.DB_PORT),
  username: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  logging: false,
});
