import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname  : { type: String, required: true },
    email     : { type: String, required: true, unique: true },
    password  : { type: String, required: true , minlength : 6},
    bio : { type: String, required: false , default : ''},
    nativelanguage : { type: String, required: false , default : ''},
    learningLanguage : { type: String, required: false , default : ''},
    location : { type: String, required: false , default : ''},
    profilePic : { type: String, required: false , default : ''},
    publicId : { type: String, required: false , default : ''},
    onboarded : { type: Boolean, default : false},
    friends : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    otp : { type: String, required: false , default : ''},

}, {timestamps : true})

const User = mongoose.model('User' , userSchema)

export default User;