var http = require("https");

var options = {
  method: "GET",
  hostname: "newsapi.org",
  port: null,
  path:
    "/v2/top-headlines?country=us&category=business&apiKey=c871fccd7aee465996974c7d16ef3e1c",
  headers: {
    accept: "application/json",
    "content-type": "application/json",
  },
};

function getNews() {
  return new Promise(function (resolve, reject) {
    var req = http
      .request(options, function (res) {
        var chunks = "";

        res.on("data", function (chunk) {
          chunks += chunk;
        });

        res.on("end", function () {
          var body = JSON.parse(chunks);
          resolve(
            body.articles.map((item) => {
              return { title: item.title };
            })
          );
        });
      })
      .on("error", (err) => {
        console.log("Error: " + err.message);
      });

    req.end();
  });
}

module.exports = { getNews };
