import { generateToken } from "../../utils/stream.js";

export const createStreamToken = async (req, res)=> {
    try {
        const token = await generateToken(req.user._id);
        return res.status(200).json({ message: 'Stream token generated successfully', success: true, token });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
} 