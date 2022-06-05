import http from "https";
import { log } from "../util/utils";

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

const logger = log("getNews");

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
          logger("request", body?.articles?.length);

          resolve(
            body?.articles?.map((item: Article) => item) || [{ title: "no news" }]
          );
        });
      })
      .on("error", (err) => {
        logger("request", err?.message);
        resolve([{ title: "Error fetching news" }] as Article[])
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