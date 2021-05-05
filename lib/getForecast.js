var weather = require("openweather-apis");
const { getTimeStamp } = require("./getFormattedTime");

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
weather.setAPPID("c5f5e17c931ac0a299b73985af539dc4");

function getForecast(zipcode) {
  weather.setZipCode(zipcode);
  return new Promise((resolve, reject) =>
    weather.getAllWeather(function (err, JSONObj) {
      console.log(JSONObj);
      resolve({
        weather: {
          ...JSONObj.main,
          description:
            JSONObj.weather[0].main + ", " + JSONObj.weather[0].description,
          icon: JSONObj.weather[0].icon,
        },
        wind: JSONObj.wind,
        sunrise: getTimeStamp(JSONObj.sys.sunrise),
        sunset: getTimeStamp(JSONObj.sys.sunset),
      });
    })
  );
}

module.exports = { getForecast };
