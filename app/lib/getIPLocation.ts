import request from 'request';
import http from "https";
import { secrets } from "../creds";
import { IPLocation } from "../models/IPLocation";
import { log } from "../util/utils";
import { resolveProjectReferencePath } from 'typescript';

var options = {
  method: "GET",
  hostname: "api.ipbase.com",
  port: 443,
  path: `v3/info?apikey=${secrets("IP_LOCATION_API_KEY1")}`,
  headers: {
    accept: "application/json",
    "content-type": "application/json",
  },
};


const logger = log("getIPLocation");
export function getIPLocation() {
  return new Promise<IPLocation>(async function (resolve, _reject) {
    request.get(`https://api.ipbase.com/v2/info?apikey=${secrets("IP_LOCATION_API_KEY")}`, { json: true }, (err, res: request.Response, _body) => {
      if (err) {
        logger(`api.ipbase.com : ${res?.statusCode}`, err?.body);
        resolve({} as IPLocation)
      }
      if (res?.statusCode != 200) {
        logger(`api.ipbase.com : ${res?.statusCode}`, res?.body);
        resolve({} as IPLocation)
      }
      logger("Response", res.body.data);
      const location = res.body?.data?.location || {};
      const { city, region, country, zip, latitude, longitude } = location;
      resolve(new IPLocation(city?.name, region?.name, country?.alpha2, zip, res.body.data?.ip, latitude, longitude));
    })
  });
}


