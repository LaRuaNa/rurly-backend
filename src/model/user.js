const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    required: true,
    default: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  links: {
    type: Array,
  },
  hashedPassword: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
});

UserSchema.virtual('password').set(function (password) {
  const salt = bcrypt.genSaltSync(10);
  this.hashedPassword = bcrypt.hashSync(password, salt);
});

UserSchema.methods = {
  comparePassword(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.hashedPassword, (error, isMatch) => {
      if (error) {
        cb(error);
        return;
      }
      cb(null, isMatch);
    });
  },
};

module.exports = mongoose.model('User', UserSchema);
