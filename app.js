
/* Note: using staging server url, remove .testing() for production
Using .testing() will overwrite the debug flag with true */ 
var LEX = require('letsencrypt-express').testing();

var lex = LEX.create({
  configDir: require('os').homedir() + '/letsencrypt/etc'
, approveRegistration: function (hostname, cb) { // leave `null` to disable automatic registration
    // Note: this is the place to check your database to get the user associated with this domain
    cb(null, {
      domains: [hostname]
    , email: 'CHANGE_ME' // user@example.com
    , agreeTos: true
    });
  }
});

var express = require('express');
var _ = require('lodash');
var app = express();
var bodyParser = require('body-parser');
var Datastore = require('nedb')
  , db = new Datastore({ filename: 'data.db', autoload: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/', function(req, res){
  res.send('Hello World');
});

app.post('/item/new', function(req, res){
  var body = req.body;
  var user = body.user;
  var item = body.item;
  var rest = body.rest;
  console.log('request:', body);

  if (!user || !item || !rest) {
    res.send('Need user + rest + item');
    return;
  }

  var searchObj = { 'rest': rest, 'item': item, 'user': user };
  db.find(searchObj, function(err, foundDoc) {
    console.log('foundDoc found:', foundDoc);

    var doc = _.pickBy({'item':item, vote:body.vote, rest:rest, user:user, comt:body.comment});
    var foundObj = _.pickBy(foundDoc[0]);

    if (foundDoc.length === 0) {

      db.insert(doc, function( err, newDoc) {
        res.json(newDoc);
      });
    } else {
      var updateObj = Object.assign({}, foundObj, doc);
      db.update(searchObj, updateObj, {}, function (err, numReplaced) {

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

// var server = app.listen(3000, function(){
//   console.log('Magic is happening on port 3000')
// });
lex.onRequest = app;

lex.listen([80], [443, 5001], function () {
  var protocol = ('requestCert' in this) ? 'https': 'http';
  console.log("Listening at " + protocol + '://localhost:' + this.address().port);
});