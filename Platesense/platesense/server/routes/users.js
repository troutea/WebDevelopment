const express = require("express");

const User = require("../models/User");

const authenticateToken =
  require("../middleware/auth");

const router = express.Router();


// ============================
// GET CURRENT USER
// ============================

router.get(
  "/me",
  authenticateToken,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user.id
        ).select("-password");


      if (!user) {

        return res.status(404).json({

          message: "User not found"

        });

      }


      res.json(user);

    }

    catch (error) {

      res.status(500).json({

        message: error.message

      });

    }

  }
);


// ============================
// UPDATE CALORIE TARGET
// ============================

router.put(
  "/target",
  authenticateToken,
  async (req, res) => {

    try {

      const {
        dailyCalorieTarget
      } = req.body;


      if (
        !dailyCalorieTarget ||
        dailyCalorieTarget <= 0
      ) {

        return res.status(400).json({

          message:
            "Please provide a valid calorie target"

        });

      }


      const user =
        await User.findByIdAndUpdate(

          req.user.id,

          {
            dailyCalorieTarget
          },

          {
            new: true
          }

        ).select("-password");


      res.json(user);

    }

    catch (error) {

      res.status(500).json({

        message: error.message

      });

    }

  }
);


module.exports = router;