const scrapeIt = require("scrape-it");

const data = {
    "university": "Boğaziçi Üniversitesi",
    "faculity": "",
    "home":"http://bogazici.edu.tr",
    "url": "http://bogazici.edu.tr/tr-TR/Content/Duyurular/Duyurular",
    "scrape": {
        "news": {
            "listItem": "ul.newslist > li",
            "name": "announcement",
            "data": {
                "url": {
                    "selector": "a.urltoGO",
                    "attr": "href"
                },
                "title": "a",
                "publishedAt": "span.date"
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
