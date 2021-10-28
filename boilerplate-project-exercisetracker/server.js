const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors')
require('dotenv').config()

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true,
useUnifiedTopology: true })
const personSchema = new mongoose.Schema({ username: 'string' })
const Person = mongoose.model('Person', personSchema)

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

// create new user
app.post("/api/users", async (req, res) => {
  const newUser = new Person ({ username: req.body.username })
  try { 
    await newUser.save((err, data) => {
      res.json({ username: data.username, _id: data.id });
    }); 
  } catch (err) {
    console.error(err)
    res.status[500].json('Server error...');
  }
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})