import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailOtpHash: {
    type: String,
    select: false,
  },
  emailOtpExpires: {
    type: Date,
    select: false,
  },
  resetOtpHash: {
    type: String,
    select: false,
  },
  resetOtpExpires: {
    type: Date,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'authority', 'admin'],
    default: 'user',
  },
  authorityCategory: {
    type: String,
    enum: ['Road', 'Water', 'Electricity'],
    default: null,
  },
  civicPoints: {
    type: Number,
    default: 0,
  },
  rank: {
    type: String,
    default: 'Citizen',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update rank based on points
userSchema.methods.updateRank = function () {
  if (this.civicPoints >= 1000) this.rank = 'Civic Leader';
  else if (this.civicPoints >= 500) this.rank = 'Active Citizen';
  else if (this.civicPoints >= 200) this.rank = 'Contributor';
  else this.rank = 'Citizen';
};

export default mongoose.model('User', userSchema);


