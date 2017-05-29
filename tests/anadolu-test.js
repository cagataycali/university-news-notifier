/*
 For test purposal,
 yarn add scrape-it
 node example.js
*/
const scrapeIt = require("scrape-it");

const data = {
    "university": "Anadolu Üniversitesi",
    "faculity": "Açıköğretim Fakültesi",
    "home":"https://anadolu.edu.tr",
    "url": "https://anadolu.edu.tr/duyurular",
    "scrape": {
        "news": {
            "listItem": "li",
            "name": "announcement",
            "data": {
                "url": {
                    "selector": "a.headLine",
                    "attr": "href"
                },
                "title": "a",
                "publishedAt": "a.calendar"
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
