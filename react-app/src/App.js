import { Container, Divider, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect } from "react";
import { List } from "react-virtualized";
import "react-virtualized/styles.css";
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
  setPlayBackState,
} from "./AppContext";
import { Clock } from "./components/Clock";
import { CurrentWeather } from "./components/CurrentWeather";
import { SpotifyPlayer } from "./components/SpotifyPlayer";
import { SpotifyRecentlyPlayed } from "./components/SpotifyRecentlyPlayed";

export const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100vh",
    maxWidth: 1700,
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
  listHorizontalDisplay: {
    display: "inline-flex",
    width: 1400,
    overflowY: "auto",
    height: 300,
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

  const { context, dispatch } = React.useContext(AppContext);

  const { footerInfo, location, news, forecast, currentTrack, playBackState } =
    context;

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
    window.api.receive("fromMain_Interval", (resp) => {
      setForecast(dispatch, resp);
    });
  }, []);
  useEffect(() => {
    window.api.receive("fromMain_SpotifyTrack", (resp) => {
      setCurrentTrack(dispatch, resp);
    });
  }, []);

  useEffect(() => {
    window.api.receive("fromMain_playback", (resp) => {
      setPlayBackState(dispatch, resp);
    });
  }, []);

  useEffect(() => {
    window.api.receive("fromMain_Interval_News", (resp) => {
      setNews(dispatch, resp);
    });
  }, []);
  
  return (
    <Container className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <CurrentWeather forecast={forecast} news={news} />
        </Grid>
        <Grid item xs={6}>
          <Clock />
          <SpotifyPlayer />
        </Grid>
        <Grid item xs={12}>
          <Typography align="center" variant="h4">
            News
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {Array.isArray(news) && news.length > 0 && (
            <List
              className={classes.list}
              width={1600}
              height={300}
              headerHeight={20}
              rowHeight={30}
              rowCount={news.length}
              rowRenderer={({ index, isScrolling, key, style }) => {
                return (
                  <Container key={key}>
                    <Typography variant="h5" style={{ margin: 4 }}>
                      {news[index].title}
                    </Typography>
                    <Divider />
                  </Container>
                );
              }}
              overscanRowCount={1}
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
