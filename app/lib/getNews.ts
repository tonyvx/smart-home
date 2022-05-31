import http from "https";

var options = {
  method: "GET",
  hostname: "newsapi.org",
  port: 443,
  path:
    "/v2/top-headlines?country=us&category=business&apiKey=c871fccd7aee465996974c7d16ef3e1c",
  headers: {
    accept: "application/json",
    "content-type": "application/json",
    "user-agent": "electron"
  },
};

export function getNews() {
  return new Promise<Article[]>(function (resolve, reject) {
    var req = http
      .request(options, function (res) {
        var chunks: Buffer[] = [];

        res.on("data", function (chunk) {
          chunks.push(chunk);
        });

        res.on("end", function () {
          var body = JSON.parse(Buffer.concat(chunks).toString());
          console.log("news items", body?.articles.length);

          body?.message && reject(body.message)

          resolve(
            body?.articles?.map((item: Article) => item) || [{title : "no news"}]
          );
        });
      })
      .on("error", (err) => {
        console.log("Error: " + err.message);
        reject(err)
      });

    req.end();
  });
}

export interface Article {
  source: {
    id: string | null,
    name: string
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}