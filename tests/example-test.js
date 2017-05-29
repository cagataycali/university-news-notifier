/*
 For test purposal,
 yarn add scrape-it
 node example.js
*/
const scrapeIt = require("scrape-it");

const data = {
    "university": "Pamukkale Üniversitesi",
    "faculity": "Computer Engineering",
    "home":"http://www.pamukkale.edu.tr",
    "url": "http://www.pamukkale.edu.tr/bilgisayar/tr/haberler",
    "scrape": {
        "news": {
            "listItem": "tr",
            "name": "announcement",
            "data": {
                "url": {
                    "selector": "a.tumunuGorLink",
                    "attr": "href"
                },
                "title": "div.tumunuGorBaslik",
                "publishedAt": "div.tumunuGorTarih"
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
