import express from 'express';
import cors from 'cors';
import { queryGameServerInfo } from 'steam-server-query';

const app = express();
const SERVER_IP = '5.189.166.19'; // e.g., '123.45.67.89'
const SERVER_PORT = 5555; // Default port for CS servers

app.use(cors({
    origin: 'http://localhost:4200',  // Allow only your frontend app
    methods: ['GET', 'POST'],        // Allow only GET and POST methods (if needed)
    allowedHeaders: ['Content-Type'], // Allow specific headers (if needed)
}));

app.use(express.json());

// Custom serializer to handle BigInt
function serializeBigInt(obj) {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
}

app.get('/api/cs2/servers', async (req, res) => {
    try {
        const servers = await queryGameServerInfo(`${SERVER_IP}:${SERVER_PORT}`);
        console.log(servers);
        const serializedServers = serializeBigInt(servers);  // Serialize BigInt
        res.json(serializedServers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch servers' });
    }
});

export default app;
