import { Ship } from '../interfaces/Ship';

interface Storage {
    GAME_CONFIG?: any;
    USERNAME?: string;
    SHIPS?: Ship[];
}

const STORAGE: Storage = {};

export default STORAGE;
