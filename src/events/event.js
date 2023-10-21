const { Schema, model } = require('mongoose');

const eventSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

module.exports = model('Event', eventSchema);
