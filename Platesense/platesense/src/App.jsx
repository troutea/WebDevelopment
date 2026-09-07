import { useState, useEffect } from "react";
import "C:/Local/WebDevelopment/Platesense/style.css";

function App() {
  const [entries, setEntries] = useState(() => {
    const savedEntries = localStorage.getItem("calorieEntries");
    return savedEntries ? JSON.parse(savedEntries) : [];
  });

  const [calories, setCalories] = useState("");
  const [meal, setMeal] = useState("Breakfast");

  const [dailyTarget, setDailyTarget] = useState(() => {
    return Number(localStorage.getItem("dailyTarget")) || 2000;
  });

  useEffect(() => {
    localStorage.setItem(
      "calorieEntries",
      JSON.stringify(entries)
    );
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("dailyTarget", dailyTarget);
  }, [dailyTarget]);


  const totalCalories = entries.reduce(
    (total, entry) => total + entry.calories,
    0
  );

  const remainingCalories = dailyTarget - totalCalories;

  const progress = Math.min(
    (totalCalories / dailyTarget) * 100,
    100
  );


  function addEntry() {
    const calorieAmount = Number(calories);

    if (!calorieAmount || calorieAmount <= 0) {
      alert("Please enter a valid calorie amount.");
      return;
    }

    const newEntry = {
      id: Date.now(),
      calories: calorieAmount,
      meal: meal
    };

    setEntries([...entries, newEntry]);

    setCalories("");
  }


  function deleteEntry(id) {
    setEntries(
      entries.filter((entry) => entry.id !== id)
    );
  }


  function resetDay() {
    const confirmed = window.confirm(
      "Are you sure you want to reset today's calories?"
    );

    if (confirmed) {
      setEntries([]);
    }
  }


  return (
    <div className="app">

      <div className="container">

        <header>
          <h1>🍽️ Platesense</h1>

          <p>
            Track your daily calorie intake
          </p>
        </header>


        {/* Daily Target */}

        <div className="target-card">

          <label>
            Daily Calorie Target
          </label>

          <input
            type="number"
            value={dailyTarget}
            onChange={(e) =>
              setDailyTarget(Number(e.target.value))
            }
          />

        </div>


        {/* Calories Overview */}

        <div className="overview">

          <div className="calorie-total">

            <p>Calories Consumed</p>

            <h2>{totalCalories}</h2>

          </div>


          <div className="remaining">

            <p>Calories Remaining</p>

            <h2>
              {remainingCalories > 0
                ? remainingCalories
                : 0}
            </h2>

          </div>

        </div>


        {/* Progress Bar */}

        <div className="progress-section">

          <div className="progress-info">

            <span>
              Daily Progress
            </span>

            <span>
              {Math.round(progress)}%
            </span>

          </div>

          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width: `${progress}%`
              }}
            ></div>

          </div>

        </div>


        {/* Add Calories */}

        <div className="add-card">

          <h3>Add Calories</h3>

          <select
            value={meal}
            onChange={(e) =>
              setMeal(e.target.value)
            }
          >

            <option>Breakfast</option>

            <option>Lunch</option>

            <option>Dinner</option>

            <option>Snacks</option>

          </select>


          <input
            type="number"
            placeholder="Enter calories"
            value={calories}
            onChange={(e) =>
              setCalories(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addEntry();
              }
            }}
          />


          <button
            className="add-button"
            onClick={addEntry}
          >
            Add Entry
          </button>

        </div>


        {/* Entries */}

        <div className="entries-card">

          <h3>Today's Meals</h3>


          {entries.length === 0 ? (

            <p className="empty-message">
              No meals added yet.
            </p>

          ) : (

            <div className="entries-list">

              {entries.map((entry) => (

                <div
                  className="entry"
                  key={entry.id}
                >

                  <div>

                    <strong>
                      {entry.meal}
                    </strong>

                    <p>
                      {entry.calories} calories
                    </p>

                  </div>


                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteEntry(entry.id)
                    }
                  >
                    ✕
                  </button>

                </div>

              ))}

            </div>

          )}

        </div>


        {/* Reset */}

        <button
          className="reset-button"
          onClick={resetDay}
        >
          Reset Today's Calories
        </button>

      </div>

    </div>
  );
}

export default App;