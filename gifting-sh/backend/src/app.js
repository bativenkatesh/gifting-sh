import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import healthRoutes from './routes/healthRoutes.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: { write: (msg) => logger.info(msg.trim()) } }));

app.use('/api/health', healthRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
