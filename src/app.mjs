import express from 'express';
import cors from 'cors';
import corsConfig from './config/corsConfig.mjs';
import serverRoutes from './routes/serverRoutes.mjs';

const app = express();

app.use(cors(corsConfig));
app.use(express.json());

app.use(serverRoutes);

export default app;