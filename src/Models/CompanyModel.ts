import { DataTypes } from 'sequelize';
import { sequelize } from '../Config/db';

export const Company = sequelize.define('companies', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cnpj: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true,
  },
});
