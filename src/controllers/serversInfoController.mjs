import { queryGameServerInfo } from 'steam-server-query';

function serializeBigInt(obj) {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
}

export const getServers = async (req, res) => {
    try {
        const [execute1Server, retake1Server] = await Promise.all([
            getExecute1Server().catch((error) => {
                console.log(error);
                return {};
            }),
            getRetake1Server().catch((error) => {
                console.log(error);
                return {};
            })
        ]);

        const serverInfo = {
            execute1: execute1Server,
            retake1: retake1Server
        }

        res.json(serverInfo);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch servers' });
    }
};

export const getExecute1Server = async (req, res) => {
    try {
        const servers = await queryGameServerInfo(`${process.env.SERVERS_IP}:${process.env.EXECUTE_SERVER_PORT}`, 1, 3000);
        const serializedServers = serializeBigInt(servers);
        res.json(serializedServers);
    } catch (err) {
        res.status(500).json({ error: err});
    }
};

export const getRetake1Server = async (req, res) => {
    try {
        const servers = await queryGameServerInfo(`${process.env.SERVERS_IP}:${process.env.RETAKE_SERVER_PORT}`, 1, 3000);
        const serializedServers = serializeBigInt(servers);
        res.json(serializedServers);
    } catch (err) {
        res.status(500).json({ error: err });
    }
};