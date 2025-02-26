import express from 'express';
import { getServers } from '../controllers/serversInfoController.mjs';

const router = express.Router();

router.get('/api/cs2/servers', getServers);

export default router;