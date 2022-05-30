import { contextBridge } from "electron";
import React, { Dispatch } from "react";

export const initialState: SpotifyContextInterface = {
    volume: 50,
    playerStarted: false,
    recentlyPlayed: [],
    currentTrack: {} as Track,
    playBackState: {} as MusicTrack,
    devices: [] as UserDevice[],
    playlist: null
};

export const SpotifyContext = React.createContext<{ context: SpotifyContextInterface, dispatch: Dispatch<SpotifyContextActionInterface> }>({ context: initialState, dispatch: () => null });

export const reducer = (context: SpotifyContextInterface = initialState, action: SpotifyContextActionInterface): SpotifyContextInterface => {
    switch (action.type) {
        case "VOLUME":
            return {
                ...context,
                volume: action.volume || context.volume,
            };
        case "PLAY":
            window.api.send("toMain_Spotify", {
                action: !context.playerStarted ? "play" : "pause", uri: action.uri
            });
            return {
                ...context,
                playerStarted: !context.playerStarted,
                playlist: action.playlist || context.playlist,
            };
        case "RECENT":
            return {
                ...context,
                recentlyPlayed: action.recentlyPlayed || context.recentlyPlayed,
            };
        case "CURRENT_TRACK":
            console.log(action.currentTrack);

            return {
                ...context,
                currentTrack: action.currentTrack || context.currentTrack,
            };
        case "DEVICES":
            return {
                ...context,
                devices: action.devices || context.devices,
            };
        case "PLAYBACK_STATE":
            console.log("switch", action);

            const currentTrack =
                action.playBackState && action.playBackState.item
                    ? {
                        album: action.playBackState.item.album.name || "",
                        artist:
                            Array.isArray(action.playBackState.item.artists) &&
                                action.playBackState.item.artists.length > 0
                                ? action.playBackState.item.artists[0].name
                                : "",
                        track: action.playBackState.item.name || "",
                        uri: action.playBackState.item.uri || "",
                    }
                    : {} as Track;
            return {
                ...context,
                playBackState: action.playBackState,
                currentTrack,
            };
        default:
            return context;
    }
};
export const increaseVolume = (dispatch: Dispatch<SpotifyContextActionInterface>, currentVolume: number) => {
    setVolume(dispatch, currentVolume + 10 > 100 ? 100 : currentVolume + 10);
};

export const decreaseVolume = (dispatch: Dispatch<SpotifyContextActionInterface>, currentVolume: number) => {
    setVolume(dispatch, currentVolume - 10 < 0 ? 0 : currentVolume - 10);
};

export const mute = (dispatch: Dispatch<SpotifyContextActionInterface>, _currentVolume: number) => {
    setVolume(dispatch, 0);
};

const setVolume = (dispatch: Dispatch<SpotifyContextActionInterface>, volume: number) => {
    console.log("setVolume", volume);
    dispatch({
        type: "VOLUME",
        volume,
    });
    window.api.send("toMain_SpotifyVolume", volume);
};

export const play = (dispatch: Dispatch<SpotifyContextActionInterface>, uri: string, playlist: string | null = null) => {
    console.log("play", uri);
    dispatch({ type: "PLAY", uri, playlist });
    // playlist && dispatch({ type: "ALBUM", playlist });
};

export const skipToNext = (_dispatch: Dispatch<SpotifyContextActionInterface>, _playerStarted: boolean) => {
    window.api.send("toMain_Spotify", "next");

};

export const skipToPrevious = (_dispatch: Dispatch<SpotifyContextActionInterface>, _playerStarted: boolean) => {
    window.api.send("toMain_Spotify", "previous");
};

export const setCurrentTrack = (dispatch: Dispatch<SpotifyContextActionInterface>, currentTrack: Track) => {
    console.log("setCurrentTrack", currentTrack);
    dispatch({ type: "CURRENT_TRACK", currentTrack });
};

export const setPlayBackState = (dispatch: Dispatch<SpotifyContextActionInterface>, playBackState: MusicTrack) => {
    console.log("setPlayBackState", playBackState);
    dispatch({ type: "PLAYBACK_STATE", playBackState });
};

export const setRecentlyPlayed = (dispatch: Dispatch<SpotifyContextActionInterface>, recentlyPlayed: Playlist[]) => {
    console.log("setRecentlyPlayed", recentlyPlayed);
    dispatch({ type: "RECENT", recentlyPlayed });
};


export const setDevices = (dispatch: Dispatch<SpotifyContextActionInterface>, devices: UserDevice[]) => {
    dispatch({ type: "DEVICES", devices });
}

export interface SpotifyContextInterface {
    volume: number;
    playerStarted: boolean;
    recentlyPlayed: Playlist[];
    currentTrack: Track;
    playBackState?: MusicTrack | null;
    devices: UserDevice[];
    playlist: string | null;
}

export type MusicTrack = {
    item: {
        name: string;
        uri: string;
        album: {
            name: string;
        };
        artists: [{
            name: string;
        }];
        duration_ms: number
    };
    device: { name: string; type: string; };
};

export type DataMap = {
    [key: string]: string;
};

export type Track = {
    album: string,
    artist: string,
    track: string,
    uri: string,
};

export type Playlist = {
    name: string;
    description: string;
    uri: string;
    image: string;
}

export type UserDevice = {
    id: string | null;
    is_active: boolean;
    is_restricted: boolean;
    name: string;
    type: string;
    volume_percent: number | null;
}
export interface SpotifyContextActionInterface {
    type: string;
    volume?: number;
    playerStarted?: boolean;
    recentlyPlayed?: Playlist[];
    currentTrack?: Track;
    playBackState?: MusicTrack;
    devices?: UserDevice[];
    uri?: string;
    playlist?: string | null;
}