const scrapeIt = require("scrape-it");

const data = {
    "university": "Eskişehir Osmangazi Üniversitesi",
    "faculity": "",
    "home":"https://ogu.edu.tr",
    "url": "https://ogu.edu.tr",
    "scrape": {
        "news": {
            "listItem": "li",
            "name": "Blogclassic-Block",
            "data": {
                "url": {
                    "selector": "div > a",
                    "attr": "href"
                },
                "title": "div > a > h4",
                "publishedAt": "div > span"
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
