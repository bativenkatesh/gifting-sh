const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const StoreSetting = sequelize.define('StoreSetting', {
  key: {
    type: DataTypes.STRING(64),
    primaryKey: true,
    allowNull: false,
  },
  value: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
}, {
  tableName: 'store_settings',
  timestamps: true,
});

module.exports = StoreSetting;
