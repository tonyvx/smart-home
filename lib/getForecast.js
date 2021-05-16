var weather = require("openweather-apis");
const { getTimeStamp } = require("./getFormattedTime");
var process = require("process");
require("dotenv").config();

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
weather.setAPPID(process.env.OPENWEATHER_TOKEN);

function getForecast(zipcode, lat, lon) {
  // weather.setZipCode(zipcode);
  weather.setCoordinate(lat, lon);
  return new Promise((resolve, reject) =>
    weather.getWeatherOneCall(function (err, JSONObj) {
      if (err) {
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

module.exports = { getForecast };
