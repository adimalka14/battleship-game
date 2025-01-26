import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import path from 'path';

export const NODE_ENV = process.env.NODE_ENV ?? 'dev';

const configPath = path.resolve(__dirname, '..', '..', `.env.${NODE_ENV}`);

expand(config({ path: configPath }));

export const UI_URL = process.env.UI_URL;
export const PORT = process.env.PORT;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-token-secret';
