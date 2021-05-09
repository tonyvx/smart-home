import {
  Avatar,
  Button,
  Container,
  Divider,
  Grid,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SunsetIcon from "@material-ui/icons/Brightness4";
import SunriseIcon from "@material-ui/icons/Brightness5";
import React, { useEffect, useState } from "react";
import { List } from "react-virtualized";
import "react-virtualized/styles.css";
import { getFormattedTime } from "../../lib/getFormattedTime";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import VolumeMuteIcon from "@material-ui/icons/VolumeMute";
import VolumeDownIcon from "@material-ui/icons/VolumeDown";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";

const useStyles = makeStyles((theme) => ({
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
  const classes = useStyles();
  const [footerInfo, setFooterInfo] = useState({});
  const [location, setLocation] = useState({});
  const [news, setNews] = useState([]);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [forecast, setForecast] = useState({ weather: {} });
  const [playlists, setPlaylists] = useState([]);
  const [track, setTrack] = useState({});

  useEffect(() => {
    window.api.receive("fromMain_FinishLoad", (resp) => {
      setFooterInfo(resp.footerInfo);
      setLocation(resp.location);
      setForecast(resp.forecast);
      setNews(resp.news);
    });
  }, []);

  useEffect(() => {
    window.api.receive("fromMain_Spotify", (resp) => {
      setPlaylists(resp);
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
      setForecast(resp);
    });
  }, []);
  useEffect(() => {
    window.api.receive("fromMain_SpotifyTrack", (resp) => {
      console.log(resp);
      setTrack(resp);
      resp.name ? setPlayerStarted(true) : setPlayerStarted(false);
    });
  }, []);

  return (
    <Container className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <CurrentWeather forecast={forecast} news={news} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1" align="center">
            {track.track}
          </Typography>
          <Typography variant="h3" align="center" padding="10">
            {currentTime}
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
          <SpotifyPlaylist playlists={playlists} />
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

const SpotifyPlaylist = ({ playlists }) => {
  const classes = useStyles();

  return (
    <Grid container spacing={3}>
      {Array.isArray(playlists) &&
        playlists.length > 0 &&
        playlists.map((p) => (
          <Grid item xs={1}>
            <Container
              align="center"
              onClick={() => window.api.send("toMain_OpenPlayer", p.url)}
            >
              <Avatar
                variant={"rounded"}
                src={p.image}
                className={classes.avatar}
              />
              <Typography variant="subtitle2">{p.description}</Typography>
            </Container>
          </Grid>
        ))}
      <Grid item xs={12}></Grid>
    </Grid>
  );
};

const SpotifyPlayer = () => {
  const [playerStarted, setPlayerStarted] = useState(false);
  const [volume, setVolume] = useState(50);
  return (
    <Container align="center">
      <Grid container spacing={3}>
        <Grid item xs={2}>
          <Button
            variant="outlined"
            onClick={() => {
              window.api.send(
                "toMain_Spotify",
                !playerStarted ? "play" : "pause"
              );
              setPlayerStarted(!playerStarted);
            }}
          >
            {!playerStarted ? (
              <PlayCircleOutlineIcon />
            ) : (
              <PauseCircleOutlineIcon />
            )}
          </Button>
        </Grid>

        <Grid item xs={2}>
          <Button
            variant="outlined"
            onClick={() => window.api.send("toMain_Spotify", "next")}
          >
            <SkipNextIcon />
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="outlined"
            onClick={() => window.api.send("toMain_SpotifyVolume", 0)}
          >
            <VolumeMuteIcon />
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="outlined"
            onClick={() => {
              setVolume(volume - 10);
              window.api.send("toMain_SpotifyVolume", volume - 10);
            }}
          >
            <VolumeDownIcon />
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="outlined"
            onClick={() => {
              setVolume(volume + 10);
              window.api.send("toMain_SpotifyVolume", volume + 10);
            }}
          >
            <VolumeDownIcon />
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

const CurrentWeather = ({ forecast, news }) => {
  const sunrise = forecast && forecast.sunrise ? forecast.sunrise : 0;
  const sunset = forecast && forecast.sunset ? forecast.sunset : 0;
  return forecast ? (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Avatar
                align="center"
                id="wicon"
                src={
                  forecast
                    ? "http://openweathermap.org/img/w/" +
                      forecast.weather.icon +
                      ".png"
                    : null
                }
                alt="Weather icon"
              ></Avatar>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h3">
                {forecast && forecast.weather && forecast.weather.temp > 0
                  ? Math.round(forecast.weather.temp)
                  : ""}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" align="center">
                Feels like{" "}
                {forecast ? Math.round(forecast.weather.feels_like) : ""}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={9}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" align="center">
                {forecast ? forecast.weather.description : ""}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle1" align="center">
                {forecast
                  ? "High " +
                    Math.round(forecast.weather.temp_max) +
                    "F " +
                    "Low " +
                    Math.round(forecast.weather.temp_min) +
                    "F "
                  : ""}
              </Typography>
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={3}>
              <Container>
                <Typography variant="subtitle1">
                  {sunrise && sunrise.substr(0, 5)}
                </Typography>
                <SunriseIcon />
              </Container>
            </Grid>
            <Grid item xs={3}>
              <Container>
                <Typography variant="subtitle1">
                  {sunset && sunset.substr(0, 5)}
                </Typography>
                <SunsetIcon />
              </Container>
            </Grid>
            <Grid item xs={6}></Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  ) : null;
};
