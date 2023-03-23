const { Schema, model } = require('mongoose');

const exerciseSchema = new Schema({
    'username': String,
    'date': Date,
    'duration': { type: Number, required: true },
    'description': { type: String, required: true }
});

module.exports = model('exerciseInfo', exerciseSchema); 