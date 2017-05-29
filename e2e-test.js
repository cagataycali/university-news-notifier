const scrapeIt = require("scrape-it");
const Datastore = require('nedb')
const news = new Datastore({filename: 'news.db', autoload: true});
const universities = new Datastore({filename: 'universities.db', autoload: true});
const moment = require('moment');
const exec = require('child_process').exec;
const CronJob = require('cron').CronJob;

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

exec('rm *.db', (error, stdout, stderr) => {
  console.log('Removed universities data.');
})

// Extract sites from sites/*.json ..
exec('cd sites && ls *.json', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  // Data ..
  // const scrape = require(`${process.cwd()}/sites/${stdout.trim()}`);
  stdout.split('\n').forEach(async(item) => {
    item = item.trim();
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
      await addParticipant({
        useraname: 'cagataycali',
        telegramId: 149632499,
        university: content.university
      })
      scrapeAndSave(item);
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
            console.log('\n');
            getParticipants(data.university)
              .then((participants) => {
                participants.forEach((participant) => {
                  console.log(participant.useraname, participant.telegramId, 'need notify.', item.title, item.url, item.publishedAt);
                })
              })
              .catch((err) => {
                console.log('ERROR WHEN GET Participants');
              })

           });
        });
    });
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
