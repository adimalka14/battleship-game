import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import path from 'path';

const configPath = path.resolve(__dirname, '..', '..', `.env.${process.env.NODE_ENV ?? 'dev'}`);

expand(config({ path: configPath }));

export const SERVER_URL = process.env.SERVER_URL;
