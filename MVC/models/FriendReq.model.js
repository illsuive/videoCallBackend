import mongoose from "mongoose";

const FriendReqSchema = new mongoose.Schema({
    sender : { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,required : true},
    recipient : { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,required : true},
    status : { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, {timestamps : true})

const FriendReq = mongoose.model('FriendReq' , FriendReqSchema)

export default FriendReq;