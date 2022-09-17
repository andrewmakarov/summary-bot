/* eslint-disable @typescript-eslint/no-unused-vars */
import dotenv from 'dotenv';
import Bot from './bot';
import { Cache } from './cache/cache';
import { initLog } from './log';

dotenv.config();
initLog();

const cache = new Cache();

const bot = new Bot(cache);
