import express from 'express';
import {getAllUsers, login, register} from "../controllers/authenticationController.mjs";

const authenticationRouter = express.Router();

authenticationRouter.get('/api/auth/login', login);
authenticationRouter.post('/api/auth/register', register);
authenticationRouter.get('/api/auth/users', getAllUsers);

export default authenticationRouter;