import { Container, Divider, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import { List } from "react-virtualized";
import "react-virtualized/styles.css";
import { getFormattedTime } from "../../lib/getFormattedTime";
import {
  AppContext,
  initialState,
  reducer,
  setCurrentTrack,
  setFooterInfo,
  setForecast,
  setLocation,
  setNews,
  setRecentlyPlayed,
} from "./AppContext";
import { CurrentWeather } from "./components/CurrentWeather";
import { SpotifyPlayer } from "./components/SpotifyPlayer";
import { SpotifyRecentlyPlayed } from "./components/SpotifyRecentlyPlayed";

export const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100vh",
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  list: {
    "&::-webkit-scrollbar": { width: 0, height: 0 },
    outline: "none",
  },
  avatar: {
    width: theme.spacing(8),
    height: theme.spacing(8),
  },
}));

export default function App() {
  const [context, dispatch] = React.useReducer(reducer, initialState);
  return (
    <AppContext.Provider
      value={{
        context,
        dispatch,
      }}
    >
      <SmartHomeReactApp />
    </AppContext.Provider>
  );
}

export function SmartHomeReactApp() {
  const classes = useStyles();
  const [currentTime, setCurrentTime] = useState("00:00:00");

  const { context, dispatch } = React.useContext(AppContext);

  const { footerInfo, location, news, forecast, currentTrack } = context;

  useEffect(() => {
    window.api.receive("fromMain_FinishLoad", (resp) => {
      setFooterInfo(dispatch, resp.footerInfo);
      setLocation(dispatch, resp.location);
      setForecast(dispatch, resp.forecast);
      setNews(dispatch, resp.news);
    });
  }, []);

  useEffect(() => {
    window.api.receive("fromMain_Spotify", (resp) => {
      setRecentlyPlayed(dispatch, resp);
    });
  }, []);

  useEffect(() => {
    var timerID = setInterval(() => setCurrentTime(getFormattedTime()), 1000);
    return function cleanup() {
      clearInterval(timerID);
    };
  }, []);

  useEffect(() => {
    window.api.receive("fromMain_Interval", (resp) => {
      setForecast(dispatch, resp);
    });
  }, []);
  useEffect(() => {
    window.api.receive("fromMain_SpotifyTrack", (resp) => {
      setCurrentTrack(dispatch, resp);
    });
  }, []);

  return (
    <Container className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <CurrentWeather forecast={forecast} news={news} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h3" align="center" padding="10">
            {currentTime}
          </Typography>
          <Typography variant="subtitle1" align="center">
            {currentTrack.track} - {currentTrack.artist}
          </Typography>
          <SpotifyPlayer />
        </Grid>
        <Grid item xs={12}>
          <Typography align="center">News</Typography>
        </Grid>
        <Grid item xs={12}>
          {Array.isArray(news) && news.length > 0 && (
            <List
              className={classes.list}
              width={900}
              height={100}
              headerHeight={20}
              rowHeight={30}
              rowCount={news.length}
              rowRenderer={({ index, isScrolling, key, style }) => {
                return (
                  <Container key={key}>
                    <Typography variant="subtitle1">
                      {news[index].title}
                    </Typography>
                    <Divider />
                  </Container>
                );
              }}
              overscanRowCount={10}
            ></List>
          )}
        </Grid>
        <Grid item xs={12}>
          <SpotifyRecentlyPlayed />
        </Grid>
      </Grid>
      <Container className={classes.paper}>
        {Object.keys(footerInfo).reduce(
          (a, v) => a + v + ": " + footerInfo[v] + " ",
          location.address + " "
        )}
      </Container>
    </Container>
  );
}
