require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const UserInfo = require('./models/userInfo');
const ExerciseInfo = require('./models/exerciseInfo');


// Moddleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});


// API endpoints
// POST /api/users
app.post('/api/users', (req, res) => {
  try {
    UserInfo.find({ 'username': req.body.username }, (err, userData) => {
      if (err) {
        console.log(err);
      } else {
        if (userData.length === 0) {
          const u = new UserInfo({
            '_id': req.body.id,
            'username': req.body.username
          })
          u.save((err, data) => {
            if (err) {
              console.log('Error saving data =>', err);
            } else {
              res.json({
                '_id': data.id,
                'username': data.username
              })
            }
          })
        } else {
          res.send('Username already exists')
        }
      }
    });

  } catch (err) {
    console.log(err);
  }
})

// GET /api/users
app.get('/api/users', (req, res) => {
  try {
    UserInfo.find({}, (err, users) => {
      if (err) {
        console.log(err);
        res.json({
          message: 'Getting users list - FAILED'
        })
      }

      if (users.length === 0) {
        res.json({
          message: 'No users in db'
        })
      }
      res.json(users);
    })
  } catch (err) {
    console.log(err);
  }
})

//POST /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', (req, res) => {
  try {
    let idJson = { 'id': req.params._id };
    let checkedDate = req.body.date;
    let idToCheck = idJson.id;

    let noDateHandler = () => {
      checkedDate = new Date(checkedDate);
      if (checkedDate instanceof Date && !isNaN(checkedDate)) {
        return checkedDate;
      } else {
        checkedDate = new Date();
      }
    }

    UserInfo.findById(idToCheck, (err, data) => {
      noDateHandler(checkedDate);
      if (err) {
        console.log(err);
      } else {
        const e = new ExerciseInfo({
          'username': data.username,
          'userId': idToCheck,
          'duration': req.body.duration,
          'description': req.body.description,
          'date': checkedDate.toDateString()
        })

        e.save((err, data) => {
          if (err) {
            console.log('Error saving exercises =>', err);
          } else {
            console.log('Exercises saved succesfully')
            res.json({
              'username': data.username,
              'description': data.description,
              'duration': data.duration,
              'date': data.date.toDateString(),
              '_id': idToCheck
            })
          }
        })
      }
    })
  } catch (err) {
    console.log(err);
  }
})

// GET /api/users/:_id/logs?[from][&to][&limit]
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const userId = req.params._id;
    const from = req.query.from || new Date(0).toDateString();
    const to = req.query.to || new Date(Date.now()).toDateString();
    const limit = req.query.limit || 0;

    let user = await UserInfo.findById(userId).exec();

    let exercises = await ExerciseInfo.find({
      userId: userId,
      date: {
        $gte: from,
        $lte: to
      }
    }).select('description duration date')
      .limit(limit)
      .exec();

    let parseDatesLog = exercises.map((exercise) => {
      return {
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      }
    });

    res.json({
      _id: user._id,
      username: user.username,
      count: parseDatesLog.length,
      log: parseDatesLog
    });
  } catch (err) {
    console.log(err);
  }
})


// MongoDB connection
// const mongoDbUri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPAS}@freecodecampexercisetra.p4prxcl.mongodb.net/exerciseTracker`;
const mongoDbUri = process.env.MONGOURI;
const connectDb = async () => {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(mongoDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.log(err);
  }
}

connectDb();

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
