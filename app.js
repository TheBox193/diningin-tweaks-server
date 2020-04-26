var fs = require('fs');
var morgan = require('morgan');
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

app.use(morgan('combined'));
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

app.post('/smartsocial/', function(req, res){
   var danceType =  _.get(req, 'body.request.intent.slots.TypeOfDance.value');
console.log(req.body);
    res.json({
      'version': '1.0',
      'response': {
        'outputSpeech': {
          'type': 'PlainText',
          'text': 'I\'m  dancing! Look at me go!'
        },
        'card': {
          'type': 'Simple',
          'title': 'Smart Social',
          'content': 'It must be time to dance.'
        },
        'reprompt': {
          'outputSpeech': {
            'type': 'PlainText',
            'text': 'Can I help you with anything else?'
          }
        },
        'shouldEndSession': false
      }
    });
});
// For local testing only
/*
const port = 3000;
var server = app.listen(port, function(){
  console.log(`Magic is happening on port ${port}`)
}); 
*/
