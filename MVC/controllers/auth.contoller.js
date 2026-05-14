import User from '../models/auth.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { upsertUserToStream } from '../../utils/stream.js'

export const createUser = async (req, res) => {
    try {
        const { fullname, email, password } = req.body
        if (!fullname || !email || !password) {
            return res.status(400).json({ message: 'All fields are required', success: false });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long', success: false });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format', success: false });
        }

        const userExists = await User.findOne({ email })

        if (userExists) {
            return res.status(400).json({ message: 'User already exists', success: false });
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            fullname,
            email,
            password: hashedPassword
        })

        try {
            await upsertUserToStream({
                id: newUser._id.toString(),
                name: newUser.fullname,
                image: newUser.profilePic || ''
            })
            console.log(`stream user created`);
        } catch (error) {
            console.log(error);
        }

        await newUser.save()
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production'
        });

        return res.status(201).json({ message: 'User created successfully', success: true, token, newUser });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating user', success: false });
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required', success: false });
        }

        const existUser = await User.findOne({ email })

        if (!existUser) {
            return res.status(400).json({ message: 'User does not exist', success: false });
        }

        const isPasswordValid = await bcrypt.compare(password, existUser.password)

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password', success: false });
        }

        const token = jwt.sign({ userId: existUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const userWithoutPassword = existUser.toObject();
        delete userWithoutPassword.password;

        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production'
        });

        return res.status(201).json({ message: 'User logged in successfully', success: true, token, existUser: userWithoutPassword });

    } catch (error) {
        return res.status(500).json({ message: 'Error logging in user', success: false });
    }
}

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie('token');
        return res.status(200).json({ message: 'User logged out successfully', success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Error logging out user', success: false });
    }
}

export const onboardedUser = async (req, res) => {
    try {
        const user = req.user;

        // if (!user.onboarded) {
        //     return res.status(400).json({ message: 'User already onboarded', success: false });
        // }

        if (!user) {
            return res.status(400).json({ message: 'User not found', success: false });
        }

        const { bio, nativelanguage, location, learningLanguage } = req.body

        if (!bio || !nativelanguage || !location || !learningLanguage) {
            return res.status(400).json({ message: 'All fields are required', success: false });
        }

        const updatedUser = await User.findByIdAndUpdate(user._id, {
            bio,
            nativelanguage,
            location,
            learningLanguage,
            profilePic: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            onboarded: true
        }, { new: true }).select('-password');

        if (!updatedUser) {
            return res.status(400).json({ message: 'Error updating user', success: false });
        }

        try {
            await upsertUserToStream({
                id: user._id.toString(),
                name: updatedUser.fullname,
                image: updatedUser.profilePic || '',
                language: updatedUser.nativelanguage
            });
            console.log(`stream user updated`);
        } catch (error) {
            console.log(`error update stream user`, error);
        }

        return res.status(200).json({ message: 'User onboarded successfully', success: true, user: updatedUser });

    } catch (error) {
        return res.status(500).json({ message: 'Error onboarded user', success: false });
    }
}
