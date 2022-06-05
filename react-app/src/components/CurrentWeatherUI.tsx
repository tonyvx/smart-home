import {
  Avatar,
  Container,
  Grid, Typography,
  useTheme
} from "@material-ui/core";
import { blue, grey, red, yellow } from "@material-ui/core/colors";
import SunsetIcon from "@material-ui/icons/Brightness4";
import SunriseIcon from "@material-ui/icons/Brightness5";
import React from "react";
import { AppContext } from "../contexts/AppContext";
// import { CurrentWeather } from "../AppContext";
import { ThermostatIcon } from "../icons/icons";

export const CurrentWeatherUI = () => {
  const { context, dispatch } = React.useContext(AppContext);
  const theme = useTheme();
  const { forecast } = context
  const sunrise = forecast?.sunrise ? forecast.sunrise : "--";
  const sunset = forecast?.sunset ? forecast.sunset : "--";
  const weatherIcon = forecast?.weather?.icon
    ? "http://openweathermap.org/img/w/" + forecast.weather.icon + ".png"
    : undefined;
  const currentTemp = forecast?.weather?.temp && forecast?.weather?.temp > 0
    ? Math.round(forecast?.weather?.temp)
    : "--";
  const feelsLikeTemp = forecast?.weather?.feels_like
    ? " " + Math.round(forecast.weather.feels_like)
    : " -- ";
  const weatherDescription = forecast?.weather?.description || "---";
  return forecast ? (
    <Container style={{
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }}>
      <Grid container spacing={3}>
        <Grid item xs={4} />
        <Grid item xs={1}>
          <Avatar
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
          <ThermostatIcon fontSize="large" style={{ color: red[900] }} />
        </Grid>
        <Grid item xs={2}>
          {forecast &&
            forecast.weather &&
            forecast.weather.temp_max &&
            forecast.weather.temp_min && (<>
              <Typography variant="h5" align="center">
                {Math.round(forecast.weather.temp_max)}&deg; F
              </Typography>

            </>
            )}
        </Grid>
        <Grid item xs={1}>
          <ThermostatIcon fontSize="large" style={{ color: blue[900] }} />
        </Grid>
        <Grid item xs={2}>
          {forecast &&
            forecast.weather &&
            forecast.weather.temp_max &&
            forecast.weather.temp_min && (<>
              <Typography variant="h5" align="center">
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
            {sunrise && sunrise.substring(0, 5)}
          </Typography>
        </Grid>
        <Grid item xs={2} />
        <Grid item xs={1}><SunsetIcon style={{ color: grey[400] }} fontSize="large" /></Grid>
        <Grid item xs={2}>
          <Typography variant="h4" >
            {sunset && sunset.substring(0, 5)}
          </Typography>
        </Grid>
        <Grid item xs={2} />
      </Grid>


    </Container>
  ) : <div>No forecast</div>;
};
