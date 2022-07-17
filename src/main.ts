/* eslint-disable @typescript-eslint/no-unused-vars */
import dotenv from 'dotenv';
import Bot from './bot';
import Model from './model';
import { DataBase } from './model/db';
import SheetsEditor from './sheetsEditor';

dotenv.config();

const model = new Model();
const dataLayer = new DataBase(model);
const sheetsEditor = new SheetsEditor(model);

const bot = new Bot(sheetsEditor, model, dataLayer);
