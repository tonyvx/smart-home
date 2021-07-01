import { Container, Divider, Grid, List, ListItem, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect } from "react";
import {
  AppContext,
  initialState,
  reducer,
  setCurrentTrack,
  setFooterInfo,
  setForecast,
  setLocation,
  setNews,
  setRecentlyPlayed, setDevices,
  setPlayBackState, showSettingsPage,
} from "./AppContext";
import { Clock } from "./components/Clock";
import { CurrentWeather } from "./components/CurrentWeather";
import { SpotifyPlayer } from "./components/SpotifyPlayer";
import { SpotifyRecentlyPlayed } from "./components/SpotifyRecentlyPlayed";
import SettingsIcon from '@material-ui/icons/Settings';
import { Settings } from "./components/Settings";

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

  listDisplay: {
    width: 1400,
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

  const { footerInfo, location, news, forecast, showSettings } =
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
    window.api.receive("fromMain_Settings", (resp) => {
      setDevices(dispatch, resp);
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

  const Footer = () => <Container className={classes.paper}>
    {Object.keys(footerInfo).reduce(
      (a, v) => a + v + ": " + footerInfo[v] + " ",
      location.address + " "
    )}
    <SettingsIcon style={{ marginLeft: 8, marginRight: 8 }} onClick={() => showSettingsPage(dispatch)} />
  </Container>;
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
          <List className={classes.listDisplay}>
            {Array.isArray(news) && news.length > 0 && (news.map((newsItem, i) =>
              <ListItem key={i} align="center">
                <Container>
                  <Typography variant="h6" style={{ margin: 2 }}>
                    {newsItem.title}
                  </Typography>
                  <Divider />
                </Container>
              </ListItem>
            )
            )}</List>
        </Grid>
        <Grid item xs={12}>
          <SpotifyRecentlyPlayed />
        </Grid>
      </Grid>
      <Settings open={showSettings} />
      <Footer />
    </Container>
  );
}
