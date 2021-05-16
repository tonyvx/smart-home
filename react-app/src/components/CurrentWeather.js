import {
  Avatar,
  Container,
  Grid,
  Typography,
  useTheme,
} from "@material-ui/core";
import { grey, yellow } from "@material-ui/core/colors";
import SunsetIcon from "@material-ui/icons/Brightness4";
import SunriseIcon from "@material-ui/icons/Brightness5";
import React from "react";

export const CurrentWeather = ({ forecast, news }) => {
  const theme = useTheme();
  const sunrise = forecast && forecast.sunrise ? forecast.sunrise : 0;
  const sunset = forecast && forecast.sunset ? forecast.sunset : 0;
  const weatherIcon = forecast
    ? "http://openweathermap.org/img/w/" + forecast.weather.icon + ".png"
    : null;
  const currentTemp =
    forecast && forecast.weather && forecast.weather.temp > 0
      ? Math.round(forecast.weather.temp)
      : "";
  const feelsLikeTemp = forecast
    ? " " + Math.round(forecast.weather.feels_like)
    : "";
  const weatherDescription = forecast ? forecast.weather.description : "";
  // const minAndMaxTemp = forecast
  //   ? "High " +
  //     Math.round(forecast.weather.temp_max) +
  //     "&deg;F " +
  //     "Low " +
  //     Math.round(forecast.weather.temp_min) +
  //     "&deg;F "
  //   : "";
  return forecast ? (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Avatar
                align="center"
                id="wicon"
                src={weatherIcon}
                alt="Weather icon"
                style={{
                  width: theme.spacing(10),
                  height: theme.spacing(10),
                }}
              ></Avatar>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h1">{currentTemp}&deg;</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" align="center">
                Feels like
                {feelsLikeTemp}&deg;
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={9}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h3" align="center">
                {weatherDescription}
              </Typography>
            </Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={8}>
              {forecast &&
                forecast.weather &&
                forecast.weather.temp_max &&
                forecast.weather.temp_min && (
                  <Typography variant="h5" align="center">
                    High {Math.round(forecast.weather.temp_max)}&deg;F Low{" "}
                    {Math.round(forecast.weather.temp_min)}&deg;F
                  </Typography>
                )}
            </Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={4}>
              <Container>
                <Typography variant="h5">
                  {sunrise && sunrise.substr(0, 5)}
                </Typography>
                <SunriseIcon style={{ color: yellow[400] }}/>
              </Container>
            </Grid>
            <Grid item xs={4}>
              <Container>
                <Typography variant="h5">
                  {sunset && sunset.substr(0, 5)}
                </Typography>
                <SunsetIcon style={{ color: grey[400] }}/>
              </Container>
            </Grid>
            <Grid item xs={2}></Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  ) : null;
};
