import { PromiseSocket } from "../promiseSocket.mjs"

/**
 * Send a A2S_INFO request to a game server. Retrieves information like its name, the current map, the number of players and so on.
 *
 * Read more [here](https://developer.valvesoftware.com/wiki/Server_queries#A2S_INFO).
 * @param gameServer Host and port of the game server to call.
 * @param attempts Optional. Number of call attempts to make. Default is 1 attempt.
 * @param timeout Optional. Time in milliseconds after the socket request should fail. Default is 1000. Specify an array of timeouts if they should be different for every attempt.
 * @returns A promise including an object of the type `InfoResponse`
 */
export async function queryGameServerInfo(
    gameServer,
    attempts = 1,
    timeout = 1000
) {
    const splitGameServer = gameServer.split(":")
    const host = splitGameServer[0]
    const port = parseInt(splitGameServer[1])

    const gameServerQuery = new GameServerQuery(host, port, attempts, timeout)
    const result = await gameServerQuery.info()
    return result
}

/**
 * Send a A2S_PLAYER request to a game server. Retrieves the current playercount and for every player their name, score and duration.
 *
 * Read more [here](https://developer.valvesoftware.com/wiki/Server_queries#A2S_PLAYER).
 * @param gameServer Host and port of the game server to call.
 * @param attempts Optional. Number of call attempts to make. Default is 1 attempt.
 * @param timeout Optional. Time in milliseconds after the socket request should fail. Default is 1000. Specify an array of timeouts if they should be different for every attempt.
 * @returns A promise including an object of the type `PlayerResponse`
 */
export async function queryGameServerPlayer(
    gameServer,
    attempts = 1,
    timeout = 1000
) {
    const splitGameServer = gameServer.split(":")
    const host = splitGameServer[0]
    const port = parseInt(splitGameServer[1])

    const gameServerQuery = new GameServerQuery(host, port, attempts, timeout)
    const result = await gameServerQuery.player()
    return result
}

/**
 * Send a A2S_RULES request to a game server. Retrieves the rule count and for every rule its name and value.
 *
 * Read more [here](https://developer.valvesoftware.com/wiki/Server_queries#A2S_RULES).
 * @param gameServer Host and port of the game server to call.
 * @param attempts Optional. Number of call attempts to make. Default is 1 attempt.
 * @param timeout Optional. Time in milliseconds after the socket request should fail. Default is 1000. Specify an array of timeouts if they should be different for every attempt.
 * @returns A promise including an object of the type `RulesResponse`
 */
export async function queryGameServerRules(
    gameServer,
    attempts = 1,
    timeout = 1000
) {
    const splitGameServer = gameServer.split(":")
    const host = splitGameServer[0]
    const port = parseInt(splitGameServer[1])

    const gameServerQuery = new GameServerQuery(host, port, attempts, timeout)
    const result = await gameServerQuery.rules()
    return result
}

class GameServerQuery {
    constructor(_host, _port, attempts, timeout) {
        this._host = _host
        this._port = _port
        this._promiseSocket = new PromiseSocket(attempts, timeout)
    }

    async info() {
        let resultBuffer
        try {
            resultBuffer = await this._promiseSocket.send(
                this._buildInfoPacket(),
                this._host,
                this._port
            )
        } catch (err) {
            this._promiseSocket.closeSocket()
            throw new Error(err)
        }

        // If the server replied with a challenge, grab challenge number and send request again
        if (this._isChallengeResponse(resultBuffer)) {
            resultBuffer = resultBuffer.slice(5)
            const challenge = resultBuffer
            try {
                resultBuffer = await this._promiseSocket.send(
                    this._buildInfoPacket(challenge),
                    this._host,
                    this._port
                )
            } catch (err) {
                this._promiseSocket.closeSocket()
                throw new Error(err)
            }
        }

        this._promiseSocket.closeSocket()

        const parsedInfoBuffer = this._parseInfoBuffer(resultBuffer)
        return parsedInfoBuffer
    }

    async player() {
        let resultBuffer
        let gotPlayerResponse = false
        let challengeTries = 0

        do {
            let challengeResultBuffer
            try {
                challengeResultBuffer = await this._promiseSocket.send(
                    this._buildPacket(Buffer.from([0x55])),
                    this._host,
                    this._port
                )
            } catch (err) {
                this._promiseSocket.closeSocket()
                throw new Error(err)
            }

            const challenge = challengeResultBuffer.slice(5)
            try {
                resultBuffer = await this._promiseSocket.send(
                    this._buildPacket(Buffer.from([0x55]), challenge),
                    this._host,
                    this._port
                )
            } catch (err) {
                this._promiseSocket.closeSocket()
                throw new Error(err)
            }

            if (!this._isChallengeResponse(resultBuffer)) {
                gotPlayerResponse = true
            }

            challengeTries++
        } while (!gotPlayerResponse && challengeTries < 5)

        this._promiseSocket.closeSocket()

        if (this._isChallengeResponse(resultBuffer)) {
            throw new Error("Server kept sending challenge responses.")
        }

        const parsedPlayerBuffer = this._parsePlayerBuffer(resultBuffer)
        return parsedPlayerBuffer
    }

