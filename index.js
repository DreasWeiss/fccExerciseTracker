require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});



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
