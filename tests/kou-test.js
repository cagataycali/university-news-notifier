/*
 For test purposal,
 yarn add scrape-it
 node example.js
*/
const scrapeIt = require("scrape-it");

const data = {
    "university": "Kocaeli Üniversitesi",
    "faculity": "Bilgisayar Mühendisliği",
    "home":"http://bilgisayar.kocaeli.edu.tr/",
    "url": "http://bilgisayar.kocaeli.edu.tr/tumgenelduyurular.php",
    "scrape": {
        "news": {
            "listItem": "div.contentList > div",
            "name": "announcement",
            "data": {
                "url": {
                    "selector": "div.mainInfo > div.title > a",
                    "attr": "href"
                },
                "title": "div.mainInfo > div.title > a",
                "publishedAt": 
                {
                  "selector": "div.dateBox",
                  convert: x => x.split(' ')[2]+" "+x.split(' ')[0]+" "+x.split(' ')[1].replace('\n\t\t\t\t\t\t\t', '')
                }
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