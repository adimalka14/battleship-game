import { Request, Response, NextFunction } from 'express';
import { v4 as uuid_v4 } from 'uuid';
import { generateAccessToken, verifyAccessToken } from '../utils/token';
import { NODE_ENV } from '../utils/env';
import logger from '../utils/logger';

const DAY = 24 * 60 * 60 * 1000;

export const loginCtrl = async (req: Request, res: Response, next: NextFunction) => {
    // todo implement real system login, for now the response return only cookie with token
    try {
        const token = req.cookies?.accessToken;
        if (token) {
            const { username, id } = verifyAccessToken(token);
            logger.info(req.id, 'user already logged in', { username, id });
            res.status(200).json({ username, id });
            return;
        }
    } catch (err) {
        logger.warn(req.id, 'invalid token, creating a new one');
    }

    let { username } = req.body as { username: string };

    if (!username || username === '') {
        username = `guest-${uuid_v4()}`;
    }

    const id = uuid_v4();
    const accessToken = generateAccessToken(username, id);

    logger.info(req.id, 'user logged in', { username, id });

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: NODE_ENV === 'production' ? 'strict' : 'none',
        secure: true,
        maxAge: DAY,
    });

    res.status(200).json({ username, id });
};
