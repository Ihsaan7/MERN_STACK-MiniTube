import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is Required in DB"],
      trim: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Emial is required in DB"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required in DB"],
    },
    fullName: {
      type: String,
      required: [true, "FullName is required in DB"],
      trim: true,
    },
    avatar: {
      type: String,
      required: [true, "Avatar is required in DB"],
    },
    coverImage: {
      type: String,
      required: [true, "Cover Image is required in DB"],
    },
    watchHistory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// HASHING PASS BEFORE SAVING IN DB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// COMPARING HASH PASS IN DB
userSchema.methods.isPassCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// GENERATING ACCESS TOKEN ( JWT )
userSchema.methods.genAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_SECRET_EXPIRY,
    }
  );
};

// GENERATING REFRESH TOKEN ( JWT )
userSchema.methods.genRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_REFRESH_TOKEN,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRY,
    }
  );
};

const User = mongoose.model("User", userSchema);
export default User;
