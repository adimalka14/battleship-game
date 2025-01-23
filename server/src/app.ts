import express from 'express';
import cors from 'cors';
import { UI_URL } from './utils/env';

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

app.use('/', (req, res) => {
    res.send('api');
});

export default app;
