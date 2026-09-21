const mongoose = require("mongoose");

const calorieEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    food: {
      type: String,
      required: true,
      trim: true
    },

    meal: {
      type: String,
      required: true,

      enum: [
        "Breakfast",
        "Lunch",
        "Dinner",
        "Snacks"
      ]
    },

    calories: {
      type: Number,
      required: true,
      min: 1
    },

    date: {
      type: Date,
      default: Date.now
    }
  },

  {
    timestamps: true
  }
);

module.exports =
  mongoose.model(
    "CalorieEntry",
    calorieEntrySchema
  );