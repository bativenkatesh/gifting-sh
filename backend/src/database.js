const https = require('https');
const { Client, Pool, neonConfig, types } = require('@neondatabase/serverless');
const { Sequelize } = require('sequelize');
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
    throw new Error('DATABASE_URL is not configured');
  }

  await sequelize.authenticate();
}

async function initializeDatabase(models) {
  await checkDatabaseConnection();
  await sequelize.sync();
  return models;
}

module.exports = { checkDatabaseConnection, initializeDatabase, sequelize };