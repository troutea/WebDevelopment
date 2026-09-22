import { useEffect, useState } from "react";
import "C:/Local/WebDevelopment/Platesense/style.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("platesenseToken") || ""
  );

  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);

  const [page, setPage] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");
  const [meal, setMeal] = useState("Breakfast");

  const [dailyTarget, setDailyTarget] = useState(2000);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Load user when token exists
  // --------------------------------------------------

  useEffect(() => {
    if (token) {
      localStorage.setItem("platesenseToken", token);
      loadUser();
    }
  }, [token]);

  // --------------------------------------------------
  // API helper
  // --------------------------------------------------

  async function apiRequest(url, options = {}) {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...(options.headers || {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  }

  // --------------------------------------------------
  // Load logged-in user
  // --------------------------------------------------

  async function loadUser() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/users/me");

      setUser(data.user);
      setDailyTarget(data.user.dailyCalorieTarget || 2000);

      await loadEntries();
    } catch (err) {
      console.error(err);

      localStorage.removeItem("platesenseToken");
      setToken("");
      setUser(null);
      setError("Your session has expired. Please log in again.");
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // Load today's calorie entries
  // --------------------------------------------------

  async function loadEntries() {
    try {
      const data = await apiRequest("/calories/today");

      setEntries(data.entries || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  // --------------------------------------------------
  // Register
  // --------------------------------------------------

  async function register(e) {
    e.preventDefault();

    setError("");

    if (!name || !email || !password) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const data = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const result = await data.json();

      if (!data.ok) {
        throw new Error(result.message || "Registration failed.");
      }

      setToken(result.token);
      setUser(result.user);

      setName("");
      setEmail("");
      setPassword("");

      setPage("dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // Login
  // --------------------------------------------------

  async function login(e) {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      setToken(data.token);
      setUser(data.user);

      setEmail("");
      setPassword("");

      setPage("dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  function logout() {
    localStorage.removeItem("platesenseToken");

    setToken("");
    setUser(null);
    setEntries([]);

    setEmail("");
    setPassword("");
    setPage("login");
  }

  // --------------------------------------------------
  // Add calorie entry
  // --------------------------------------------------

  async function addEntry() {
    const calorieAmount = Number(calories);

    if (!food.trim()) {
      setError("Please enter a food name.");
      return;
    }

    if (!calorieAmount || calorieAmount <= 0) {
      setError("Please enter a valid calorie amount.");
      return;
    }

    try {
      setError("");

      const data = await apiRequest("/calories", {
        method: "POST",
        body: JSON.stringify({
          food: food.trim(),
          meal,
          calories: calorieAmount,
        }),
      });

      setEntries((currentEntries) => [
        ...currentEntries,
        data.entry,
      ]);

      setFood("");
      setCalories("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  // --------------------------------------------------
  // Delete calorie entry
  // --------------------------------------------------

  async function deleteEntry(id) {
    try {
      setError("");

      await apiRequest(`/calories/${id}`, {
        method: "DELETE",
      });

      setEntries((currentEntries) =>
        currentEntries.filter((entry) => entry._id !== id)
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  // --------------------------------------------------
  // Reset today's calories
  // --------------------------------------------------

  async function resetDay() {
    const confirmed = window.confirm(
      "Are you sure you want to reset today's calories?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiRequest("/calories/today/reset", {
        method: "DELETE",
      });

      setEntries([]);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  // --------------------------------------------------
  // Update daily target
  // --------------------------------------------------

  async function updateTarget(value) {
    const target = Number(value);

    if (!target || target <= 0) {
      return;
    }

    setDailyTarget(target);

    try {
      await apiRequest("/users/target", {
        method: "PUT",
        body: JSON.stringify({
          dailyCalorieTarget: target,
        }),
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  // --------------------------------------------------
  // Calculations
  // --------------------------------------------------

  const totalCalories = entries.reduce(
    (total, entry) => total + Number(entry.calories),
    0
  );

  const remainingCalories = dailyTarget - totalCalories;

  const progress =
    dailyTarget > 0
      ? Math.min((totalCalories / dailyTarget) * 100, 100)
      : 0;

  // --------------------------------------------------
  // Login / Register screen
  // --------------------------------------------------

  if (!token || !user) {
    return (
      <div className="app">
        <div className="container">

          <header>
            <h1>🍽️ Platesense</h1>

            <p>
              Track your daily calorie intake
            </p>
          </header>

          <div className="auth-card">

            <div className="auth-tabs">

              <button
                className={page === "login" ? "active" : ""}
                onClick={() => {
                  setPage("login");
                  setError("");
                }}
              >
                Login
              </button>

              <button
                className={page === "register" ? "active" : ""}
                onClick={() => {
                  setPage("register");
                  setError("");
                }}
              >
                Register
              </button>

            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {page === "login" ? (
              <form onSubmit={login}>

                <h2>Welcome back</h2>

                <label>Email</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />

                <label>Password</label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

                <button
                  className="add-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>

              </form>
            ) : (
              <form onSubmit={register}>

                <h2>Create your account</h2>

                <label>Name</label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />

                <label>Email</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />

                <label>Password</label>

                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

                <button
                  className="add-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Creating account..."
                    : "Create Account"}
                </button>

              </form>
            )}

          </div>

        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Dashboard
  // --------------------------------------------------

  return (
    <div className="app">

      <div className="container">

        <header>

          <div>
            <h1>🍽️ Platesense</h1>

            <p>
              Welcome, {user.name}
            </p>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </header>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Daily Target */}

        <div className="target-card">

          <label>
            Daily Calorie Target
          </label>

          <input
            type="number"
            value={dailyTarget}
            onChange={(e) =>
              updateTarget(e.target.value)
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
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

        {/* Add Calories */}

        <div className="add-card">

          <h3>Add Calories</h3>

          <input
            type="text"
            placeholder="Food name"
            value={food}
            onChange={(e) =>
              setFood(e.target.value)
            }
          />

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
                  key={entry._id}
                >

                  <div>

                    <strong>
                      {entry.food}
                    </strong>

                    <p>
                      {entry.meal} —{" "}
                      {entry.calories} calories
                    </p>

                  </div>

                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteEntry(entry._id)
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