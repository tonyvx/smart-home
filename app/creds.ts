import keytar from "keytar";

export interface AppCredentials {
    SPOTIFY_CLIENT_ID: string;
    SPOTIFY_CLIENT_SECRET: string;
    AUTHORIZATION: string;
}
export async function setupSecrets(message: AppCredentials) {
    try {
        if (message.SPOTIFY_CLIENT_ID && message.SPOTIFY_CLIENT_SECRET)
            message.AUTHORIZATION = "Bearer " + Buffer.from(message.SPOTIFY_CLIENT_ID + ":" + message.SPOTIFY_CLIENT_SECRET).toString('base64');
    } catch (e) {
        console.log("setupSecrets", e);
    }
}

export const secrets = (account: string) => keytar.getPassword("smart-home", account);
