import { getTimeStamp } from "../lib/getFormattedTime";

class Weather {
  temp: string;
  feels_like: string;
  temp_min: string;
  temp_max: string;
  description: string;
  icon: string;

  constructor(JSONObj: OpenWeather) {
    this.temp = JSONObj?.current?.temp;
    this.feels_like = JSONObj?.current?.feels_like;
    this.temp_min = JSONObj?.daily[0]?.temp?.min;
    this.temp_max = JSONObj?.daily[0]?.temp?.max;
    this.description =
      JSONObj?.current?.weather[0]?.main +
      ", " +
      JSONObj?.current?.weather[0]?.description;
    this.icon = JSONObj?.current?.weather[0]?.icon;
  }
}
export class CurrentWeather {
  weather: Weather;
  wind: string;
  sunrise: string;
  sunset: string;

  constructor(JSONObj: OpenWeather) {
    this.weather = new Weather(JSONObj);
    this.wind = JSONObj?.current?.wind_speed;
    this.sunrise = getTimeStamp(JSONObj?.current?.sunrise);
    this.sunset = getTimeStamp(JSONObj?.current?.sunset);
  }
}
export type OpenWeather = {
  current: {
    temp: string;
    feels_like: string;
    wind_speed: string;
    sunrise: string;
    sunset: string;
    weather: [{
      main: string;
      description: string;
      icon: string;
    }];
  };
  daily: [{
    temp: {
      min: string;
      max: string;
    };
  }];
};