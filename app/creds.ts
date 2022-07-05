import Store from 'electron-store';

export interface AppCredentials {
    SPOTIFY_CLIENT_ID: string;
    SPOTIFY_CLIENT_SECRET: string;
    AUTHORIZATION: string;
    OPENWEATHER_TOKEN: string;
    DEVICE_ID: string;
    IP_LOCATION_API_KEY: string;
}
export function setupSecrets(message: AppCredentials, store: Store) {
    try {
        if (message.SPOTIFY_CLIENT_ID && message.SPOTIFY_CLIENT_SECRET)
            message.AUTHORIZATION = "Bearer " + Buffer.from(message.SPOTIFY_CLIENT_ID + ":" + message.SPOTIFY_CLIENT_SECRET).toString('base64');

        Object.keys(message).filter(k => !!{ ...message }[k]).forEach(k => store.set(k, { ...message }[k] as string))
        console.log("Creds are saved at ", store.path)
    } catch (e) {
        console.log("setupSecrets", e);
    }
}

export const secrets = (account: string) => new Store().get(account) as string