import { useEffect, useState } from "react";

import "C:/Local/WebDevelopment/Platesense/style.css";;


const API_URL =
  "http://localhost:5000/api";


function App() {

  const [page, setPage] =
    useState("login");


  const [user, setUser] =
    useState(null);


  const [token, setToken] =
    useState(
      localStorage.getItem(
        "platesenseToken"
      )
    );


  const [entries, setEntries] =
    useState([]);


  const [food, setFood] =
    useState("");


  const [calories, setCalories] =
    useState("");


  const [meal, setMeal] =
    useState("Breakfast");


  const [dailyTarget, setDailyTarget] =
    useState(2000);


  const [email, setEmail] =
    useState("");


  const [password, setPassword] =
    useState("");


  const [name, setName] =
    useState("");


  const [error, setError] =
    useState("");


  const [loading, setLoading] =
    useState(false);


  // ============================
  // AUTHENTICATED REQUEST
  // ============================

  async function authenticatedFetch(
    url,
    options = {}
  ) {

    return fetch(

      `${API_URL}${url}`,

      {
        ...options,

        headers: {

          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,

          ...options.headers

        }

      }

    );

  }


  // ============================
  // CHECK LOGIN
  // ============================

  useEffect(() => {

    if (token) {

      loadUser();

    }

  }, [token]);


  async function loadUser() {

    try {

      const response =
        await authenticatedFetch(
          "/users/me"
        );


      if (!response.ok) {

        logout();

        return;

      }


      const userData =
        await response.json();


      setUser(userData);

      setDailyTarget(
        userData.dailyCalorieTarget
      );


      loadEntries();

    }

    catch (error) {

      console.error(error);

    }

  }


  // ============================
  // LOAD TODAY'S ENTRIES
  // ============================

  async function loadEntries() {

    try {

      const response =
        await authenticatedFetch(
          "/calories/today"
        );


      const data =
        await response.json();


      setEntries(data);

    }

    catch (error) {

      console.error(error);

    }

  }


  // ============================
  // REGISTER
  // ============================

  async function register() {

    setError("");

    setLoading(true);


    try {

      const response =
        await fetch(

          `${API_URL}/auth/register`,

          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body: JSON.stringify({

              name,

              email,

              password

            })

          }

        );


      const data =
        await response.json();


      if (!response.ok) {

        setError(
          data.message
        );

        return;

      }


      localStorage.setItem(
        "platesenseToken",
        data.token
      );


      setToken(data.token);

      setUser(data.user);

    }

    catch (error) {

      setError(
        "Unable to create account"
      );

    }

    finally {

      setLoading(false);

    }

  }


  // ============================
  // LOGIN
  // ============================

  async function login() {

    setError("");

    setLoading(true);


    try {

      const response =
        await fetch(

          `${API_URL}/auth/login`,

          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body: JSON.stringify({

              email,

              password

            })

          }

        );


      const data =
        await response.json();


      if (!response.ok) {

        setError(
          data.message
        );

        return;

      }


      localStorage.setItem(
        "platesenseToken",
        data.token
      );


      setToken(data.token);

      setUser(data.user);

    }

    catch (error) {

      setError(
        "Unable to login"
      );

    }

    finally {

      setLoading(false);

    }

  }


  // ============================
  // LOGOUT
  // ============================

  function logout() {

    localStorage.removeItem(
      "platesenseToken"
    );

    setToken(null);

    setUser(null);

    setEntries([]);

    setEmail("");

    setPassword("");

  }


  // ============================
  // ADD CALORIES
  // ============================

  async function addEntry() {

    if (
      !food ||
      !calories
    ) {

      setError(
        "Please enter a food and calorie amount."
      );

      return;

    }


    try {

      const response =
        await authenticatedFetch(

          "/calories",

          {

            method: "POST",

            body: JSON.stringify({

              food,

              meal,

              calories:
                Number(calories)

            })

          }

        );


      const newEntry =
        await response.json();


      if (!response.ok) {

        setError(
          newEntry.message
        );

        return;

      }


      setEntries([

        newEntry,

        ...entries

      ]);


      setFood("");

      setCalories("");

      setError("");

    }

    catch (error) {

      setError(
        "Unable to add calorie entry"
      );

    }

  }


  // ============================
  // DELETE ENTRY
  // ============================

  async function deleteEntry(id) {

    try {

      await authenticatedFetch(

        `/calories/${id}`,

        {

          method: "DELETE"

        }

      );


      setEntries(

        entries.filter(

          entry =>
            entry._id !== id

        )

      );

    }

    catch (error) {

      console.error(error);

    }

  }


  // ============================
  // RESET TODAY
  // ============================

  async function resetDay() {

    if (

      !window.confirm(

        "Reset today's calories?"

      )

    ) {

      return;

    }


    await authenticatedFetch(

      "/calories/today/reset",

      {

        method: "DELETE"

      }

    );


    setEntries([]);

  }


  // ============================
  // UPDATE TARGET
  // ============================

  async function updateTarget(
    value
  ) {

    const target =
      Number(value);


    setDailyTarget(target);


    if (!target) {

      return;

    }


    await authenticatedFetch(

      "/users/target",

      {

        method: "PUT",

        body: JSON.stringify({

          dailyCalorieTarget:
            target

        })

      }

    );

  }


  // ============================
  // CALCULATIONS
  // ============================

  const totalCalories =
    entries.reduce(

      (total, entry) =>

        total +
        entry.calories,

      0

    );


  const remainingCalories =
    Math.max(

      dailyTarget -
      totalCalories,

      0

    );


  const progress =
    dailyTarget > 0

      ? Math.min(

          (totalCalories /
            dailyTarget) *
            100,

          100

        )

      : 0;


  // ============================
  // LOGIN PAGE
  // ============================

  if (!token) {

    return (

      <div className="app">

        <div className="auth-card">

          <h1>
            🍽️ Platesense
          </h1>

          <p>
            Your personal calorie tracker
          </p>


          <div className="auth-tabs">

            <button
              className={
                page === "login"
                  ? "active"
                  : ""
              }

              onClick={() =>
                setPage("login")
              }
            >
              Login
            </button>


            <button
              className={
                page === "register"
                  ? "active"
                  : ""
              }

              onClick={() =>
                setPage("register")
              }
            >
              Create Account
            </button>

          </div>


          {page === "register" && (

            <input

              type="text"

              placeholder="Your name"

              value={name}

              onChange={e =>
                setName(
                  e.target.value
                )
              }

            />

          )}


          <input

            type="email"

            placeholder="Email address"

            value={email}

            onChange={e =>
              setEmail(
                e.target.value
              )
            }

          />


          <input

            type="password"

            placeholder="Password"

            value={password}

            onChange={e =>
              setPassword(
                e.target.value
              )
            }

          />


          {error && (

            <p className="error">
              {error}
            </p>

          )}


          <button

            className="primary-button"

            onClick={
              page === "login"
                ? login
                : register
            }

            disabled={loading}

          >

            {loading

              ? "Please wait..."

              : page === "login"

                ? "Login"

                : "Create Account"

            }

          </button>

        </div>

      </div>

    );

  }


  // ============================
  // DASHBOARD
  // ============================

  return (

    <div className="app">

      <div className="container">


        <header className="dashboard-header">

          <div>

            <h1>
              🍽️ Platesense
            </h1>

            <p>
              Welcome, {user?.name}
            </p>

          </div>


          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </header>


        {/* TARGET */}

        <div className="target-card">

          <label>
            Daily Calorie Target
          </label>


          <input

            type="number"

            value={dailyTarget}

            onChange={e =>
              updateTarget(
                e.target.value
              )
            }

          />

        </div>


        {/* OVERVIEW */}

        <div className="overview">

          <div>

            <p>
              Consumed
            </p>

            <h2>
              {totalCalories}
            </h2>

          </div>


          <div>

            <p>
              Remaining
            </p>

            <h2>
              {remainingCalories}
            </h2>

          </div>

        </div>


        {/* PROGRESS */}

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
                width:
                  `${progress}%`
              }}

            />

          </div>

        </div>


        {/* ADD FOOD */}

        <div className="add-card">

          <h3>
            Add Food
          </h3>


          <input

            type="text"

            placeholder="Food name"

            value={food}

            onChange={e =>
              setFood(
                e.target.value
              )
            }

          />


          <select

            value={meal}

            onChange={e =>
              setMeal(
                e.target.value
              )
            }

          >

            <option>
              Breakfast
            </option>

            <option>
              Lunch
            </option>

            <option>
              Dinner
            </option>

            <option>
              Snacks
            </option>

          </select>


          <input

            type="number"

            placeholder="Calories"

            value={calories}

            onChange={e =>
              setCalories(
                e.target.value
              )
            }

          />


          <button

            className="primary-button"

            onClick={addEntry}

          >

            Add Food

          </button>


          {error && (

            <p className="error">
              {error}
            </p>

          )}

        </div>


        {/* ENTRIES */}

        <div className="entries-card">

          <h3>
            Today's Food
          </h3>


          {entries.length === 0 ? (

            <p className="empty-message">

              No food added today.

            </p>

          ) : (

            entries.map(entry => (

              <div
                className="entry"
                key={entry._id}
              >

                <div>

                  <strong>
                    {entry.food}
                  </strong>

                  <p>
                    {entry.meal}
                  </p>

                </div>


                <div className="entry-right">

                  <strong>
                    {entry.calories} kcal
                  </strong>


                  <button

                    className="delete-button"

                    onClick={() =>
                      deleteEntry(
                        entry._id
                      )
                    }

                  >
                    ✕
                  </button>

                </div>

              </div>

            ))

          )}

        </div>


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