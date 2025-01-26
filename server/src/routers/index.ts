import { Express, NextFunction, Request, Response } from 'express';
import authRouter from './auth.router';
import app from '../app';

export const initAppRoutes = (app: Express) => {
    app.use('/api/auth', authRouter);

    app.use('/api', (req, res) => {
        res.send('api');
    });

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(err.stack);
        next(err);
    });
};
