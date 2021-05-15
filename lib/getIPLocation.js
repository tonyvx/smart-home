var http = require("https");

var options = {
  method: "GET",
  hostname: "freegeoip.app",
  port: null,
  path: "/json/",
  headers: {
    accept: "application/json",
    "content-type": "application/json",
  },
};

function getIPLocation() {
  return new Promise(function (resolve, reject) {
    var req = http.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        var body = JSON.parse(Buffer.concat(chunks).toString());
        const address =
          body.city +
          ", " +
          body.region_code +
          ", " +
          body.country_code +
          ", " +
          body.zip_code;

        const coordinates = "(" + body.latitude + ", " + body.longitude + ")";
        resolve({
          address,
          ip: body.ip,
          coordinates,
          lat: body.latitude,
          lon: body.longitude,
          zip_code: body.zip_code,
        });
      });
    });

    req.end();
  });
}

module.exports = { getIPLocation };
