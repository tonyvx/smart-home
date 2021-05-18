const { BrowserWindow } = require("electron");
var SpotifyWebApi = require("spotify-web-api-node");

let spotifyApi = null;

const authorizationCode = () => {
  console.log("authorizationCode");
  const spotifyApi1 = new SpotifyWebApi({
    redirectUri: "http://localhost:1118/callback",
    clientId: process.env.SPOTIFY_CLIENT_ID,
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

const accessTokenFromAuthCode = (code) => {
  console.log("accessTokenFromAuthCode");
  spotifyApi = new SpotifyWebApi({
    redirectUri: "http://localhost:1118/callback",
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
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
        limit: 10,
        offset: 1,
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
              image: item.images[0].url,
            };
          });
          // console.log(playlists);
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
  // Get Information About The User's Current Playback State

  return new Promise((resolve, reject) => {
    if (device && device.is_active) resolve(device);
    spotifyApi.transferMyPlayback([device.id]).then(
      async function () {
        console.log("Transfering playback to " + device.id);
        const playbackState = await getMyCurrentPlaybackState();
        // console.log("playbackState", playbackState);
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
const setVolume = (volume) => {
  console.log("setVolume", volume);
  spotifyApi
    .setVolume(volume, {
      device_id: process.env.DEVICE_ID,
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

const play = (uri) => {
  console.log("play", uri);

  connectToSpeaker(process.env.DEVICE_ID);

  spotifyApi.play({ device_id: process.env.DEVICE_ID, context_uri: uri }).then(
    function () {
      console.log("Playback started");
    },
    function (err) {
      //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
      console.log("Something went wrong!", err);
    }
  );
};
const pause = () => {
  console.log("pause");

  spotifyApi.pause({ device_id: process.env.DEVICE_ID }).then(
    function () {
      console.log("Playback pause");
    },
    function (err) {
      //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
      console.log("Something went wrong!", err);
    }
  );
};
const next = () => {
  console.log("next");

  spotifyApi.skipToNext({ device_id: process.env.DEVICE_ID }).then(
    function () {
      console.log("Skip to next ");
    },
    function (err) {
      //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
      console.log("Something went wrong!", err);
    }
  );
};

module.exports = {
  authorizationCode,
  accessTokenFromAuthCode,
  refreshToken,
  play,
  pause,
  next,
  setVolume,
  currentPlayingTrack,
  getMyRecentlyPlayedTracks,
  getMyCurrentPlaybackState,
  getFeaturedPlaylists,
};
