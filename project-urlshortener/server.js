const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const mongoose = require("mongoose");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true,
useUnifiedTopology: true });
const schema = new mongoose.Schema({url: 'string'});
const Url = mongoose.model('Url', schema);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Url shortener implementation
app.post("/api/shorturl", async (req, res) => {
  var urlInput = req.body.url
  const urlModel = new Url({ url: urlInput });
  dns.lookup(urlParser.parse(urlInput).hostname, async (err, address) => {
    if (address) {
      try {
        await urlModel.save((err, data) => {
          res.json({original_url: data.url, short_url: data.id});
        }); 
      } catch (err) {
        console.error(err)
        res.status[500].json('Server error...');
      }
    } else {
      res.json({error: 'invalid url' });
    }
  });
});

// Url redirection implementation
app.get("/api/shorturl/:url?", async (req, res) => {
  try {
    await Url.findById(req.params.url, (err, data) => {
      if (data) {
        res.redirect(data.url);
      } else {
        res.json('No such URL'); 
      }
    });
  } catch (err) {
    console.error(err)
    res.status[500].json('Server error...');
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});