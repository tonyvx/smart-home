import {
  Avatar,
  Container,
  Divider,
  Grid,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SunsetIcon from "@material-ui/icons/Brightness4";
import SunriseIcon from "@material-ui/icons/Brightness5";
import React, { useEffect, useState } from "react";
import { getFormattedTime } from "../../lib/getFormattedTime";
import "react-virtualized/styles.css";
import { Table, Column, List } from "react-virtualized";

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
}));

export default function App() {
  const classes = useStyles();
  const [footerInfo, setFooterInfo] = useState({});
  const [location, setLocation] = useState({});
  const [news, setNews] = useState([]);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [forecast, setForecast] = useState({ weather: {} });

  useEffect(() => {
    window.api.receive("fromMain_FinishLoad", (resp) => {
      setFooterInfo(resp.footerInfo);
      setLocation(resp.location);
      setForecast(resp.forecast);
      setNews(resp.news);
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

  return (
    <Container className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <CurrentWeather forecast={forecast} news={news} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h3" align="center">
            {currentTime}
          </Typography>
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

const CurrentWeather = ({ forecast, news }) => {
  const sunrise = forecast && forecast.sunrise ? forecast.sunrise : 0;
  const sunset = forecast && forecast.sunset ? forecast.sunset : 0;
  return forecast ? (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <Typography variant="h3">
            {forecast && forecast.weather && forecast.weather.temp > 0
              ? Math.round(forecast.weather.temp)
              : ""}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Avatar
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
        <Grid item xs={6}></Grid>
        <Grid item xs={6}>
          <Typography variant="h6">
            {forecast ? forecast.weather.description : ""}
          </Typography>
        </Grid>
        <Grid item xs={6}></Grid>
        <Grid item xs={6}>
          <Typography variant="h6">
            Feels like {forecast ? Math.round(forecast.weather.feels_like) : ""}
          </Typography>
        </Grid>
        <Grid item xs={6}></Grid>
      </Grid>

      <Grid container spacing={3}>
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
    </Container>
  ) : null;
};
