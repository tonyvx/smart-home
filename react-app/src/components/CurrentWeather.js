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
import DownArrow from '@material-ui/icons/ArrowDownwardRounded';
import UpArrow from '@material-ui/icons/ArrowUpwardRounded';
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
  return forecast ? (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={4} />
        <Grid item xs={1}>
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
        <Grid item xs={3}>
          <Typography variant="h5" align="center" style={{ margin: 12 }}>
            {weatherDescription}
          </Typography>
        </Grid>
        <Grid item xs={4} />

        <Grid item xs={3} />
        <Grid item xs={1} >
          <UpArrow fontSize="large" />
        </Grid>
        <Grid item xs={2}>
          {forecast &&
            forecast.weather &&
            forecast.weather.temp_max &&
            forecast.weather.temp_min && (<>
              <Typography variant="h4" align="center">
                {Math.round(forecast.weather.temp_max)}&deg; F
              </Typography>

            </>
            )}
        </Grid>
        <Grid item xs={1}>
          <DownArrow fontSize="large" />
        </Grid>
        <Grid item xs={2}>
          {forecast &&
            forecast.weather &&
            forecast.weather.temp_max &&
            forecast.weather.temp_min && (<>
              <Typography variant="h4" align="center">
                {Math.round(forecast.weather.temp_min)}&deg; F
              </Typography>

            </>
            )}
        </Grid>
        <Grid item xs={3} />

        <Grid item xs={3} />
        <Grid item xs={6}>
          <Typography variant="h4" align="center">{currentTemp}&deg; F</Typography>
        </Grid>
        <Grid item xs={3} />

        <Grid item xs={3} />
        <Grid item xs={6}>
          <Typography variant="subtitle1" align="center">
            Feels like
            {feelsLikeTemp}&deg; F
          </Typography>
        </Grid>
        <Grid item xs={3} />

        <Grid item xs={2} />
        <Grid item xs={1}>
          <SunriseIcon style={{ color: yellow[400] }} fontSize="large" />
        </Grid>
        <Grid item xs={2}>
          <Typography variant="h4" >
            {sunrise && sunrise.substr(0, 5)}
          </Typography>
        </Grid>
        <Grid item xs={2} />
        <Grid item xs={1}><SunsetIcon style={{ color: grey[400] }} fontSize="large" /></Grid>
        <Grid item xs={2}>
          <Typography variant="h4" >
            {sunset && sunset.substr(0, 5)}
          </Typography>
        </Grid>
        <Grid item xs={2} />
      </Grid>


    </Container>
  ) : null;
};
