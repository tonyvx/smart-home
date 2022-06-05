import weather from "openweather-apis";
import { secrets } from "../creds";
import { CurrentWeather, OpenWeather } from "../models/Weather";
import { log } from "../util/utils";

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
// secrets("OPENWEATHER_TOKEN", new Store()).then(value => weather.setAPPID(value));
weather.setAPPID(secrets("OPENWEATHER_TOKEN"));

declare module 'openweather-apis';

const logger = log("getForecast")

export const getForecast = (_zipcode: string, lat: string, lon: string) => {
  weather.setCoordinate(lat, lon);
  return new Promise<CurrentWeather>((resolve, _reject) =>
    weather.getWeatherOneCall(function (err: Error, JSONObj: OpenWeather) {
      if (err) {
        logger("Error", err);
        resolve({} as CurrentWeather);
      }
      logger("request", JSONObj?.current)
      JSONObj && resolve(new CurrentWeather(JSONObj));
    })
  );
}
