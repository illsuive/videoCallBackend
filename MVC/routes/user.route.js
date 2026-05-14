import express from 'express'
const router = express.Router()

import { Authorization } from '../../middleware/auth.js'
import {
    getRecommendedUsers, getFriends, sendFriendReq , handleFriendReq , FetchPendingReq , removeFriend
} from '../controllers/user.controller.js'

router.get('/', Authorization, getRecommendedUsers)
router.get('/friends', Authorization, getFriends)

router.post('/request/:id', Authorization, sendFriendReq)
router.put('/friend-request/:id/handle', Authorization, handleFriendReq)
router.get('/friend-request', Authorization, FetchPendingReq)
router.delete('/friend/:friendId', Authorization, removeFriend)

export default router;