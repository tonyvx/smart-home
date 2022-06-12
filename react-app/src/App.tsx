import { Container, Divider, Grid, List, ListItem, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SettingsIcon from '@material-ui/icons/Settings';
import React, { useEffect, useState } from "react";
import { Clock } from "./components/Clock";
import { CurrentWeatherUI } from "./components/CurrentWeatherUI";
import { Settings } from "./components/Settings";
import { SpotifyPlayer } from "./components/SpotifyPlayer";
import { SpotifyRecentlyPlayed } from "./components/SpotifyRecentlyPlayed";
import {
  AppContext, AppContextActionInterface, CurrentWeather, initialState as initialAppState, NewsArticle, reducer as appReducer,
  setFooterInfo,
  setForecast,
  setLocation,
  setNews, showSettingsPage
} from "./contexts/AppContext";
import { initialState as spotifyInitialState, MusicTrack, Playlist, reducer as spotifyReducer, setCurrentTrack, setDevices, setPlayBackState, setRecentlyPlayed, SpotifyContext, Track, UserDevice } from "./contexts/SpotifyContext";

export const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    maxWidth: "100vw",
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
    position: "absolute",
    bottom: 0,
    width: "100%",
    margin: theme.spacing(2),
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
    overflowY: "auto",
    height: 300,
  },

  listDisplay: {
    overflowY: "auto",
    height: 300,
    '&::-webkit-scrollbar': {
      width: 10
    },
    /* Track */
    '&::-webkit-scrollbar-track': {
      background: '#000'
    },

    '&::-webkit-scrollbar-thumb': {
      background: '#000'
    },
    /* Handle on hover */
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#000'
    },
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
}));

export default function App() {
  const [context, dispatch] = React.useReducer(appReducer, initialAppState);
  return (
    <AppContext.Provider
      value={{
        context,
        dispatch,
      }}
    ><SpotifyWrappedApp />
    </AppContext.Provider>
  );
}

export function SpotifyWrappedApp() {
  const [context, dispatch] = React.useReducer(spotifyReducer, spotifyInitialState);
  return (
    <SpotifyContext.Provider
      value={{
        context,
        dispatch
      }}
    >
      <SmartHomeReactApp />
    </SpotifyContext.Provider>);
}

export function SmartHomeReactApp() {
  const classes = useStyles();

  const [background, setBackground] = useState("");

  const { context, dispatch } = React.useContext(AppContext);
  const { context: sContext, dispatch: sDispatch } = React.useContext(SpotifyContext);

  const { footerInfo, location, news, showSettings } =
    context;

  useEffect(() => {
    window.api.receive("fromMain_FinishLoad", (resp: AppContextActionInterface) => {
      console.log("fromMain_FinishLoad", resp);

      setFooterInfo(dispatch, resp?.footerInfo || {});
      setLocation(dispatch, resp?.location || {});
      if (resp?.forecast) setForecast(dispatch, resp.forecast);
      setNews(dispatch, resp.news || []);
    });
  }, []);

  useEffect(() => {
    window.api.receive("fromMain_Spotify", (recentlyPlayed: Playlist[]) => {
      setRecentlyPlayed(sDispatch, recentlyPlayed);
    });
  }, []);

  useEffect(() => {
    window.api.receive("fromMain_Settings", (devices: UserDevice[]) => {
      setDevices(sDispatch, devices);
    });
  }, []);

  useEffect(() => {
    window.api.receive("fromMain_Interval", (forecast1: CurrentWeather) => {
      setForecast(dispatch, forecast1);
    });
  }, []);
  useEffect(() => {
    window.api.receive("fromMain_SpotifyTrack", (currentTrack: Track) => {
      setCurrentTrack(sDispatch, currentTrack);
    });
  }, []);

  useEffect(() => {
    window.api.receive("fromMain_playback", (playBackState: MusicTrack) => {
      setPlayBackState(sDispatch, playBackState);
    });
  }, []);

  useEffect(() => {
    window.api.receive("fromMain_Interval_News", (news1: NewsArticle[]) => {
      setNews(dispatch, news1);
    });
  }, []);

  useEffect(() => {
    window.api.receive("fromMain_background", (image: string) => {
      setBackground(image)
    });
  }, []);

  const Footer = () => <Grid container spacing={1} className={classes.paper}>
    <Grid item xs={10}>
      <Typography> {Object.keys(footerInfo).reduce(
        (a, v) => a + v + ": " + (footerInfo[v] || "-") + " ",
        (location?.address || "-") + " "
      )}</Typography>
    </Grid>
    <Grid item xs={2}>
      <SettingsIcon style={{ marginLeft: 8, marginRight: 8 }} onClick={() => showSettingsPage(dispatch, true)} />
    </Grid>
  </Grid>



  return (
    <Container className={classes.root} style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }} >
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <CurrentWeatherUI />
        </Grid>
        <Grid item xs={4}></Grid>
        <Grid item xs={4} style={{ padding: 16 }}>
          <Clock />
          <SpotifyPlayer />
        </Grid>
        <Grid item xs={12} style={{ padding: 8 }}>
          <Typography align="center" variant="h5" style={{ margin: 8, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            News
          </Typography>
        </Grid>
        <Grid item xs={12} style={{ padding: 8 }}>
          <List className={classes.listDisplay} style={{ margin: 8 }}>
            {Array.isArray(news) && news.length > 0 && (news.map((newsItem, i) =>
              <ListItem key={i}>
                <Container>
                  <Typography variant="h5" style={{ margin: 2 }}>
                    {newsItem.title}
                  </Typography>
                  <Divider />
                </Container>
              </ListItem>
            )
            )}</List>
        </Grid>
        <Grid item xs={12} style={{ padding: 8 }}>
          <SpotifyRecentlyPlayed />
        </Grid>
        <Footer />
      </Grid>
      <Settings open={context.showSettings} />
    </Container>
  );
}


