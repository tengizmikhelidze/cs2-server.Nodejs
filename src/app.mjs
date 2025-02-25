import express from 'express';
import './cs2/cs2-servers.mjs'

const app = express();
app.use(express.json());

export default app;
