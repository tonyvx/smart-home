interface IIPLocation {
  address: string;
  ip: string;
  coordinates: string;
  lat: string;
  lon: string;
  zip_code: string;
}

export class IPLocation implements IIPLocation {
  address: string;
  ip: string;
  coordinates: string;
  lat: string;
  lon: string;
  zip_code: string;

  constructor(city: string, region_code: string, country_code: string, zip_code: string, ip: string, latitude: string, longitude: string) {
    const address = city +
      ", " +
      region_code +
      ", " +
      country_code +
      ", " +
      zip_code;

    const coordinates = "(" + latitude + ", " + longitude + ")";
    this.address = address;
    this.ip = ip;
    this.coordinates = coordinates;
    this.lat = latitude;
    this.lon = longitude;
    this.zip_code = zip_code;
  }
  
}
