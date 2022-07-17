declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOT_TOKEN: string;
            ARMENIA_SPREADSHEET_ID: string;
            MAIN_SPREADSHEET_ID: string;
            PRIVATE_KEY: string;
            CLIENT_EMAIL: string;
            URL: string;
            PORT: string;
            DB_USER: string;
            DB_PASSWORD: string;
        }
    }
}

export {};
