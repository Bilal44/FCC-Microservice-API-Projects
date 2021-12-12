// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});



// listen for requests :)
var listener = app.listen(.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

// timestamp implementation
app.get("/api/:date?", (req, res) => {
  const date = req.params.date
  let parsedDate = new Date(date);
  let utcTimestamp = new Date().toUTCString();
  let unixTimestamp = new Date().getTime();
  
  if (date != null)  {
    if (!date.includes('-') && !date.includes(' ')) {
      unixTimestamp = parseInt(date)
      utcTimestamp = new Date(unixTimestamp).toUTCString()
    } else {
      utcTimestamp = parsedDate.toUTCString();
      unixTimestamp = parsedDate.getTime();
      if (utcTimestamp == "Invalid Date") {
        res.json({error : "Invalid Date"});
      }
    }
  }
  res.json({unix: unixTimestamp, utc: utcTimestamp});
});
