import { BrowserWindow } from "electron";
import SpotifyWebApi from "spotify-web-api-node";
import { secrets } from "../creds";
import { log } from "../util/utils";

let spotifyApi: SpotifyWebApi;

const logger = log("SpotifyWebApi")

const rejectError = (reject: (reason?: any) => void, method: string) => (reason?: any) => {
  //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
  logger(method, reason.body);
  reject(reason.body);
};

const authorizationCode = async () => {
  logger("authorizationCode");

  const spotifyClientId = secrets("SPOTIFY_CLIENT_ID")
  if (!!spotifyClientId && spotifyClientId.trim() !== "") {
    const spotifyApi1 = new SpotifyWebApi({
      redirectUri: "http://localhost:1118/callback",
      clientId: spotifyClientId
    });

    const scopes = [
      "user-read-private",
      "user-read-email",
      "user-modify-playback-state",
      "user-read-playback-state",
      "user-read-currently-playing",
      "user-read-recently-played",
      "playlist-read-private",
    ];

    var authorizeURL = spotifyApi1.createAuthorizeURL(scopes, "spotify");

    const window = new BrowserWindow({
      title: "spotifyToken",
      alwaysOnTop: true,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
      },
      height: 400,
      width: 800,
    });
    window.loadURL(authorizeURL);
  }
};

const accessTokenFromAuthCode = async (code: string) => {
  logger("accessTokenFromAuthCode");
  const spotifyClientId = secrets("SPOTIFY_CLIENT_ID");
  const spotifyClientSecret = secrets("SPOTIFY_CLIENT_SECRET");
  spotifyApi = new SpotifyWebApi({
    redirectUri: "http://localhost:1118/callback",
    clientId: spotifyClientId || undefined,
    clientSecret: spotifyClientSecret || undefined,
  });
  return new Promise<string>((resolve, _reject) => {
    spotifyApi.authorizationCodeGrant(code).then(
      function (data) {
        logger("The token expires in " + data?.body?.expires_in);

        // Set the access token on the API object to use it in later calls
        spotifyApi.setAccessToken(data.body["access_token"]);
        spotifyApi.setRefreshToken(data.body["refresh_token"]);
        resolve("success");
      },
      rejectError(resolve, "authorizationCodeGrant")
    );
  });
};

const refreshToken = () => {
  logger("refreshToken");
  return new Promise<string>((resolve, _reject) => {
    spotifyApi.refreshAccessToken().then(
      function (data) {
        logger("The access token has been refreshed!");

        // Save the access token so that it's used in future calls
        spotifyApi.setAccessToken(data.body["access_token"]);
        resolve("success");
      },
      rejectError(resolve, "refreshAccessToken")
    );
  });
};

const currentPlayingTrack = () => {
  logger("currentPlayingTrack");
  return new Promise<Track>((resolve, _reject) => {
    spotifyApi.getMyCurrentPlayingTrack().then(
      function (data) {
        if (data?.body?.item) {
          const { name: track, album, artists } = data.body.item as SpotifyApi.TrackObjectFull
          logger("Now playing: " + track);
          resolve({
            track,
            album: album.name,
            uri: album.uri,
            artist: artists[0].name,
          });
        }
      },
      rejectError(resolve, "getMyCurrentPlayingTrack")
    );
  });
};

const recentTrack = () => {
  logger("recentTrack");
  return new Promise<Track>((resolve, _reject) => {
    spotifyApi.getMyRecentlyPlayedTracks().then(
      function (data) {
        if (data?.body?.items?.length > 0) {
          const { name, album, artists } = data.body.items[0].track
          logger("recentTrack - " + name);
          resolve({
            track: name,
            album: album.name,
            uri: album.uri,
            artist: artists[0]?.name,

          });
        }
      },
      rejectError(resolve, "getMyRecentlyPlayedTracks")
    );
  });
};

const getFeaturedPlaylists = () => {
  //  Retrieve featured playlists
  logger("getFeaturedPlaylists");
  return new Promise<Playlist[]>((resolve, _reject) => {
    spotifyApi
      .getUserPlaylists({
        limit: 12,
        offset: 0,
        country: "US",
        locale: "en_US",
      } as {})
      .then(
        function (data) {
          const playlists = data.body.items.map((item) => {
            return {
              name: item.name,
              description: item.description,
              uri: item.uri,
              image:
                Array.isArray(item.images) && item.images.length > 0
                  ? item.images[0].url
                  : null,
            } as Playlist;
          });
          resolve(playlists);
        },
        rejectError(resolve, "getUserPlaylists")
      );
  });
};

const getMyDevices = () => {
  logger("getMyDevices");
  return new Promise<SpotifyApi.UserDevice[]>((resolve, _reject) => {
    // Get a User's Available Devices
    spotifyApi.getMyDevices().then(
      function (data) {
        logger("getMyDevices", data?.body?.devices);

        resolve(data.body.devices);
      },
      rejectError(resolve, "getMyDevices")
    );
  });
};

const getMyCurrentPlaybackState = () => {
  logger("getMyCurrentPlaybackState");
  return new Promise<SpotifyApi.CurrentPlaybackResponse>((resolve, _reject) => {
    // Get Information About The User's Current Playback State
    spotifyApi.getMyCurrentPlaybackState().then(
      function (data) {
        // Output items
        if (data.body && data.body.is_playing) {
          logger("User is currently playing something!");
        } else {
          logger("User is not playing anything, or doing so in private.");
        }
        resolve(data.body);
      },
      rejectError(resolve, "getMyCurrentPlaybackState")
    );
  });
};

