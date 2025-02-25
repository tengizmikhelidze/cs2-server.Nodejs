import express from 'express';
import './cs2/cs2-servers.mjs'
import cors from "cors";

const app = express();

app.use(cors({
    origin: '*',  // Allow only your frontend app
    methods: ['GET', 'POST'],        // Allow only GET and POST methods (if needed)
    allowedHeaders: ['Content-Type'], // Allow specific headers (if needed)
}));

app.use(express.json());

export default app;
