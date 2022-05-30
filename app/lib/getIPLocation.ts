import http from "https";

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
export interface IPLocation {
  address: string;
  ip: string;
  coordinates: string;
  lat: string;
  lon: string;
  zip_code: string;
}
export function getIPLocation() {
  

  return new Promise<IPLocation>(function (resolve, reject) {
    var req = http.request(options, function (res) {
      var chunks: Buffer[] = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        var body = JSON.parse(Buffer.concat(chunks).toString());
        console.log("IPLocation",body);
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
    }).on("error", (err) => reject("IPLocation Lookup"+ err));

    req.end();
  });
}


