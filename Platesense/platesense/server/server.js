const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const dotenv = require("dotenv");


dotenv.config();


const app = express();


// ============================
// MIDDLEWARE
// ============================

app.use(cors());

app.use(express.json());


// ============================
// ROUTES
// ============================

const authRoutes =
  require("./routes/auth");

const calorieRoutes =
  require("./routes/calories");

const userRoutes =
  require("./routes/users");


app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/calories",
  calorieRoutes
);

app.use(
  "/api/users",
  userRoutes
);


// ============================
// DATABASE
// ============================

mongoose

  .connect(process.env.MONGO_URI)

  .then(() => {

    console.log(
      "Connected to MongoDB"
    );


    app.listen(
      process.env.PORT || 5000,
      () => {

        console.log(
          `Server running on port ${
            process.env.PORT || 5000
          }`
        );

      }
    );

  })

  .catch((error) => {

    console.error(
      "MongoDB connection error:",
      error
    );

  });