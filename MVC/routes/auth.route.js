import express from 'express'
const router = express.Router()

import {createUser , loginUser , logoutUser , onboardedUser} from '../controllers/auth.contoller.js'
import {Authorization} from '../../middleware/auth.js'

router.post('/register' , createUser)
router.post('/login' , loginUser)
router.get('/logout' , logoutUser)

router.patch('/onboarded' , Authorization , onboardedUser)

export default router;