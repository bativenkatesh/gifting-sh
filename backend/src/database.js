const https = require('https');
const { Client, Pool, neonConfig, types } = require('@neondatabase/serverless');
const { DataTypes, Sequelize } = require('sequelize');
const env = require('./config/env');

const ipv4Agent = new https.Agent({ family: 4 });
const connectionString = env.databaseUrl?.replace('sslmode=require', 'sslmode=verify-full');

class IPv4WebSocket extends (require('ws')) {
  constructor(url, protocols) {
    super(url, protocols, { agent: ipv4Agent });
  }
}

neonConfig.webSocketConstructor = IPv4WebSocket;

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  dialectModule: { Client, Pool, types },
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

async function checkDatabaseConnection() {
  if (!env.databaseUrl) {
    console.warn('DATABASE_URL is not configured; continuing in local in-memory mode.');
    return;
  }

  await sequelize.authenticate();
}

async function migrateUserAuthColumns() {
  const queryInterface = sequelize.getQueryInterface();
  const columns = await queryInterface.describeTable('users');
  const additions = [
    ['role', {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: 'user',
    }],
    ['isVerified', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }],
    ['requiresEmailVerification', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }],
    ['isActive', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    }],
  ];
  const addedColumns = [];

  for (const [columnName, definition] of additions) {
    if (!columns[columnName]) {
      await queryInterface.addColumn('users', columnName, definition);
      addedColumns.push(columnName);
    }
  }

  if (addedColumns.length > 0) {
    console.log(`Added missing users columns: ${addedColumns.join(', ')}`);
  }
}

async function initializeDatabase(models) {
  if (!env.databaseUrl) {
    return models;
  }

  await checkDatabaseConnection();
  await sequelize.sync();
  await migrateUserAuthColumns();
  return models;
}

module.exports = { checkDatabaseConnection, initializeDatabase, sequelize };