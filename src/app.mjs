import express from 'express';
import cors from 'cors';
import corsConfig from './config/corsConfig.mjs';
import serverRoutes from './routes/serverRoutes.mjs';
import authenticationRouter from "./routes/authenticationRoutes.mjs";

const app = express();

app.use(cors(corsConfig));
app.use(express.json());

app.use(serverRoutes);
app.use(authenticationRouter);

export default app;