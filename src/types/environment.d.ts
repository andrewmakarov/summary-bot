declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOT_TOKEN: string;
            PRIVATE_KEY: string;
            CLIENT_EMAIL: string;
            URL: string;
            PORT: string;
            DB_USER: string;
            DB_PASSWORD: string;
            LOG_TOKEN: string;
        }
    }
}

export {};
