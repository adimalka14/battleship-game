import { Request, Response, NextFunction } from 'express';
import { v4 as uuid_v4 } from 'uuid';
import { generateAccessToken } from '../utils/token';
import { NODE_ENV } from '../utils/env';

const DAY = 24 * 60 * 60 * 1000;

export const loginCtrl = async (req: Request, res: Response, next: NextFunction) => {
    // todo implement real system login, for now the response return only cookie with token
    let { username } = req.body as { username: string };

    if (!username || username === '') {
        username = `guest-${uuid_v4()}`;
    }

    const id = uuid_v4();
    const accessToken = generateAccessToken(username, id);

    console.log('username', username, 'id', id);

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: NODE_ENV === 'production' ? 'strict' : 'none',
        secure: true,
        maxAge: DAY,
    });

    res.status(200).json({ username, id });
};
