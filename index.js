require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Schema, model } = require('mongoose');
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const personSchema = new Schema({ username: String });
const Person = mongoose.model('Person', personSchema);

const exerciseSchema = new Schema({
  '_id': {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: Date
});
const Exersice = mongoose.model('Exersice', exerciseSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/users', async (req, res) => {
  try {
    const newPerson = new Person({ username: req.body.username });
    await newPerson.save();
    res.json({ 'username': newPerson.username, '_id': newPerson.id });
  } catch (err) {
    console.log(err);
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const id = req.params._id;
    const { description, duration, date } = req.body;
    await Person.findById(id, (err, personData) => {
      if (err || !personData) {
        res.send(`Could not find any user(person) with id ${id}`);
      } else {
        const newExercise = new Exersice({
          '_id': id,
          description,
          duration,
          date: new Date()
        });
        newExercise.save((err, data) => {
          if (err || !data) {
            res.send('There was an error saving this exercise');
          } else {
            const { description, duration, date, _id } = data;
            res.json({
              username: personData.username,
              description,
              duration,
              date: date.toDateString(),
              _id: personData.id
            })
          }
        })
      }
    });
    // const newExercise = new Exersice({ _id, description, duration, date });
    // await newExercise.save();
    // res.json({
    //   '_id': newExercise.userId,
    //   'description': newExercise.description,
    //   'duration': newExercise.duration,
    //   'date': newExercise.date
    // });

  } catch (err) {
    console.log(err);
  }
})



const mongoDbUri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPAS}@freecodecampexercisetra.p4prxcl.mongodb.net/exerciseTracker`;
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
