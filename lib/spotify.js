const { BrowserWindow } = require("electron");
var SpotifyWebApi = require("spotify-web-api-node");
var http = require("https");

const options = (spotifyResCode) => {
  return {
    method: "POST",
    hostname: "accounts.spotify.com",
    port: null,
    path:
      "/api/token?grant_type=authorization_code&code=" +
      encodeURIComponent(spotifyResCode) +
      "&redirect_uri=" +
      encodeURIComponent("http://localhost:1118/callback"),
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
      Authorization: process.env.AUTHORIZATION,
    },
  };
};

const authorizationCodeRequestURL = () => {
  const scopes =
    "user-read-private user-read-email user-modify-playback-state user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played";
  const hostname = "accounts.spotify.com";
  const path =
    "/authorize?response_type=code&client_id=" +
    process.env.SPOTIFY_CLIENT_ID +
    (scopes ? "&scope=" + encodeURIComponent(scopes) : "") +
    "&redirect_uri=" +
    encodeURIComponent("http://localhost:1118/callback");

  const authCodeUrl = "https://" + hostname + path;
  console.log("authorizationCodeRequestURL for ", scopes);
  return { authCodeUrl, hostname, path };
};

const getSpotifyToken = () => {
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
  window.loadURL(authorizationCodeRequestURL().authCodeUrl);
};

const currentPlayingTrack = (token) => {
  const spotifyApi = new SpotifyWebApi({});
  spotifyApi.setAccessToken(token);

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

const getMyRecentlyPlayedTracks = (token) => {
  const spotifyApi = new SpotifyWebApi({});
  spotifyApi.setAccessToken(token);

  return new Promise((resolve, reject) => {
    spotifyApi
      .getMyRecentlyPlayedTracks({
        limit: 20,
      })
      .then(
        function (data) {
          // Output items
          console.log("Your 20 most recently played tracks are:");
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
const setVolume = (token, volume) => {
  const spotifyApi = new SpotifyWebApi({});
  spotifyApi.setAccessToken(token);

  console.log(token);

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

const play = (token) => {
  const spotifyApi = new SpotifyWebApi({});
  spotifyApi.setAccessToken(token);
  // spotifyApi.setAccessToken("BQBX4xP2bnBkDYVNefAZPdeoK-neritS02NiphajfjAxxqYcKaNPYEyJKvcXdt8-KNfW88fdLgW7BqS6av1wmzpaIjZ6st2lctWGdjMJMwbTT8xOtMBml1z8BCo_27zZP3A5g2hCWlsp8ycDRxw344stl5YZspnJ9tXqOc_cuvcNIyut3D6UTlAQXsoqqi5vx0D8ExjKLqnGSaM");

  console.log(token);

  spotifyApi.play({ device_id: process.env.DEVICE_ID }).then(
    function () {
      console.log("Playback started");
    },
    function (err) {
      //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
      console.log("Something went wrong!", err);
    }
  );
};
const pause = (token) => {
  console.log("pause", token);
  const spotifyApi = new SpotifyWebApi({});
  spotifyApi.setAccessToken(token);

  console.log(token);

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
const next = (token) => {
  const spotifyApi = new SpotifyWebApi({});
  spotifyApi.setAccessToken(token);

  console.log(token);

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

const getFeaturedPlaylists = (token) => {
  const spotifyApi = new SpotifyWebApi({});
  spotifyApi.setAccessToken(token);

  return new Promise((resolve, reject) => {
    spotifyApi
      .getFeaturedPlaylists({
        limit: 10,
        offset: 1,
        country: "US",
        locale: "en_US",
      })
      .then(
        function (data) {
          const playlists = data.body.playlists.items.map((i) => {
            return {
              description: i.name,
              url: i.external_urls.spotify,
              id: i.id,
              image: i.images[0] && i.images[0].url,
            };
          });
          console.log(playlists);
          resolve(playlists);
        },
        function (err) {
          console.log("Something went wrong!", err);
          reject(err);
        }
      );
  });
};

function getSpotifyTokenFromAuthCode(spotifyResCode) {
  console.log("getSpotifyToken");
  return new Promise(function (resolve, reject) {
    var req = http.request(options(spotifyResCode), function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      });

      res.on("error", function (err) {
        console.log(err);
        reject(err);
      });
    });

    req.end();
  });
}

module.exports = {
  getSpotifyToken,
  getFeaturedPlaylists,
  getSpotifyTokenFromAuthCode,
  play,
  pause,
  next,
  setVolume,
  currentPlayingTrack,
  getMyRecentlyPlayedTracks,
};
