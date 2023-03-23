require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Schema, model } = require('mongoose');
const app = express();


// Schemas
const userSchema = new Schema({
  'username': String
});

const exerciseSchema = new Schema({
  'username': String,
  'date': Date,
  'duration': Number,
  'description': String
});

const logSchema = new Schema({
  'username': String,
  'count': Number,
  'log': Array,
});


// Models
const UserInfo = mongoose.model('userInfo', userSchema);
const ExerciseInfo = mongoose.model('exerciseInfo', exerciseSchema);
const LogInfo = mongoose.model('logInfo', logSchema);


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

//POST /api/users/:_id/exercises
// !!!!! work with date 
app.post('/api/users/:_id/exercises', (req, res) => {
  try {
    let idJson = { 'id': req.params._id };
    let checkedDate = new Date(req.body.date);
    let idToCheck = idJson.id;

    let noDateHandler = () => {
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
app.get('/api/users/:_id/logs', (req, res) => {
  const { from, to, limit } = req.query;
  let idJson = { 'id': req.params._id };
  let idToCheck = idJson.id;

  UserInfo.findById(idToCheck, (err, data) => {
    var query = {
      'username': data.username
    }

    if (from !== undefined && to === undefined) {
      query.date = { $gte: new Date(from) }
    } else if (to !== undefined && from === undefined) {
      query.date = { $lte: new Date(to) }
    } else if (to !== undefined && from !== undefined) {
      query.date = { $gte: new Date(from), $lte: new Date(to) }
    }

    let limitChecker = (limit) => {
      let maxLimit = 100;
      if (limit) {
        return limit;
      } else {
        return maxLimit;
      }
    }

    if (err) {
      console.log(err);
    } else {
      ExerciseInfo.find((query), null, { limit: limitChecker(+limit) }, (err, data) => {
        let loggedArr = [];
        if (err) {
          console.log(err);
        } else {
          let documents = data;
          loggedArr = documents.map(i => {
            return {
              'description': i.description,
              'duration': i.duration,
              'log': i.date.toDateString(),
            }
          })

          const l = new LogInfo({
            'username': data.username,
            'count': loggedArr.length,
            'log': loggedArr
          })

          l.save((err, data) => {
            if (err) {
              console.log(err)
            } else {
              res.json({
                username: data.username,
                count: data.count,
                _id: idToCheck,
                log: loggedArr
              })
            }
          })
        }
      })
    }
  })
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
