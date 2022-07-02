declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOT_TOKEN: string;
            SPREADSHEET_ID: string;
            PRIVATE_KEY: string;
            CLIENT_EMAIL: string;
            URL: string;
            PORT: string;
        }
    }
}

export {};
