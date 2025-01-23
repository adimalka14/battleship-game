//import { config } from 'dotenv';
//import { expand } from 'dotenv-expand';
//import path from 'path';

//const configPath = path.resolve(__dirname, '..', '..', `.env.${process.env.NODE_ENV ?? 'dev'}`);

//console.log(configPath);

//expand(config({ path: configPath }));

export const SERVER_URL = (process.env.SERVER_URL as string) || 'http://localhost:3000';
