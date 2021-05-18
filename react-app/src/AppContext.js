import React from "react";

export const AppContext = React.createContext();

export const initialState = {
  volume: 50,
  playerStarted: false,
  recentlyPlayed: [],
  currentTrack: {},
  forecast: null,
  news: [],
  location: {},
  footerInfo: {},
  playBackState: {},
};

export const reducer = (context, action) => {
  switch (action.type) {
    case "VOLUME":
      return {
        ...context,
        volume: action.volume,
      };
    case "PLAY":
      return {
        ...context,
        playerStarted: action.playerStarted,
      };
    case "RECENT":
      return {
        ...context,
        recentlyPlayed: action.recentlyPlayed,
      };
    case "CURRENT_TRACK":
      return {
        ...context,
        currentTrack: action.currentTrack,
      };
    case "FORECAST":
      return {
        ...context,
        forecast: action.forecast,
      };

    case "NEWS":
      return {
        ...context,
        news: action.news,
      };

    case "FOOTER_INFO":
      return {
        ...context,
        footerInfo: action.footerInfo,
      };
    case "LOCATION":
      return {
        ...context,
        location: action.location,
      };
    case "PLAYBACK_STATE":
      return { ...context, playBackState: action.playBackState };
    default:
      return context;
  }
};
export const increaseVolume = (dispatch, currentVolume) => {
  setVolume(dispatch, currentVolume + 10 > 100 ? 100 : currentVolume + 10);
};

export const decreaseVolume = (dispatch, currentVolume) => {
  setVolume(dispatch, currentVolume - 10 < 0 ? 0 : currentVolume - 10);
};

export const mute = (dispatch, currentVolume) => {
  setVolume(dispatch, 0);
};

const setVolume = (dispatch, volume) => {
  console.log("setVolume", volume);
  dispatch({
    type: "VOLUME",
    volume,
  });
  window.api.send("toMain_SpotifyVolume", volume);
};

export const setForecast = (dispatch, forecast) => {
  console.log("setForecast", forecast);
  dispatch({ type: "FORECAST", forecast });
};

// export const play = (dispatch, playerStarted) => {
//   console.log("play", playerStarted);
//   window.api.send("toMain_Spotify", !playerStarted ? "play" : "pause");
//   dispatch({ type: "PLAY", playerStarted: !playerStarted });
// };

export const play = (dispatch, playerStarted, uri) => {
  console.log("play", playerStarted, uri);
  window.api.send("toMain_Spotify", {
    action: !playerStarted ? "play" : "pause",
    uri,
  });
  dispatch({ type: "PLAY", playerStarted: !playerStarted });
};

export const skipToNext = (dispatch, playerStarted) => {
  window.api.send("toMain_Spotify", "next");
};

export const setNews = (dispatch, news) => {
  console.log("setNews", news);
  dispatch({ type: "NEWS", news });
};

export const setFooterInfo = (dispatch, footerInfo) => {
  console.log("setFooterInfo", footerInfo);
  dispatch({ type: "FOOTER_INFO", footerInfo });
};

export const setLocation = (dispatch, location) => {
  console.log("setLocation", location);
  dispatch({ type: "LOCATION", location });
};

export const setCurrentTrack = (dispatch, currentTrack) => {
  console.log("setCurrentTrack", currentTrack);
  dispatch({ type: "CURRENT_TRACK", currentTrack });
};

export const setPlayBackState = (dispatch, playBackState) => {
  console.log("setPlayBackState", playBackState);
  dispatch({ type: "PLAYBACK_STATE", playBackState });
};

export const setRecentlyPlayed = (dispatch, recentlyPlayed) => {
  console.log("setRecentlyPlayed", recentlyPlayed);
  dispatch({ type: "RECENT", recentlyPlayed });
};
