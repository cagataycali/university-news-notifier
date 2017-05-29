const scrapeIt = require("scrape-it");
const Datastore = require('nedb')
const news = new Datastore({filename: 'news.db', autoload: true});
const universities = new Datastore({filename: 'universities.db', autoload: true});
const moment = require('moment');
const exec = require('child_process').exec;
const CronJob = require('cron').CronJob;
const TelegramBot = require('node-telegram-bot-api');
const parser = require('rss-parser');

const appUrl = `https://${process.env.APP_NAME}.herokuapp.com:443`;
const options = {
  webHook: { port: process.env.PORT },
};
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, options);

bot.setWebHook(`${appUrl}/bot${process.env.TELEGRAM_TOKEN}`);

// Make unique.
news.ensureIndex({
    fieldName: 'url',
    unique: true
}, function(err) {});
// Make unique.
universities.ensureIndex({
    fieldName: 'university',
    unique: true
}, function(err) {});

moment.locale("tr");


// telegram section
bot.onText(/(.+)$/, function (msg, match) {
  const chatId = msg.chat.id;
  let replyOptions = {
      reply_markup: {
          inline_keyboard: [
              [ { text: "Anadolu Üniversitesi",  callback_data: "Anadolu Üniversitesi",  } ],
              [ { text: "Dokuz Eylül Üniversitesi",  callback_data: "Dokuz Eylül Üniversitesi",  } ],
              [ { text: "Ondokuz Mayıs Üniversitesi",  callback_data: "Ondokuz Mayıs Üniversitesi",  } ],
              [ { text: "Pamukkale Üniversitesi",  callback_data: "Pamukkale Üniversitesi",  } ],
              [ { text: "Nope, none of them.",  callback_data: "nope",  } ]
          ],
      },
  };

  bot.sendMessage(chatId, "Did you mean?", replyOptions)
      .then(() => {
          bot.once("callback_query", answer => {
            console.log(answer.message.chat.username, answer.data, answer.message.chat.id);
                if (answer.data !== 'nope') {
                  bot.sendMessage(chatId, `You choosed ${answer.data}`);
                  addParticipant({
                    useraname: answer.message.chat.username,
                    telegramId: answer.message.chat.id,
                    university: answer.data.trim()
                  });
                  bot.sendMessage(chatId, `You are participant ${answer.data} now.`);
                } else {
                  bot.sendMessage(chatId, "Maybe you can add your university : https://github.com/cagataycali/university-news-notifier")
                }
              });
          });
});

// telegram section


// Extract sites from sites/*.json ..
exec('cd sites && ls *.json', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  // Data ..
  // const scrape = require(`${process.cwd()}/sites/${stdout.trim()}`);
  stdout.split('\n').forEach((item) => {
    item = item.trim();
    scrapeAndSave(item);
    if (item.split('.json')[0].trim().length > 0) {
      let content = require(`${process.cwd()}/sites/${item}`);
      let data = {
        university: content.university,
        faculity: content.faculity,
        directory: item,
        participants: []
      }
      universities.insert(data, function (err, newDoc) {
        if (err) {
          console.log(err.errorType === 'uniqueViolated' ? 'Bu üniversite mevcut..': 'Bir hata oluştu' + err);
        } else {
          console.log(`Bu üniversite eklendi ${item.trim().split('.json')[0]}`);
        }
      });
    }
  })
});

/*
  Add participants in university feeds.
  Example usage: let numRowsUpdated = await addParticipant({
    useraname: 'cagataycali',
    telegramId: 149632499,
    university: 'Pamukkale Üniversitesi'
  });
*/
function addParticipant(obj) {
  return new Promise((resolve, reject) => {
    universities.update({ university: obj.university }, { $push: { participants: obj } }, {}, (err, numRowsUpdated) => {
      err ? reject(err.errorType) : resolve(numRowsUpdated);
    });
  });
}

/*
  Get participants in university.
  Example: university: 'Pamukkale Üniversitesi'
  Usage : let participants = await getParticipants('Pamukkale Üniversitesi');
*/
function getParticipants(university) {
  return new Promise((resolve, reject) => {
    universities.findOne({ university },  (err, docs) => {
      err ? reject(err.errorType) : resolve(docs.participants);
    })
  });
}

/*
  Scrape with directory's params.
  Save database.
  Send notification with telegram university listener participants.
  Example,
  file: pamukkale.json
*/
function scrapeAndSave(file) {
  return new Promise((resolve, reject) => {
    let data = require(`${process.cwd()}/sites/${file}`);
    const baseURI = data.home;

    if (data.rss) {
      rssParser.parseURL(data.rss, function(err, parsed) {
        console.log(parsed.feed.title);
        parsed.feed.entries.forEach(function(entry) {
          news.insert({
            "title": entry.title,
            "url": entry.link,
            "publishedAt": entry.pubDate,
            "scrapedAt": moment().format()
          }, function (err, newDoc) {
            if (!err) {
              getParticipants(data.university)
                .then((participants) => {
                  participants.forEach((participant) => {
                    console.log(participant.useraname, participant.telegramId, 'need notify.', entry.title, entry.link, entry.pubDate);
                    bot.sendMessage(participant.telegramId, `${entry.title} ${entry.pubDate} \n ${entry.link}`);
                  })
                })
                .catch((err) => {
                  console.log('ERROR WHEN GET Participants', err);
                })
            }
           });
        })
      })
    } else {
      const scrape = data.scrape;
      // Scrape it.
      scrapeIt(data.url, scrape).then(page => {
          page = page.news.filter((piece) => {
            if (piece.url && piece.title) {
              if (!piece.url.includes(baseURI)) {
                piece.url = `${baseURI}${piece.url}`;
                return piece;
              } else {
                return piece;
              }
            }
          });
          page.forEach((item) => {
            item.scrapedAt = moment().format()
            news.insert(item, function (err, newDoc) {
              if (err) {
                // console.log(err.errorType === 'uniqueViolated' ? 'Veritabanında mevcut..': 'Başka bir hata mevcut' + err);
              } else {
                console.log('inserted');
                getParticipants(data.university)
                  .then((participants) => {
                    participants.forEach((participant) => {
                      // send telegram notification
                      console.log(participant.useraname, participant.telegramId, 'need notify.', item.title, item.url, item.publishedAt);
                      bot.sendMessage(participant.telegramId, `${item.title} ${item.publishedAt} \n ${item.url}`);
                    })
                  })
                  .catch((err) => {
                    console.log('ERROR WHEN GET Participants');
                  })
              }
             });
          });
      });
    }
  });
}

new CronJob('00 * * * * *', function() {
  console.log('Cron..');
  exec('cd sites && ls *.json', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    // Data ..
    stdout.split('\n').forEach((item) => {
      item = item.trim();
      scrapeAndSave(item)
    })
  });
}, null, true, 'America/Los_Angeles');
