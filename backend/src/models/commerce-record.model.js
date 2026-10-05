const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const CommerceRecord = sequelize.define('CommerceRecord', {
  key: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false,
  },
  kind: {
    type: DataTypes.STRING(32),
    allowNull: false,
  },
  value: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
}, {
  tableName: 'commerce_records',
  timestamps: true,
  indexes: [{ fields: ['kind'] }],
});

module.exports = CommerceRecord;
