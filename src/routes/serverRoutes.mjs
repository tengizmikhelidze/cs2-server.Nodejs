import express from 'express';
import {getServerPlayersInfo, getServers} from '../controllers/serversInfoController.mjs';

const router = express.Router();

router.get('/api/cs2/servers', getServers);
router.get('/api/cs2/servers/players', getServerPlayersInfo);

export default router;