const scrapeIt = require("scrape-it");

const data = {
    "university": "Ondokuz Mayıs Üniversitesi",
    "faculity": "",
    "home":"http://www.omu.edu.tr/",
    "url": "http://www.omu.edu.tr/tr/tum-haberler",
    "scrape": {
        "news": {
            "listItem": ".allnews > li",
            "name": "announcement",
            "data": {
                "url": {
                    "selector": "a",
                    "attr": "href"
                },
                "title": "a",
                "publishedAt": "i"
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
