import jwt from 'jsonwebtoken'
import 'dotenv/config'
import User from '../MVC/models/auth.model.js';

export const Authorization = async (req, res, next) => {
    try {
        const token = req.cookies.token;
       
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized', success: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found', success: false });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token', success: false });
    }
}