    async rules() {
        let challengeResultBuffer
        try {
            challengeResultBuffer = await this._promiseSocket.send(
                this._buildPacket(Buffer.from([0x56])),
                this._host,
                this._port
            )
        } catch (err) {
            this._promiseSocket.closeSocket()
            throw new Error(err)
        }

        const challenge = challengeResultBuffer.slice(5)

        let resultBuffer
        try {
            resultBuffer = await this._promiseSocket.send(
                this._buildPacket(Buffer.from([0x56]), challenge),
                this._host,
                this._port
            )
        } catch (err) {
            this._promiseSocket.closeSocket()
            throw new Error(err)
        }

        this._promiseSocket.closeSocket()

        const parsedRulesBuffer = this._parseRulesBuffer(resultBuffer)
        return parsedRulesBuffer
    }

    _buildInfoPacket(challenge) {
        let packet = Buffer.concat([
            Buffer.from([0xff, 0xff, 0xff, 0xff]),
            Buffer.from([0x54]),
            Buffer.from("Source Engine Query", "ascii"),
            Buffer.from([0x00])
        ])
        if (challenge) {
            packet = Buffer.concat([packet, challenge])
        }
        return packet
    }

    _buildPacket(header, challenge) {
        let packet = Buffer.concat([Buffer.from([0xff, 0xff, 0xff, 0xff]), header])
        if (challenge) {
            packet = Buffer.concat([packet, challenge])
        } else {
            packet = Buffer.concat([packet, Buffer.from([0xff, 0xff, 0xff, 0xff])])
        }
        return packet
    }

    _isChallengeResponse(buffer) {
        return (
            buffer.compare(
                Buffer.from([0xff, 0xff, 0xff, 0xff, 0x41]),
                0,
                5,
                0,
                5
            ) === 0
        )
    }

    _parseInfoBuffer(buffer) {
        const infoResponse = {}
        buffer = buffer.slice(5)
        ;[infoResponse.protocol, buffer] = this._readUInt8(buffer)
        ;[infoResponse.name, buffer] = this._readString(buffer)
        ;[infoResponse.map, buffer] = this._readString(buffer)
        ;[infoResponse.folder, buffer] = this._readString(buffer)
        ;[infoResponse.game, buffer] = this._readString(buffer)
        ;[infoResponse.appId, buffer] = this._readInt16LE(buffer)
        ;[infoResponse.players, buffer] = this._readUInt8(buffer)
        ;[infoResponse.maxPlayers, buffer] = this._readUInt8(buffer)
        ;[infoResponse.bots, buffer] = this._readUInt8(buffer)

        infoResponse.serverType = buffer.subarray(0, 1).toString("utf-8")
        buffer = buffer.slice(1)

        infoResponse.environment = buffer.subarray(0, 1).toString("utf-8")
        buffer = buffer.slice(1)
        ;[infoResponse.visibility, buffer] = this._readUInt8(buffer)
        ;[infoResponse.vac, buffer] = this._readUInt8(buffer)
        ;[infoResponse.version, buffer] = this._readString(buffer)

        // if the extra data flag (EDF) is present
        if (buffer.length > 1) {
            let edf
            ;[edf, buffer] = this._readUInt8(buffer)
            if (edf & 0x80) {
                ;[infoResponse.port, buffer] = this._readInt16LE(buffer)
            }
            if (edf & 0x10) {
                buffer = buffer.slice(8)
            }
            if (edf & 0x40) {
                ;[infoResponse.spectatorPort, buffer] = this._readUInt8(buffer)
                ;[infoResponse.spectatorName, buffer] = this._readString(buffer)
            }
            if (edf & 0x20) {
                ;[infoResponse.keywords, buffer] = this._readString(buffer)
            }
            if (edf & 0x01) {
                infoResponse.gameId = buffer.readBigInt64LE()
                buffer = buffer.slice(8)
            }
        }

        return infoResponse
    }

    _parsePlayerBuffer(buffer) {
        const playerResponse = {}
        buffer = buffer.slice(5)
        ;[playerResponse.playerCount, buffer] = this._readUInt8(buffer)

        playerResponse.players = []
        for (let i = 0; i < playerResponse.playerCount; i++) {
            let player
            ;[player, buffer] = this._readPlayer(buffer)
            playerResponse.players.push(player)
        }

        return playerResponse
    }

    _parseRulesBuffer(buffer) {
        const rulesResponse = {}
        buffer = buffer.slice(5)
        ;[rulesResponse.ruleCount, buffer] = this._readInt16LE(buffer)

        rulesResponse.rules = []
        for (let i = 0; i < rulesResponse.ruleCount; i++) {
            let rule
            ;[rule, buffer] = this._readRule(buffer)
            rulesResponse.rules.push(rule)
        }

        return rulesResponse
    }

    _readString(buffer) {
        const endOfName = buffer.indexOf(0x00)
        const stringBuffer = buffer.subarray(0, endOfName)
        const modifiedBuffer = buffer.slice(endOfName + 1)
        return [stringBuffer.toString("utf-8"), modifiedBuffer]
    }

    _readUInt8(buffer) {
        return [buffer.readUInt8(), buffer.slice(1)]
    }

    _readInt16LE(buffer) {
        return [buffer.readInt16LE(), buffer.slice(2)]
    }

    _readPlayer(buffer) {
        let player = {}
        ;[player.index, buffer] = this._readUInt8(buffer)
        ;[player.name, buffer] = this._readString(buffer)
        player.score = buffer.readInt32LE()
        buffer = buffer.slice(4)
        player.duration = buffer.readFloatLE()
        buffer = buffer.slice(4)

        return [player, buffer]
    }

    _readRule(buffer) {
        let rule = {}
        ;[rule.name, buffer] = this._readString(buffer)
        ;[rule.value, buffer] = this._readString(buffer)

        return [rule, buffer]
    }
}
