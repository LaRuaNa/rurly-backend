const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

delete mongoose.models.User;
delete mongoose.modelSchemas.User;

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
  comparePassword(candidatePassword) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(candidatePassword, this.hashedPassword, (error, isMatch) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(isMatch);
      });
    });
  },
};

module.exports = mongoose.model('User', UserSchema);
