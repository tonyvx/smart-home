import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Container,
  Grid,
  Paper,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SunsetIcon from "@material-ui/icons/Brightness4";
import SunriseIcon from "@material-ui/icons/Brightness5";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React, { useEffect, useState } from "react";
import { getFormattedTime } from "../../lib/getFormattedTime";

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
}));

export default function App() {
  const classes = useStyles();
  const [footerInfo, setFooterInfo] = useState({});
  const [location, setLocation] = useState({});
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [forecast, setForecast] = useState({ weather: {} });

  useEffect(() => {
    window.api.receive("fromMain_FinishLoad", (resp) => {
      setFooterInfo(resp.footerInfo);
      setLocation(resp.location);
      setForecast(resp.forecast);
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
          <CurrentWeather forecast={forecast} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h3" align="center">
            {currentTime}
          </Typography>
        </Grid>
      </Grid>
      <Paper className={classes.paper}>
        {Object.keys(footerInfo).reduce(
          (a, v) => a + v + ": " + footerInfo[v] + " ",
          location.address + " "
        )}
      </Paper>
    </Container>
  );
}

const CurrentWeather = ({ forecast }) => {
  // let sunriseTm = new Date();
  // sunriseTm.setMilliseconds(
  //   forecast && forecast.sunrise ? forecast.sunrise * 1000 : 0
  // );

  const sunrise = forecast && forecast.sunrise ? forecast.sunrise : 0;
  // let sunsetTm = new Date();
  // sunsetTm.setMilliseconds(
  //   forecast && forecast.sunset ? forecast.sunset * 1000 : 0
  // );
  const sunset = forecast && forecast.sunset ? forecast.sunset : 0;
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  return (
    <Accordion
      expanded={expanded === "panel1"}
      onChange={handleChange("panel1")}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography variant="h3">
              {forecast ? Math.round(forecast.weather.temp) : ""}
            </Typography>
          </Grid>
          <Grid item xs={6}>
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
          <Grid item xs={12}>
            <Typography variant="h6">
              {forecast ? forecast.weather.description : ""}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">
              Feels like{" "}
              {forecast ? Math.round(forecast.weather.feels_like) : ""}
            </Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              Low: {forecast ? Math.round(forecast.weather.temp_min) : null}{" "}
              High:
              {forecast ? " " + Math.round(forecast.weather.temp_max) : null}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="subtitle1">
              {sunrise && sunrise.substr(0,5)}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <SunriseIcon />
          </Grid>
          <Grid item xs={3}>
            <Typography variant="subtitle1">
              {sunset && sunset.substr(0,5)}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <SunsetIcon />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
