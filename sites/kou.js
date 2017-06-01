/*
 For test purposal,
 yarn add scrape-it
 node example.js
*/
const scrapeIt = require("scrape-it");
const slugify = require('slugify');

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
                  "selector": "div.dateBox", convert: x => x.split(' ')[2]+" "+x.split(' ')[0]+" "+x.split(' ')[1].replace('\n\t\t\t\t\t\t\t', '')
                }
            }
        }
    }
}

const baseURI = data.url;
const scrape = data.scrape;

// Don't forget export data
module.exports.data = data;
// Don't forget export page scrape result
module.exports.page = () => {
  return new Promise((resolve, reject) => {
    scrapeIt(baseURI, scrape).then(page => {
      page = page.news.filter((piece) => {
        if (piece.url && piece.title) {
          if (!piece.url.includes(baseURI)) {
            // Slugify special solution for Kocaeli.
            piece.url = `${data.home}${piece.url}${slugify(piece.title)}`;
            return piece;
          } else {
            return piece;
          }
        }
      });
      resolve(page)
    });
  });
}
