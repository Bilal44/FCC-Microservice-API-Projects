const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './process.env') });

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
const userSchema = new mongoose.Schema({ username: 'string' })
const User = mongoose.model('User', userSchema)
const exerciseSchema = new mongoose.Schema({ userId: 'string', description: 'string', duration: Number, date: Date });
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

// Get a list of all existing users
app.get("/api/users", (req, res) => {
  try {
    User.find({}, (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send(err.message);
      } else {
        res.json(data);
      }
    })
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
})

// Create new user
app.post("/api/users", (req, res) => {
  // Check if a user exists with the same username
  try {
    User.findOne({ username: req.body.username }, (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send(err.message);
      } else {
        if (data) {
          res.json({ error: 'A user with this username already exists, please select a new username.' });
        } else {
          // Create a new user record if an existing user with the provided username not found
          try {
            const newUser = new User({ username: req.body.username })
            newUser.save((err, data) => {
              if (err) {
                console.error(err);
                res.status(500).send(err.message);
              } else {
                res.json({ username: data.username, _id: data.id });
              }
            });
          } catch (err) {
            console.error(err);
            res.status(500).send(err.message);
          }
        }
      }
    })
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
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
          console.error(err);
          res.status(500).send(err.message);
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
})

// Get the exercise log belonging to a specific user
app.get("/api/users/:_id/logs", (req, res) => {
  var { from, to, limit } = req.query;
  from = (from === undefined ? new Date('0000-01-01') : new Date(from));
  to = (to === undefined ? new Date() : new Date(to));
  limit = (limit === undefined ? 0 : limit);

  try {
    User.findById(req.params._id, (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send(err.message);
      } else {
        if (!data) {
          res.json({ error: 'Invalid user id, no user found.' });
        } else {
          const username = data.username;
          const userId = data._id;

          // Populate exercise log for a valid user
          try {
            Exercise.find({ userId, date: { $gte: from, $lte: to } }, (err, data) => {
              if (err) {
                console.error(err);
                res.status(500).send(err.message);
              } else {
                var exercise = data.map(({ description, duration, date }) =>
                  ({ description, duration: duration, date: date.toDateString() }));
                res.json({ username, _id: userId, count: data.length, log: exercise })
              }
            }).limit(+limit);
          } catch (err) {
            console.error(err);
            res.status(500).send(err.message);
          }
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})