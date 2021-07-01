const { BrowserWindow } = require("electron");
var SpotifyWebApi = require("spotify-web-api-node");
const { secrets } = require("../app/creds");

let spotifyApi = null;

const authorizationCode = async () => {
  console.log("authorizationCode");

  const spotifyClientId = await secrets("SPOTIFY_CLIENT_ID")
  const spotifyApi1 = new SpotifyWebApi({
    redirectUri: "http://localhost:1118/callback",
    clientId: spotifyClientId,
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
};

const accessTokenFromAuthCode = async (code) => {
  console.log("accessTokenFromAuthCode");
  const spotifyClientId = await secrets("SPOTIFY_CLIENT_ID");
  const spotifyClientSecret = await secrets("SPOTIFY_CLIENT_SECRET");
  spotifyApi = new SpotifyWebApi({
    redirectUri: "http://localhost:1118/callback",
    clientId: spotifyClientId,
    clientSecret: spotifyClientSecret,
  });
  return new Promise((resolve, reject) => {
    spotifyApi.authorizationCodeGrant(code).then(
      function (data) {
        console.log("The token expires in " + data.body["expires_in"]);

        // Set the access token on the API object to use it in later calls
        spotifyApi.setAccessToken(data.body["access_token"]);
        spotifyApi.setRefreshToken(data.body["refresh_token"]);
        resolve();
      },
      function (err) {
        console.log("Something went wrong!", err);
        reject(err);
      }
    );
  });
};

const refreshToken = () => {
  console.log("refreshToken");
  return new Promise((resolve, reject) => {
    spotifyApi.refreshAccessToken().then(
      function (data) {
        console.log("The access token has been refreshed!");

        // Save the access token so that it's used in future calls
        spotifyApi.setAccessToken(data.body["access_token"]);
        resolve();
      },
      function (err) {
        console.log("Could not refresh access token", err);
        reject(err);
      }
    );
  });
};

const currentPlayingTrack = () => {
  console.log("currentPlayingTrack");
  return new Promise((resolve, reject) => {
    spotifyApi.getMyCurrentPlayingTrack().then(
      function (data) {
        if (data && data.body && data.body.item) {
          console.log("Now playing: " + data.body.item.name);
          resolve({
            track: data.body.item.name,
            album: data.body.item.album.name,
            artist: data.body.item.artists[0].name,
          });
        }
      },
      function (err) {
        console.log("Something went wrong!", err);
        reject(err);
      }
    );
  });
};

const getFeaturedPlaylists = () => {
  //  Retrieve featured playlists
  console.log("getFeaturedPlaylists");
  return new Promise((resolve, reject) => {
    spotifyApi
      .getUserPlaylists({
        limit: 12,
        offset: 0,
        country: "US",
        locale: "en_US",
      })
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
            };
          });
          resolve(playlists);
        },
        function (err) {
          console.log("getFeaturedPlaylists: Something went wrong!", err);
          reject(err);
        }
      );
  });
};

const getMyDevices = () => {
  console.log("getMyDevices");
  return new Promise((resolve, reject) => {
    // Get a User's Available Devices
    spotifyApi.getMyDevices().then(
      function (data) {
        let availableDevices = data.body.devices;
        resolve(availableDevices);
      },
      function (err) {
        console.log("getMyDevices: Something went wrong!", err);
        reject(err);
      }
    );
  });
};

const getMyCurrentPlaybackState = () => {
  console.log("getMyCurrentPlaybackState");
  return new Promise((resolve, reject) => {
    // Get Information About The User's Current Playback State
    spotifyApi.getMyCurrentPlaybackState().then(
      function (data) {
        // Output items
        if (data.body && data.body.is_playing) {
          console.log("User is currently playing something!");
        } else {
          console.log("User is not playing anything, or doing so in private.");
        }
        resolve(data.body);
      },
      function (err) {
        console.log("getMyCurrentPlaybackState: Something went wrong!", err);
        reject(err);
      }
    );
  });
};

