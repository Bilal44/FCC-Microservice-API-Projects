const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors');
const { json } = require('express');
const path = require('path');
const { error } = require('console');
require('dotenv').config({ path: path.resolve(__dirname, './process.env') });

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true,
useUnifiedTopology: true })
const userSchema = new mongoose.Schema({ username: 'string' })
const User = mongoose.model('User', userSchema)
const exerciseSchema = new mongoose.Schema({ userId: 'string', description: 'string', duration: Number, date: Date});
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

// Get a list of all existing users
app.get("/api/users", async (req, res) => {
  try { 
    await User.find({}, (err, data)=>{
      res.json(data);
    })
  } catch (err) {
    console.error(err)
    res.status[500].json('Server error...');
  }
})

// Create new user
app.post("/api/users", (req, res) => {
  const newUser = new User ({ username: req.body.username })
  
  // Check if a user exists with the same username
  var userExists = false;
  User.findOne({ username : req.body.username }, (err, data) => {
  try {
    if(err) {
      res.status[500].json('Server error...');
    }
    if (data) {
      userExists = true;
      res.json({ error: 'A user with this username already exists, please select a new username.' });
    }
  } catch (err) {
    res.status[500].json('Server error...');
    }
  })

  if (userExists) {
    try { 
      newUser.save((err, data) => {
        res.json({ username: data.username, _id: data.id });
      }); 
    } catch (err) {
      console.error(err)
      res.status[500].json('Server error...');
    }
  }
})

// Create a new exercise
app.post("/api/users/:_id/exercises", (req, res) => {
  var { description, duration, date } = req.body;
  try {
    User.findById(req.params._id, (err, data) => {
      if (!data) {
        res.json({ error: 'Invalid user id, no user found.' }); 
      } else {
        const username = data.username;
        const userId = data._id;

        // Insert today's date if invalid or no date was provided by user
        date = new Date(date);
        if (date == "Invalid Date") {
          date = new Date();
        }
        
        // Save new exercise record for the user
        const newExercise = new Exercise({ userId, description, duration, date })
        try { 
          newExercise.save((err, data) => {
            if (err) {
              console.error(err);
              res.status(500).send(err.message);
            } else {
              res.json({ username: username, _id: userId, description: data.description, duration: data.duration, date: data.date.toDateString() });
            }
          }); 
        } catch (err) {
          console.error(err)
          res.json('Server error...');
        }
      }
    });
  } catch (err) {
    console.error(err)
    res.status[500].json('Server error...');
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})