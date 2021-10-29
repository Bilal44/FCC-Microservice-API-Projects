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
app.post("/api/users", async (req, res) => {
  const newUser = new User ({ username: req.body.username })
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