const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    required: true,
    default: true,
  },
  name: {
    first: {
      type: String,
    },
    last: {
      type: String,
    },
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
    index: {
      unique: true,
    },
    required: true,
  },
  roles: {
    type: Array,
    index: true,
    required: true,
    default: ['authenticated'],
  },
  token: {
    type: String,
  },
});

UserSchema.virtual('password').set((password) => {
  const salt = bcrypt.genSaltSync(10);
  this.hashedPassword = bcrypt.hashSync(password, salt);
});

UserSchema.virtual('fullname')
  .get(() => `${this.name.first} ${this.name.last}`);

UserSchema.virtual('fullname')
  .get(() => this.name.full)
  .set((name) => {
    const split = name.split(' ');
    this.name.first = split[0];
    this.name.last = split[1];
  });

UserSchema.methods = {
  hasRole(role) {
    const roles = this.roles;
    return roles.indexOf('admin') !== -1 || roles.indexOf(role) !== -1;
  },

  isAdmin() {
    const roles = this.roles;
    return roles.indexOf('admin') !== -1;
  },

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

export default mongoose.model('User', UserSchema);
