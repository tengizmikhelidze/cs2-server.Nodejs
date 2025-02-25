import express from 'express';
import cors from "cors";
import {queryMasterServer} from "steam-server-query";

const app = express();
const SERVER_IP = '5.189.166.19'; // e.g., '123.45.67.89'
const SERVER_PORT = 5555; // Default port for CS servers

app.use(cors({
    origin: 'http://localhost:4200',  // Allow only your frontend app
    methods: ['GET', 'POST'],        // Allow only GET and POST methods (if needed)
    allowedHeaders: ['Content-Type'], // Allow specific headers (if needed)
}));

app.use(express.json());

app.get('/cs2/servers',  (req, res) => {
    queryMasterServer(`${SERVER_IP}:${SERVER_PORT}`, undefined, undefined, 30000).then(servers => {
        console.log(servers);
    }).catch((err) => {
        console.error(err);
    });
});

export default app;