const connectToSpeaker = async (deviceId) => {
  console.log("connectToSpeaker", deviceId);
  // Get a User's Available Devices
  const devices = await getMyDevices();
  console.log("devices", devices);
  const device =
    devices.find((d) => d.id === deviceId) ||
    devices.find((d) => d.type !== "Speaker");

  return new Promise((resolve, reject) => {
    if (device && device.is_active) resolve(device);
    spotifyApi.transferMyPlayback([device.id]).then(
      async function () {
        console.log("Transfering playback to " + device.id);
        await getMyCurrentPlaybackState();
        resolve(device);
      },
      function (err) {
        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
        console.log("transferMyPlayback: Something went wrong!", err);
        reject(err);
      }
    );
  });
};

const getMyRecentlyPlayedTracks = () => {
  console.log("getMyRecentlyPlayedTracks");
  return new Promise((resolve, reject) => {
    spotifyApi
      .getMyRecentlyPlayedTracks({
        limit: 20,
      })
      .then(
        function (data) {
          // Output items
          console.log(
            "Your 20 most recently played tracks are:",
            data.body.items.length
          );
          resolve(
            Object.values(
              data.body.items
                .map((track) => {
                  return {
                    name: track.track.name,
                    album: track.track.album.name,
                    artist: track.track.album.artists[0].name,
                    image: track.track.album.images[0],
                  };
                })
                .reduce((a, v) => {
                  a[v.name] = v;
                  return a;
                }, {})
            ).slice(0, 4)
          );
        },
        function (err) {
          console.log("Something went wrong!", err);
          reject(err);
        }
      );
  });
};
const setVolume = async (volume) => {
  console.log("setVolume", volume);
  const deviceId = await secrets("DEVICE_ID");
  spotifyApi
    .setVolume(volume, {
      device_id: deviceId,
    })
    .then(
      function () {
        console.log("Volume", volume);
      },
      function (err) {
        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
        console.log("Something went wrong!", err);
      }
    );
};

const play = async (uri) => {
  console.log("play", uri);

  const deviceId = await secrets("DEVICE_ID");
  uri && (await pause());
  connectToSpeaker(deviceId);

  const input = uri
    ? { device_id: deviceId, context_uri: uri }
    : { device_id: deviceId };
  return new Promise((resolve, reject) => {
    spotifyApi.play(input).then(
      async function () {
        const playbackState1 = await getMyCurrentPlaybackState();
        console.log("Playback started");
        resolve(playbackState1);
      },
      function (err) {
        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
        console.log("Something went wrong!", err);
        reject(err);
      }
    );
  });
};
const pause = () => {
  console.log("pause");
  return new Promise(async (resolve, reject) => {
    const deviceId = await secrets("DEVICE_ID");
    spotifyApi.pause({ device_id: deviceId }).then(
      function () {
        console.log("Playback pause");
        resolve();
      },
      function (err) {
        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
        console.log("Something went wrong!", err);
        reject(err);
      }
    );
  });
};
const next = () => {
  console.log("next");
  return new Promise(async (resolve, reject) => {
    const deviceId = await secrets("DEVICE_ID");
    spotifyApi.skipToNext({ device_id: deviceId }).then(
      async function () {
        console.log("Skip to next ");
        const playbackState1 = await getMyCurrentPlaybackState();
        console.log("Playback started");
        resolve(playbackState1);
      },
      function (err) {
        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
        console.log("Something went wrong!", err);
        reject(err);
      }
    );
  });
};

const updateDevices = async (mainWindow) => {
  const devices = await getMyDevices();
  mainWindow.webContents.send("fromMain_Settings", devices);
  return devices.find((d, i) => i === 0);
}


const previous = () => {
  console.log("next");
  return new Promise(async (resolve, reject) => {
    const deviceId = await secrets("DEVICE_ID");
    spotifyApi.skipToPrevious({ device_id: deviceId }).then(
      async function () {
        console.log("Skip to next ");
        const playbackState1 = await getMyCurrentPlaybackState();
        console.log("Playback started");
        resolve(playbackState1);
      },
      function (err) {
        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
        console.log("Something went wrong!", err);
        reject(err);
      }
    );
  });
};

module.exports = {
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
  updateDevices
};
