import { DataTypes } from 'sequelize';
import { sequelize } from '../Config/db';

export const Company = sequelize.define('companies', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  nomeFantasia: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  razaoSocial: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cnpj: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true,
  },
  uf: {
    type: DataTypes.STRING(2),
    allowNull: true,
  },
  cep: {
    type: DataTypes.STRING(8),
    allowNull: false,
  },
  logradouro: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});
