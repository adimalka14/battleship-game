import { Express, NextFunction, Request, Response } from 'express';
import authRouter from './auth.router';
import logger from '../utils/logger';

export const initAppRoutes = (app: Express) => {
    app.use('/api/auth', authRouter);

    app.use('/api', (req, res) => {
        res.send('api');
    });

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        logger.error(req.id, 'error processing request', { err });
        next(err);
    });
};
