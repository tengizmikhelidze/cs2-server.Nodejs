import { queryGameServerInfo } from 'steam-server-query';

const SERVER_IP = '5.189.166.19';
const SERVER_PORT = 5555;

function serializeBigInt(obj) {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
}

export const getServers = async (req, res) => {
    try {
        const servers = await queryGameServerInfo(`${SERVER_IP}:${SERVER_PORT}`);
        console.log(servers);
        const serializedServers = serializeBigInt(servers);
        res.json(serializedServers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch servers' });
    }
};