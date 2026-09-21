const express = require("express");

const CalorieEntry =
  require("../models/CalorieEntry");

const authenticateToken =
  require("../middleware/auth");

const router = express.Router();


// ============================
// GET TODAY'S ENTRIES
// ============================

router.get(
  "/today",
  authenticateToken,
  async (req, res) => {

    try {

      const startOfDay =
        new Date();

      startOfDay.setHours(
        0, 0, 0, 0
      );


      const endOfDay =
        new Date();

      endOfDay.setHours(
        23, 59, 59, 999
      );


      const entries =
        await CalorieEntry.find({

          user:
            req.user.id,

          date: {

            $gte: startOfDay,

            $lte: endOfDay

          }

        }).sort({

          createdAt: -1

        });


      res.json(entries);

    }

    catch (error) {

      res.status(500).json({

        message: error.message

      });

    }

  }
);


// ============================
// ADD CALORIE ENTRY
// ============================

router.post(
  "/",
  authenticateToken,
  async (req, res) => {

    try {

      const {
        food,
        meal,
        calories
      } = req.body;


      if (
        !food ||
        !meal ||
        !calories
      ) {

        return res.status(400).json({

          message:
            "Food, meal and calories are required"

        });

      }


      const entry =
        await CalorieEntry.create({

          user:
            req.user.id,

          food,

          meal,

          calories

        });


      res.status(201).json(entry);

    }

    catch (error) {

      res.status(500).json({

        message: error.message

      });

    }

  }
);


// ============================
// DELETE ENTRY
// ============================

router.delete(
  "/:id",
  authenticateToken,
  async (req, res) => {

    try {

      const entry =
        await CalorieEntry.findOneAndDelete({

          _id:
            req.params.id,

          user:
            req.user.id

        });


      if (!entry) {

        return res.status(404).json({

          message:
            "Entry not found"

        });

      }


      res.json({

        message:
          "Entry deleted successfully"

      });

    }

    catch (error) {

      res.status(500).json({

        message: error.message

      });

    }

  }
);


// ============================
// RESET TODAY
// ============================

router.delete(
  "/today/reset",
  authenticateToken,
  async (req, res) => {

    try {

      const startOfDay =
        new Date();

      startOfDay.setHours(
        0, 0, 0, 0
      );


      const endOfDay =
        new Date();

      endOfDay.setHours(
        23, 59, 59, 999
      );


      await CalorieEntry.deleteMany({

        user:
          req.user.id,

        date: {

          $gte: startOfDay,

          $lte: endOfDay

        }

      });


      res.json({

        message:
          "Today's entries deleted"

      });

    }

    catch (error) {

      res.status(500).json({

        message: error.message

      });

    }

  }
);


module.exports = router;