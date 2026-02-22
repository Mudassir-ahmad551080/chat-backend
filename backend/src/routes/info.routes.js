import express from 'express'
import { userInformation } from '../controllers/userinfo.controller.js';

const router = express.Router();

router.post('/info',userInformation)


export default router;