/* eslint-disable @typescript-eslint/no-unused-vars */
import dotenv from 'dotenv';
import Bot from './bot';
import Model from './model';
import { DataBase } from './model/db';
import SheetsEditor from './sheetsEditor';

dotenv.config();

const model = new Model();
const sheetsEditor = new SheetsEditor(model);
const dataBase = new DataBase();

const bot = new Bot(sheetsEditor, model, dataBase);
