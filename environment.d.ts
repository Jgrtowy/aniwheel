export declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NEXTAUTH_URL: string;
            NEXTAUTH_SECRET: string;
            ANILIST_CLIENT_ID: string;
            ANILIST_CLIENT_SECRET: string;
            MAL_CLIENT_ID: string;
            MAL_CLIENT_SECRET: string;
        }
    }
}
