const mongoose = require('mongoose');

const memberSchema = mongoose.Schema({
  handle: String,
  tgId: Number,
  date: Date,
  lastCommand: String
});

mongoose.model('members', memberSchema);

mongoose.connect('mongodb://127.0.0.1:27017/JoystreamLeaderboardBot', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
