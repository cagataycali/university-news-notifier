const scrapeIt = require("scrape-it");

const data = {
    "university": "Ege Üniversitesi",
    "faculity": "Bilgisayar Mühendisliği",
    "home":"http://bilmuh.ege.edu.tr",
    "url": "http://bilmuh.ege.edu.tr/",
    "scrape": {
        "news": {
            "listItem": "div.views-row",
            "name": "announcement",
            "data": {
                "url": {
                    "selector": "h2.node-title>a",
                    "attr": "href"
                },
                "title": "h2>a",
                "publishedAt": "span.date-display-single"
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
