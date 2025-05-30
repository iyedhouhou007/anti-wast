//User.js

import { Schema as _Schema, model } from "mongoose";
import { genSalt, hash, compare } from "bcryptjs";
const Schema = _Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    select: false,
    required: true,
  },
  phone_number: String,
  photo_url: String,
  location: {
    type: {
      address: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to hash the password before saving the user
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // Only hash the password if it has been modified or is new
    try {
      const salt = await genSalt(10); // Generate a salt
      this.password = await hash(this.password.trim(), salt); // Hash the password
      next(); // Continue with the save process
    } catch (error) {
      next(error); // Pass any errors to the next middleware
    }
  } else {
    next(); // If the password is not modified, proceed to the next middleware
  }
});

// Method to compare the entered password with the hashed password in the database
userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await compare(enteredPassword.trim(), this.password); // Compare the hashed password
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

userSchema.index({ phone_number: 1 }); // Index on phone_number for search
userSchema.index({ createdAt: -1 }); // Index on createdAt for sorting users by join date

// Compound index for email and username
userSchema.index({ email: 1, username: 1 });

const User = model("User", userSchema);

export default User;
