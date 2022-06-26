/* eslint-disable @typescript-eslint/no-unused-vars */
import dotenv from 'dotenv';
import Bot from './bot';
import Model from './model';
import SheetsEditor from './sheetsEditor';

dotenv.config();

const model = new Model();
const sheetsEditor = new SheetsEditor(model);
const bot = new Bot(sheetsEditor, model);

// const func = async () => {
//   const auth = new Auth.GoogleAuth({
//     keyFilename: './credentials.json',
//     scopes: 'https://www.googleapis.com/auth/spreadsheets',
//   });

//   const client = await auth.getClient();
//   const googleSheets = new sheets_v4.Sheets({ auth: client });

//   const metaData = await googleSheets.spreadsheets.values.get({
//     auth,
//     spreadsheetId: process.env.SPREADSHEET_ID,
//     range: 'Июнь!A:A',
//   });
// };

// dotenv.config();
// const bot = new Telegraf(process.env.BOT_TOKEN!);

// bot.start((ctx) => {
//   console.log(ctx.message.from.username);
//   ctx.reply('Welcome');
//   func();
// });

// bot.on('text', (ctx) => {
//   const { text } = ctx.message;
//   const value = parseFloat(text);

//   if (Number.isNaN(value)) {
//     ctx.reply('Неправильная сумма');
//   } else {
//     const description = text.substring(value.toString().length).trim();

//     ctx.reply('Выбери категорию', {
//       reply_markup: {
//         keyboard: [
//           [{ text: 'start' }],
//           [{ text: 'end' }],
//           [{ text: 'start' }],
//           [{ text: 'end' }],
//           [{ text: 'start' }],
//           [{ text: 'end' }],
//           [{ text: 'start' }],
//           [{ text: 'end' }],
//           [{ text: 'start' }],
//           [{ text: 'end' }],
//           [{ text: 'start' }],
//           [{ text: 'end' }],
//           [{ text: 'start' }],
//           [{ text: 'end' }],
//         ],
//         one_time_keyboard: true,
//       },
//     });
//   }
// });

// bot.launch();
