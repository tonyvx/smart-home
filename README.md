

# Install electron

```sh
mkdir attendance-app && cd attendance-app
npm init -y
npm i --save-dev electron
npm install --save-dev @electron-forge/cli
npx electron-forge import

npm install -s electron-context-menu
npm install -s v8-compile-cache
```

```js
var os = require('os');

var networkInterfaces = os.networkInterfaces();

console.log(networkInterfaces);
```

# Smart App Packages

* Photos - [exif](https://www.npmjs.com/package/exifr)
* weather - https://openweathermap.org/
* map - https://www.openstreetmap.org/#map=5/38.007/-95.844
* news - https://newsapi.org/account
* Music - spotify
* ip - https://freegeoip.app/
* oauth in electron - https://medium.com/linagora-engineering/using-oauth-in-an-electron-application-abb0376c2ae0