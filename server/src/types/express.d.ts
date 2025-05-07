import { Request } from 'express';

declare global {
    module Express {
        interface Request {
            id: string;
        }
    }
}
