"use strict";

const mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for a Comment.
 */
const commentSchema = new mongoose.Schema({
  // The text of the comment.
  comment: String,
  // The date and time when the comment was created.
  date_time: { type: Date, default: Date.now },
  // The ID of the user who created the comment.
  user_id: mongoose.Schema.Types.ObjectId,
});

const likeSchema = new mongoose.Schema({

  // The ID of the user who created the comment.
  user_id: mongoose.Schema.Types.ObjectId,
  // The date and time when the comment was created.
  date_time: { type: Date, default: Date.now },
  
 });

/**
 * Define the Mongoose Schema for a Photo.
 */
const photoSchema = new mongoose.Schema({
  // Name of the file containing the photo (in the project6/images directory).
  file_name: String,
  // The date and time when the photo was added to the database.
  date_time: { type: Date, default: Date.now },
  // The ID of the user who created the photo.
  user_id: mongoose.Schema.Types.ObjectId,
  // Array of comment objects representing the comments made on this photo.
  comments: [commentSchema],
  // Array of like objects representing the likes made on this photo.
  likes: [likeSchema],
  // The number of likes on this photo.
  num_likes: { type: Number, default: 0 },
});

/**
 * Create a Mongoose Model for a Photo using the photoSchema.
 */
const Photo = mongoose.model("Photo", photoSchema);

/**
 * Make this available to our application.
 */
module.exports = Photo;