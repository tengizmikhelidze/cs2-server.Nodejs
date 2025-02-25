// src/server.mjs
import express from 'express';
import SteamServerQuery from 'steam-server-query'; // Import the package
import cors from 'cors';

const app = express();
const port = 3000;

// Replace with your CS2 server IP and port
const SERVER_IP = '5.189.166.19'; // e.g., '123.45.67.89'
const SERVER_PORT = 5555; // Default port for CS servers

app.use(cors({
    origin: 'http://localhost:4200', // Adjust to the correct origin
}));

app.get('/cs2/servers', (req, res) => {
    const query = new SteamServerQuery(SERVER_IP, SERVER_PORT);

    query.getInfo((err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to query server', details: err });
        }

        res.json({
            serverName: data.serverName,
            map: data.map,
            players: data.players,
            maxPlayers: data.maxPlayers,
            version: data.version,
        });
    });
});
