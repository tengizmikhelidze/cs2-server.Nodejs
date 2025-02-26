import { queryGameServerInfo } from "../steam-server-query/index.js";

function serializeBigInt(obj) {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
}

async function fetchServerInfo(ip, port) {
    try {
        const serverInfo = await queryGameServerInfo(`${ip}:${port}`, 1, 5000);
        return serializeBigInt(serverInfo);
    } catch (err) {
        return { error: `Failed to fetch server info for ${ip}:${port} - ${err.message}` };
    }
}

export const getServers = async (req, res) => {
    try {
        const errors = {};

        const [execute1Server, retake1Server] = await Promise.all([
            fetchServerInfo(process.env.SERVERS_IP, process.env.EXECUTE_SERVER_PORT)
                .catch((err) => {
                    errors['execute1'] = err.message;
                    return null;
                }),
            fetchServerInfo(process.env.SERVERS_IP, process.env.RETAKE_SERVER_PORT)
                .catch((err) => {
                    errors['retake1'] = err.message;
                    return null;
                })
        ]);

        if (!execute1Server && !retake1Server) {
            return res.status(500).json({ error: 'Failed to fetch all servers', details: errors });
        }

        res.json({
            execute1: execute1Server,
            retake1: retake1Server,
            errors: Object.keys(errors).length ? errors : undefined,
        });

    } catch (err) {
        res.status(500).json({ error: 'Unexpected error', details: err.message });
    }
};