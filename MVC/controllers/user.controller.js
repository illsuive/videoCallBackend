import User from "../models/auth.model.js";
import FriendReq from "../models/FriendReq.model.js";

export const getRecommendedUsers = async (req, res) => {
    try {
        const user = req.user;
        // const user = req.user;  it contain whole user data 
        // it doesnt show friend and myslef
        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: user._id } }, // exclude current user
                { _id: { $nin: user.friends } }, // exclude current user friends
                { onboarded: true } // only include onboarded users
            ]
        }).select(`-password -friends`)

        if (!recommendedUsers) {
            return res.status(404).json({ message: 'No recommended users found', success: false });
        }
        return res.status(200).json({ message: 'Recommended users fetched successfully', success: true, recommendedUsers });
    } catch (error) {
        return res.status(500).json({ message: 'Error getting recommended users', success: false });
    }
}

export const getFriends = async (req, res) => {
    try {
        const user = req.user;
        const friends = await User.findById(user._id)
        .select('friends')
        .populate('friends', 'fullname profilePic nativelanguage learningLanguage')
        if (!friends) {
            return res.status(404).json({ message: 'No friends found', success: false });
        }
        
        return res.status(200).json({ message: 'Friends fetched successfully', success: true, friends });
    } catch (error) {
        return res.status(500).json({ message: 'Error getting friends', success: false });

    }
}

export const sendFriendReq = async (req, res) => {
    try {
        const senderId = req.user._id; 
        const { id: recipientId } = req.params; 
      
        if (senderId.toString() === recipientId) {
            return res.status(400).json({ 
                message: 'You cannot send a friend request to yourself', 
                success: false 
            });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ 
                message: 'Recipient not found', 
                success: false 
            });
        }

        if (req.user.friends.some(friend => friend.toString() === recipientId)) {
            return res.status(400).json({ 
                message: 'You are already friends', 
                success: false 
            });
        }

        const reqExists = await FriendReq.findOne({
            $or: [
                { sender: senderId, recipient: recipientId },
                { sender: recipientId, recipient: senderId }
            ]
        });

        if (reqExists) {
            return res.status(400).json({ 
                message: 'A friend request is already pending or exists between you two', 
                success: false 
            });
        }

        const newReq = await FriendReq.create({
            sender: senderId,
            recipient: recipientId,
            status: 'pending'
        });

        return res.status(201).json({ 
            message: 'Friend request sent successfully', 
            success: true, 
            newReq 
        });

    } catch (error) {
        console.error("Error in sendFriendReq:", error);
        return res.status(500).json({ 
            message: 'Internal server error', 
            success: false 
        });
    }
}

export const handleFriendReq = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params; 
        const { action } = req.body; 
       
        if (!['accepted', 'rejected'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action', success: false });
        }

        const checkReq = await FriendReq.findById(id);

        if (!checkReq) {
            return res.status(404).json({ message: 'Friend request not found', success: false });
        }

        // Ensure the person handling the request is the intended recipient
        if (!checkReq.recipient.equals(userId)) {
            return res.status(403).json({ message: 'Unauthorized action', success: false });
        }

        if (action === 'rejected') {
            // Delete the request so it can be re-sent later if desired
            await FriendReq.findByIdAndDelete(id);
            return res.status(200).json({ message: 'Friend request declined', success: true });
        }

        if (action === 'accepted') {
            if (checkReq.status === 'accepted') {
                return res.status(400).json({ message: 'Already friends', success: false });
            }

            // Update status
            checkReq.status = 'accepted';
            await checkReq.save();

            // Sync friends lists using $addToSet (prevents duplicates)
            await User.findByIdAndUpdate(checkReq.sender, { $addToSet: { friends: checkReq.recipient } });
            await User.findByIdAndUpdate(checkReq.recipient, { $addToSet: { friends: checkReq.sender } });

            return res.status(200).json({ message: 'Friend request accepted', success: true });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
}

export const FetchPendingReq = async (req, res) => {
    try {
       
        const incomingReq = await FriendReq.find({ 
            recipient: req.user._id, 
            status: 'pending' 
        }).populate('sender', 'fullname profilePic username nativelanguage learningLanguage');

        const acceptedReq = await FriendReq.find({ 
            recipient: req.user._id, 
            status: 'accepted' 
        }).populate('sender', 'fullname profilePic username nativelanguage learningLanguage');

        return res.status(200).json({ 
            message: 'Requests fetched successfully', 
            success: true, 
            incomingReq, 
            acceptedReq 
        });
    } catch (error) {
        console.error("FetchPendingReq Error:", error);
        return res.status(500).json({ 
            message: 'Internal server error', 
            success: false 
        });
    }
}

export const removeFriend = async (req, res) => {
    try {
        const userId = req.user._id; 
        const { friendId } = req.params;

        const [updatedUser, updatedFriend] = await Promise.all([
            User.findByIdAndUpdate(
                userId, 
                { $pull: { friends: friendId } }, 
                { new: true }
            ),
            User.findByIdAndUpdate(
                friendId, 
                { $pull: { friends: userId } }, 
                { new: true }
            )
        ]);

        if (!updatedUser || !updatedFriend) {
            return res.status(404).json({ 
                message: "User or Friend not found", 
                success: false 
            });
        }

        return res.status(200).json({
            message: "Friend removed successfully",
            success: true
        });

    } catch (error) {
        console.error("Error in removeFriend:", error);
        return res.status(500).json({ 
            message: 'Internal server error', 
            success: false 
        });
    }
}