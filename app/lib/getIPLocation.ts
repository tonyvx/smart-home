import http from "https";
import { IPLocation } from "../models/IPLocation";
import { log } from "../util/utils";

var options = {
  method: "GET",
  hostname: "api.ipbase.com",
  port: 443,
  path: "/v1/json",
  headers: {
    accept: "application/json",
    "content-type": "application/json",
  },
};

const logger = log("getIPLocation");
export function getIPLocation() {
  return new Promise<IPLocation>(function (resolve) {
    var req = http.request(options, function (res) {
      var chunks: Buffer[] = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        var body = JSON.parse(Buffer.concat(chunks).toString());
        logger("request", body);
        const { city, region_code, country_code, zip_code, ip, latitude, longitude } = body;
        let ipLocation = new IPLocation(city, region_code, country_code, zip_code, ip, latitude, longitude)

        resolve(ipLocation);
      });
    }).on("error", (err) => {
      logger("request", err?.message);
      resolve({} as IPLocation);
    });

    req.end();
  });
}


