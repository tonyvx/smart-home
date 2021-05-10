import {
  Avatar,
  Container,

  Grid,
  Typography
} from "@material-ui/core";
import SunsetIcon from "@material-ui/icons/Brightness4";
import SunriseIcon from "@material-ui/icons/Brightness5";
import React from "react";

export const CurrentWeather = ({ forecast, news }) => {
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
                src={forecast
                  ? "http://openweathermap.org/img/w/" +
                  forecast.weather.icon +
                  ".png"
                  : null}
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
