const scrapeIt = require("scrape-it");

const data = {
    "university": "Karadeniz Teknik Üniversitesi",
    "faculity": "Bilgisayar Mühendisliği",
    "home":"http://www.ktu.edu.tr/",
    "url": "http://www.ktu.edu.tr/bilgisayar-tumduyuru",
    "scrape": {
        "news": {
            "listItem": "tr",
            "name": "announcement",
            "data": {
                "url": {
                    "selector": "a.yaz3.textcolor",
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
