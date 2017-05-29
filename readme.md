# :books: University news notifier

[![Bot API](http://img.shields.io/badge/Bot%20API-v3.0.0-00aced.svg)](https://core.telegram.org/bots/api)
![https://t.me/cagataycali](https://img.shields.io/badge/%F0%9F%92%AC%20Telegram-cagataycali-brightgreen.svg)
![https://t.me/emrfs](https://img.shields.io/badge/%F0%9F%92%AC%20Telegram-emreguler-brightgreen.svg)

When any announcement at your university, notifier will notify you via telegram.

Node.js module to interact with official [Telegram Bot API](https://core.telegram.org/bots/api). A bot token is needed, to obtain one, talk to ![@botfather](https://img.shields.io/badge/%F0%9F%92%AC%20Telegram-botfather-blue.svg) and create a new bot.

## :+1: Usage

**Start conversation with your bot**

![init](https://github.com/cagataycali/university-news-notifier/raw/master/screenshots/init.png)

**Bot will notify you when any announcement at your university**

![news](https://github.com/cagataycali/university-news-notifier/raw/master/screenshots/news.png)

## :sparkles: Contribution Guideline

This guide will show you how to build and contribute to the project.

**Clone and install dependencies**

```bash
git clone https://github.com/cagataycali/university-news-notifier.git
cd university-news-notifier
npm install
```

**Add your parser in sites directory**

Example parser json file,

```json
{
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
```

Even you can add your rss listener,

```json
{
    "university": "Yildiz Teknik Üniversitesi",
    "faculity": "Computer Engineering",
    "rss": "https://ytuce.maliayas.com/?type=rss"
}
```

**Update university list**

Check out [here](https://github.com/cagataycali/university-news-notifier/blob/master/index.js#L48)

**Test your parser**

Check out [here](https://github.com/cagataycali/university-news-notifier/blob/master/example-test.js)

**Run end to end test for results**

```bash
npm run test
```

## :cloud: Deploy on your own notifier

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/cagataycali/university-news-notifier)

## :zap: Status


|       University                                          |       Crawling Site                       |  Status  |
| --------------------------------------------------------- |:-----------------------------------------:|:--------:|
| [Yildiz Technical](https://www.ce.yildiz.edu.tr/)         |  https://ytuce.maliayas.com/              |   OK    |
| [Pamukkale](http://www.pamukkale.edu.tr/bilgisayar)       |  http://www.pamukkale.edu.tr/bilgisayar   |   OK     |
| [Dokuz Eylül](http://www.deu.edu.tr)       |  http://www.eng.deu.edu.tr   |   OK     |
| [Anadolu Universitesi](https://www.anadolu.edu.tr)        |  https://www.anadolu.edu.tr/duyurular     |   OK     |
| [İstanbul Teknik Universitesi](http://www.itu.edu.tr/)        |  http://www.itu.edu.tr/duyuru     |   OK     |


**Lets parse your university feeds :smiling_imp:**

**Or maybe help us for rss parsing feature.**

**Even you can support with your server, we don't want run on heroku.**

## :octocat: Contributors

* [Çağatay Çalı](https://github.com/cagataycali)
* [Emre Güler](https://github.com/pleycpl)
* [Murat Bastas](https://github.com/muratbsts)
