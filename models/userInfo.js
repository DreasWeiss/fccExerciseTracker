const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    'username': String
});

module.exports = model('userInfo', userSchema); 