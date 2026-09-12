const fs = require('fs');
const dotenv = require('dotenv');

for (const file of ['.env.local', '.env']) {
  if (fs.existsSync(file)) {
    dotenv.config({ path: file });
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL,
  databaseUrlUnpooled: process.env.DATABASE_URL_UNPOOLED,
  jwtSecret: process.env.JWT_SECRET || 'development-only-change-me',
};

module.exports = env;
