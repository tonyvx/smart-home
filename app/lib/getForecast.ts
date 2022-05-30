import weather from "openweather-apis";
import { getTimeStamp } from "./getFormattedTime";
import { secrets } from "../creds";
weather.setLang("en");
// English - en, Russian - ru, Italian - it, Spanish - es (or sp),
// Ukrainian - uk (or ua), German - de, Portuguese - pt,Romanian - ro,
// Polish - pl, Finnish - fi, Dutch - nl, French - fr, Bulgarian - bg,
// Swedish - sv (or se), Chinese Tra - zh_tw, Chinese Sim - zh (or zh_cn),
// Turkish - tr, Croatian - hr, Catalan - ca

// set city by name
// weather.setCity("Fairplay");
// or set the coordinates (latitude,longitude)

// or set city by ID (recommended by OpenWeatherMap)
// weather.setCityId(4367872);

// or set zip code
// weather.setZipCode(33615);

// 'metric'  'internal'  'imperial'
weather.setUnits("imperial");

// check http://openweathermap.org/appid#get for get the APPID
secrets("OPENWEATHER_TOKEN").then(value => weather.setAPPID(value));

declare module 'openweather-apis';

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

export type CurrentWeather = {
  weather: {
    temp: string;
    feels_like: string;
    temp_min: string;
    temp_max: string;
    description: string;
    icon: string;
  }
  wind: string;
  sunrise: string;
  sunset: string;
};

function getForecast(_zipcode: string, lat: string, lon: string) {
  weather.setCoordinate(lat, lon);


  return new Promise<CurrentWeather>((resolve, reject) =>
    weather.getWeatherOneCall(function (err: Error, JSONObj: OpenWeather) {
      if (err) {
        console.log(err);
        reject(err);
      }

      JSONObj && resolve({
        weather: {
          temp: JSONObj.current.temp,
          feels_like: JSONObj.current.feels_like,
          temp_min: JSONObj.daily[0].temp.min,
          temp_max: JSONObj.daily[0].temp.max,
          description:
            JSONObj.current.weather[0].main +
            ", " +
            JSONObj.current.weather[0].description,
          icon: JSONObj.current.weather[0].icon,
        },
        wind: JSONObj.current.wind_speed,
        sunrise: getTimeStamp(JSONObj.current.sunrise),
        sunset: getTimeStamp(JSONObj.current.sunset),
      });
    })
  );
}

export { getForecast };