const connectToSpeaker = async (deviceId: string) => {
  logger("connectToSpeaker", deviceId);
  // Get a User's Available Devices
  const devices = await getMyDevices();
  const device =
    devices.find((d) => d.id === deviceId) ||
    devices.find((d) => d.type === "Speaker");

  return new Promise<SpotifyApi.UserDevice>((resolve, reject) => {
    if (device?.id) {
      if (device?.is_active) resolve(device);

      spotifyApi.transferMyPlayback([device.id]).then(
        async function () {
          logger("Transfering playback to " + device.id);
          await getMyCurrentPlaybackState();//TODO
          resolve(device);
        },
        rejectError(resolve, "transferMyPlayback")
      );
    } else {
      reject("No device are connected to spotify account")
    }
  });
};

const getMyRecentlyPlayedTracks = () => {
  logger("getMyRecentlyPlayedTracks");
  return new Promise<Track[]>((resolve, _reject) => {
    spotifyApi
      .getMyRecentlyPlayedTracks({
        limit: 20,
      })
      .then(
        function (data) {
          // Output items
          logger(
            "Your 20 most recently played tracks are:",
            data.body.items.length
          );
          const tracks: Track[] = data.body.items
            .map((track) => {
              return {
                track: track.track.name,
                album: track.track.album.name,
                artist: track.track.album.artists[0].name,
                image: Array.isArray(track.track.album.images) && track.track.album.images.length > 0
                  ? track.track.album.images[0].url
                  : null,
                uri: track.track.uri
              } as Track;
            })
          resolve(
            Object.values(tracks.reduce((a, v: Track) => {
              a[v.track] = v;
              return a;
            }, {} as { [name: string]: Track })
            )
          );
        },
        rejectError(resolve, "getMyCurrentPlaybackState")
      );
  });
};
const setVolume = async (volume: number) => {
  const deviceId = secrets("DEVICE_ID");
  logger("setVolume (" + volume + ") ", deviceId);
  return new Promise<number>((resolve, _reject) => {
    spotifyApi
      .setVolume(volume, {
        device_id: deviceId
      })
      .then(
        function () {
          // console.log("Volume", volume);
          resolve(volume)
        },
        rejectError(resolve, "setVolume")
      );
  })
};

const play = async (uri: string) => {
  const deviceId = secrets("DEVICE_ID");
  logger("play on " + deviceId, uri);
  if (!uri) {
    uri = (await getMyRecentlyPlayedTracks()).find((_value, index) => index == 0)?.uri || ""
  }
  deviceId && connectToSpeaker(deviceId);

  return new Promise<SpotifyApi.CurrentPlaybackResponse>((resolve, _reject) => {
    spotifyApi.play({ context_uri: uri }).then(
      async function () {
        const playbackState1 = await getMyCurrentPlaybackState();
        logger("Playback started");
        resolve(playbackState1);
      },
      rejectError(resolve, "play")
    );
  });
};
const pause = () => {
  const deviceId = secrets("DEVICE_ID");
  logger("pause ", deviceId);
  return new Promise<string>(async (resolve, reject) => {

    if (!deviceId) {
      reject("Device is not selected")
    } else {
      spotifyApi.pause({ device_id: deviceId }).then(
        function () {
          // console.log("Playback pause");
          resolve(deviceId);
        },
        rejectError(resolve, "pause")
      );
    }
  });
};
const next = () => {
  const deviceId = secrets("DEVICE_ID");
  logger("next ", deviceId);
  return new Promise<SpotifyApi.CurrentPlaybackResponse>(async (resolve, reject) => {
    if (!deviceId) {
      reject("Device is not selected")
    } else {
      spotifyApi.skipToNext({ device_id: deviceId }).then(
        async function () {
          // console.log("Skip to next");
          const playbackState1 = await getMyCurrentPlaybackState();
          logger("Playback started");
          resolve(playbackState1);
        },
        rejectError(resolve, "skipToNext")
      )
    };
  });
};

const updateDevices = async (mainWindow: BrowserWindow | null) => {
  const devices = await getMyDevices();
  mainWindow?.webContents.send("fromMain_Settings", devices);
  return devices.find((_d, i) => i === 0);
}


const previous = () => {
  const deviceId = secrets("DEVICE_ID");
  logger("previous ", deviceId);
  return new Promise<SpotifyApi.CurrentPlaybackResponse>(async (resolve, reject) => {
    if (!deviceId) {
      reject("Device is not selected")
    } else {
      spotifyApi.skipToPrevious({ device_id: deviceId }).then(
        async () => {
          // logger("Skip to next ");
          const playbackState1 = await getMyCurrentPlaybackState();
          logger("Playback started");
          resolve(playbackState1);
        },
        rejectError(resolve, "skipToPrevious")
      )
    };
  });
};

export {
  authorizationCode,
  accessTokenFromAuthCode,
  refreshToken,
  play,
  pause,
  next,
  previous,
  setVolume,
  currentPlayingTrack,
  getMyRecentlyPlayedTracks,
  getMyCurrentPlaybackState,
  getFeaturedPlaylists,
  getMyDevices,
  updateDevices,
  recentTrack
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
  image: string | null;
}