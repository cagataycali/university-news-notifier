const scrapeIt = require("scrape-it");
const Datastore = require('nedb')
const news = new Datastore({filename: 'news.db', autoload: true});
const universities = new Datastore({filename: 'universities.db', autoload: true});
const moment = require('moment');
const exec = require('child_process').exec;
const CronJob = require('cron').CronJob;
const TelegramBot = require('node-telegram-bot-api');
const rssParser = require('rss-parser');

const appUrl = `https://${process.env.APP_NAME}.herokuapp.com:443`;
const options = {
    webHook: {
        port: process.env.PORT
    }
};
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, options);

bot.setWebHook(`${appUrl}/bot${process.env.TELEGRAM_TOKEN}`);

news.ensureIndex({
    fieldName: 'url',
    unique: true
}, function(err) {});

universities.ensureIndex({
    fieldName: 'university',
    unique: true
}, function(err) {});

moment.locale("tr");

// Clear db.
bot.onText(/\/clear/, msg => {
  const chatId = msg.chat.id;
  if (chatId === 149632499) {
    exec('rm *.db', err => err ? console.log('Error', err) : '');
    bot.sendMessage(chatId, 'Cleared db.');

  } else {
    bot.sendMessage(chatId, `Please contact with admin, @cagataycali`);
  }
});

bot.onText(/(.+)$/, async(msg, match) => {
    const chatId = msg.chat.id;
    let keyboardItems = await inlineKeyboardItems();

    keyboardItems = keyboardItems.map((entry) => {
        return [
            {
                text: entry.university,
                callback_data: entry.university
            }
        ]
    })

    let replyOptions = {
        reply_markup: {
            inline_keyboard: keyboardItems
        }
    };

    bot.sendMessage(chatId, "Did you mean?", replyOptions).then(() => {
        bot.once("callback_query", answer => {
            console.log(answer.message.chat.username, answer.data, answer.message.chat.id);
            if (answer.data !== 'nope') {
                bot.sendMessage(chatId, `You choose ${answer.data}`);
                addParticipant({username: answer.message.chat.username, telegramId: answer.message.chat.id, university: answer.data.trim()});
                bot.sendMessage(chatId, `You are participant ${answer.data} now.`);
            } else {
                bot.sendMessage(chatId, "Maybe you can add your university : https://github.com/cagataycali/university-news-notifier")
            }
        });
    }).catch((err) => {
        console.log(err);
    })

});

exec('ls sites/*.json sites/*.js', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }

    stdout.split('\n').forEach((item) => {
        item = item.trim();
        item = item.split('sites/').join('');
        let extention = item.split('.').pop(-1);
        if (extention === 'json') {
            let content = require(`${process.cwd()}/sites/${item}`);
            let data = {
                university: content.university,
                faculity: content.faculity,
                directory: item,
                participants: []
            }
            universities.insert(data, function(err, newDoc) {
                if (err) {
                    console.log(err.errorType === 'uniqueViolated'
                        ? 'Bu üniversite mevcut..'
                        : 'Bir hata oluştu' + err);
                } else {
                    console.log(`Bu üniversite eklendi ${item.trim().split('.json')[0]}`);
                }
            });
            scrapeAndSave(item);
        } else if (extention === 'js') {
            let content = require(`${process.cwd()}/sites/${item}`);
            let data = {
                university: content.data.university,
                faculity: content.data.faculity,
                directory: item,
                participants: []
            }
            universities.insert(data, function(err, newDoc) {
                if (err) {
                    console.log(err.errorType === 'uniqueViolated'
                        ? 'Bu üniversite mevcut..'
                        : 'Bir hata oluştu' + err);
                } else {
                    console.log(`Bu üniversite eklendi ${item.trim().split('.js')[0]}`);
                }
            });
            scrapeAndSave(item);
        } else {
            console.log('nothing');
        }
    })
});

/*
  Get inline keyboard items(universities).
  Example usage: let inlineKeyboardItems = await inlineKeyboardItems();
*/
function inlineKeyboardItems() {
    return new Promise((resolve, reject) => {
        universities.find({
            university: {
                $gt: ""
            }
        }, (err, docs) => {
            err
                ? reject(err.errorType)
                : resolve(docs);
        })
    });
}

/*
  Add participants in university feeds.
  Example usage: let numRowsUpdated = await addParticipant({
    username: 'cagataycali',
    telegramId: 149632499,
    university: 'Pamukkale Üniversitesi'
  });
*/
function addParticipant(obj) {
    return new Promise((resolve, reject) => {
        universities.update({
            university: obj.university
        }, {
            $push: {
                participants: obj
            }
        }, {}, (err, numRowsUpdated) => {
            err
                ? reject(err.errorType)
                : resolve(numRowsUpdated);
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
        universities.findOne({
            university
        }, (err, docs) => {
            err
                ? reject(err.errorType)
                : resolve(docs.participants);
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
    return new Promise(async(resolve, reject) => {
        let data = require(`${process.cwd()}/sites/${file}`);
        const baseURI = data.home;
        let extention = file.split('.').pop(-1);
        if (extention === 'js') {
            var page = await data.page();
            data = data.data; // Bind data object ..
            page.forEach((item) => {
                item.scrapedAt = moment().format();
                news.insert(item, function(err, newDoc) {
                    if (!err) {
                        getParticipants(data.university).then((participants) => {
                            participants.forEach((participant) => {
                                // send telegram notification
                                console.log(participant.username, participant.telegramId, 'need notify.', item.title, item.url, item.publishedAt);
                                bot.sendMessage(participant.telegramId, `${item.title} ${item.publishedAt} \n ${item.url}`);
                            })
                        }).catch((err) => {
                            console.log('ERROR WHEN GET Participants');
                        });
                    }
                });
            });
        } else if (extention === 'json' && data.rss) {
            rssParser.parseURL(data.rss, function(err, parsed) {
                parsed.feed.entries.forEach(function(entry) {
                    news.insert({
                        "title": entry.title,
                        "url": entry.link,
                        "publishedAt": entry.pubDate,
                        "scrapedAt": moment().format()
                    }, function(err, newDoc) {
                        if (!err) {
                            getParticipants(data.university).then((participants) => {
                                participants.forEach((participant) => {
                                    console.log(participant.username, participant.telegramId, 'need notify.', entry.title, entry.link, entry.pubDate);
                                    bot.sendMessage(participant.telegramId, `${entry.title} ${entry.pubDate} \n ${entry.link}`);
                                })
                            }).catch((err) => {
                                console.log('ERROR WHEN GET Participants', err);
                            })
                        }
                    });
                })
            })
        } else {
            const scrape = data.scrape;
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
                    news.insert(item, function(err, newDoc) {
                        if (!err) {
                            getParticipants(data.university).then((participants) => {
                                participants.forEach((participant) => {
                                    // send telegram notification
                                    console.log(participant.username, participant.telegramId, 'need notify.', item.title, item.url, item.publishedAt);
                                    bot.sendMessage(participant.telegramId, `${item.title} ${item.publishedAt} \n ${item.url}`);
                                })
                            }).catch((err) => {
                                console.log('ERROR WHEN GET Participants');
                            });
                        }
                    });
                });
            });
        }
    });
}

new CronJob('00 * * * * *', () => {
    exec('ls sites/*.json sites/*.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        stdout = stdout.split('sites/').join('');
        stdout.split('\n').forEach((item) => {
            item = item.trim();
            scrapeAndSave(item);
        });
    });
}, null, true, 'America/Los_Angeles');
