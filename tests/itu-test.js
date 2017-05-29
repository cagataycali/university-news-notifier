/*
 For test purposal,
 yarn add scrape-it
 node example.js
*/
const scrapeIt = require("scrape-it");

const data = {
    "university": "İstanbul Teknik Üniversitesi",
    "faculity": "",
    "home":"http://www.itu.edu.tr/",
    "url": "http://www.itu.edu.tr/duyuru",
    "scrape": {
        "news": {
            "listItem": "tr",
            "name": "announcement",
            "data": {
                "url": {
                    "selector": "a.link",
                    "attr": "href"
                },
                "title": "a",
                "publishedAt": "span.sfkonularPublicationDate"
            }
        }
    }
}
const baseURI = data.url;
const scrape = data.scrape;

scrapeIt(baseURI, scrape).then(page => {
  page = page.news.filter((piece) => {
    if (piece.url && piece.title) {
      if (!piece.url.includes(baseURI)) {
        piece.url = `${data.home}${piece.url}`;
        return piece;
      } else {
        return piece;
      }
    }
  });
  console.log(page);
});
