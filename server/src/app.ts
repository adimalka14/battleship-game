import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { UI_URL } from './utils/env';
import { initAppRoutes } from './routers';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: UI_URL,
        methods: ['GET', 'POST'],
        credentials: true,
    })
);
app.use(helmet());
app.use(cookieParser());

initAppRoutes(app);

export default app;
