import { StreamChat } from "stream-chat";
import 'dotenv/config'

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

if (!apiKey || !apiSecret) {
    throw new Error("Stream API key or secret is not defined");
}

const streamClient  = StreamChat.getInstance(apiKey, apiSecret);

export const upsertUserToStream = async (userData) => {
    try {
        const res = await streamClient.upsertUser(userData);
        return res;
    } catch (error) {
        console.error("Error creating Stream user:", error);
        return false;
    }
}

export const generateToken = async (userId) => {
    try {
        const token = streamClient.createToken(userId.toString());
        return token;
    } catch (error) {
        console.error("Error generating Stream token:", error);
        return null;
    }
}