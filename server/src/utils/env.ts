import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import path from 'path';

const configPath = path.resolve(__dirname, '..', '..', `.env.${process.env.NODE_ENV ?? 'dev'}`);

expand(config({ path: configPath }));

export const UI_URL = process.env.UI_URL;
export const PORT = process.env.PORT;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-token-secret';
