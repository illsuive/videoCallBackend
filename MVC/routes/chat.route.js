import expess from 'express'
const router = expess.Router()

import { Authorization } from '../../middleware/auth.js';
import {
    createStreamToken
} from '../controllers/chat.controller.js'

router.get('/stream-token', Authorization, createStreamToken)

export default router; 