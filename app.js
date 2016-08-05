var fs = require('fs');
var express = require('express');
var https = require('https');
var cors = require('cors');
var _ = require('lodash');
var app = express();
var bodyParser = require('body-parser');
var Datastore = require('nedb')
  , db = new Datastore({ filename: 'data.db', autoload: true });

var options = {
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('fullchain.pem')
};
var secureServer = https.createServer(options, app).listen(443);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.options('*', cors());

app.get('/', function(req, res){
  res.send('So much to see, so much to eat');
});

app.post('/item/new', function(req, res){
  var body = req.body;
  var user = body.user;
  var item = body.item;
  var rest = body.rest;
  console.log('Item :', body);

  if (!user || !item || !rest) {
    res.send('Need user + rest + item');
    return;
  }

  var searchObj = { 'rest': rest, 'item': item, 'user': user };
  db.find(searchObj, function(err, foundDoc) {

    var doc = _.pickBy({'item':item, vote:body.vote, rest:rest, user:user, comt:body.comment});
    var foundObj = _.pickBy(foundDoc[0]);

    if (foundDoc.length === 0) {
      console.log('Entry saved');
      db.insert(doc, function( err, newDoc) {
        res.json(newDoc);
      });
    } else {
      var updateObj = Object.assign({}, foundObj, doc);
      db.update(searchObj, updateObj, {}, function (err, numReplaced) {
        console.log('Entry updated');
        db.find(searchObj, function(err, updatedDoc) {
          res.json(updatedDoc[0]);
        });

      });
    }
  })
});

app.get('/rest/:id', function(req, res){
  db.find({ "rest": req.params.id}, function(err, docs){
    res.json(docs);
  });
});


// This file was once maintained by a script running via a cronjob
// This file is no longer updated, and should be removed once enough users
// have updated to the latest version of diningin-tweaks extension
const averagesFileLocation = '/home/time/diningin-time-tracker/averages.json';

// Deprecated, use /delivery_times
app.get('/averages', function(req, res){
	var averages = JSON.parse(fs.readFileSync(averagesFileLocation, 'utf8'));
	res.json(averages);
});

// Deprecated, use /delivery_times
app.get('/averages/:id', function(req, res){
  var id = parseInt(req.params.id);
  var averages = JSON.parse(fs.readFileSync(averagesFileLocation, 'utf8'));
  if (averages[id]){
    res.send(averages[id]);
  } else {
    res.status(500).send();
  }
});

// This file is maintained by a python script in the same location as the output file
// This script is run weekly via a cronjob
// const deliveryTimesFileLocation = '/home/time/diningin-time-tracker/delivery_times.json'
const deliveryTimesFileLocation = '/Users/duncansteenburgh/Documents/diningin-time-tracker/delivery_times.json';

app.get('/delivery_times', function(req, res){
  var times = JSON.parse(fs.readFileSync(deliveryTimesFileLocation, 'utf8'));
  res.json(times);
});

app.get('/delivery_times/:id', function(req, res){
  var id = parseInt(req.params.id);
  var times = JSON.parse(fs.readFileSync(deliveryTimesFileLocation, 'utf8'));
  if (times[id]){
    res.send(times[id]);
  } else {
    res.status(500).send();
  }
});

// For local testing only
/*
const port = 3000;
var server = app.listen(port, function(){
  console.log(`Magic is happening on port ${port}`)
}); 
*/
