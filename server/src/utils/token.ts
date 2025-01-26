import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from './env';

export const generateAccessToken = (username: string, id: string) => {
    return jwt.sign({ username, id }, ACCESS_TOKEN_SECRET, {
        expiresIn: '24h',
    });
};

export const verifyAccessToken = (token: string): { username: string; id: string } => {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as { username: string; id: string };
};
