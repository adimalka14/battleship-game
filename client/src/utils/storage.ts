import { Ship } from '../interfaces/Ship';

interface Storage {
    gameConfig?: any;
    username?: string;
    ships?: Ship[];
}

const STORAGE: Storage = {};

export default STORAGE;
