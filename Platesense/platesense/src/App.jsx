import { useEffect, useState } from "react";
import "C:/Local/WebDevelopment/Platesense/style.css";
import GarminCard from "./components/GarminCard";

const API_URL = "http://localhost:5000/api";

function formatLocalDate(dateInput) {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("platesenseToken") || ""
  );

  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [weeklyEntries, setWeeklyEntries] = useState([]);

  const [selectedDate, setSelectedDate] = useState(() =>
    formatLocalDate(new Date())
  );

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
      console.log("Backend response from /users/me:", data);

      const currentUser = data.user || data;

      setUser(currentUser);
      setDailyTarget(currentUser.dailyCalorieTarget || 2000);

      await Promise.all([loadEntries(), loadWeeklyEntries()]);
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
      console.log("Backend response from /calories/today:", data);

      const meals = Array.isArray(data)
        ? data
        : Array.isArray(data?.entries)
        ? data.entries
        : [];

      setEntries(meals);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  // --------------------------------------------------
  // Load weekly calorie entries (past 7 days)
  // --------------------------------------------------

  async function loadWeeklyEntries() {
    try {
      const data = await apiRequest("/calories/week");
      console.log("Backend response from /calories/week:", data);

      const meals = Array.isArray(data)
        ? data
        : Array.isArray(data?.entries)
        ? data.entries
        : [];

      setWeeklyEntries(meals);
    } catch (err) {
      console.error("Error loading weekly entries:", err);
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
    setWeeklyEntries([]);

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

      const newEntry = data.entry || data;

      setEntries((currentEntries) => [
        ...currentEntries,
        newEntry,
      ]);

      setWeeklyEntries((currentWeekly) => [
        ...currentWeekly,
        newEntry,
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

      setWeeklyEntries((currentWeekly) =>
        currentWeekly.filter((entry) => entry._id !== id)
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
      await loadWeeklyEntries();
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
    (total, entry) => total + Number(entry.calories || 0),
    0
  );

  const totalWeeklyCalories = weeklyEntries.reduce(
    (total, entry) => total + Number(entry.calories || 0),
    0
  );

  const remainingCalories = dailyTarget - totalCalories;

  const weeklyTarget = dailyTarget * 7;

  const progress =
    dailyTarget > 0
      ? Math.min((totalCalories / dailyTarget) * 100, 100)
      : 0;

  // Generate list of the past 7 days for the dropdown
  const pastDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = formatLocalDate(d);

    const formattedDate = d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    let label = formattedDate;
    if (i === 0) label = `Today (${formattedDate})`;
    else if (i === 1) label = `Yesterday (${formattedDate})`;

    return { dateKey, label };
  });

  // Calculate total calories grouped by date (YYYY-MM-DD)
  const dailyCaloriesMap = weeklyEntries.reduce((map, entry) => {
    const key = formatLocalDate(entry.date || entry.createdAt || new Date());
    map[key] = (map[key] || 0) + Number(entry.calories || 0);
    return map;
  }, {});

  const selectedDayCalories = dailyCaloriesMap[selectedDate] || 0;
  const selectedDayRemaining = dailyTarget - selectedDayCalories;

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

            <p>Calories Consumed (Today)</p>

            <h2>{totalCalories}</h2>

          </div>

          <div className="remaining">

            <p>Calories Remaining (Today)</p>

            <h2>
              {remainingCalories > 0
                ? remainingCalories
                : 0}
            </h2>

          </div>

          <div className="calorie-weekly">

            <p>Weekly Calories (7 Days)</p>

            <h2 style={{ color: "#7c3aed" }}>{totalWeeklyCalories}</h2>

          </div>

          <div className="weekly-target">

            <p>Weekly Target (7 Days)</p>

            <h2 style={{ color: "#0284c7" }}>{weeklyTarget}</h2>

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

        {/* Garmin Watch Integration */}
        <GarminCard
          apiRequest={apiRequest}
          totalCaloriesEaten={totalCalories}
        />

        {/* View Calories by Day Dropdown */}

        <div className="target-card">

          <label>
            View Calories by Day
          </label>

          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "16px",
              backgroundColor: "#fff",
              cursor: "pointer",
            }}
          >
            {pastDays.map((day) => {
              const caloriesForDay = dailyCaloriesMap[day.dateKey] || 0;
              return (
                <option key={day.dateKey} value={day.dateKey}>
                  {day.label} — {caloriesForDay} cal
                </option>
              );
            })}
          </select>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 14px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              marginTop: "4px",
            }}
          >
            <div>
              <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                {pastDays.find((d) => d.dateKey === selectedDate)?.label || selectedDate}
              </p>
              <h3 style={{ margin: "4px 0 0", color: "#2563eb", fontSize: "22px" }}>
                {selectedDayCalories}{" "}
                <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "normal" }}>
                  / {dailyTarget} cal target
                </span>
              </h3>
            </div>

            <span
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "bold",
                backgroundColor:
                  selectedDayCalories > dailyTarget ? "#fee2e2" : "#dcfce7",
                color:
                  selectedDayCalories > dailyTarget ? "#dc2626" : "#16a34a",
              }}
            >
              {selectedDayCalories > dailyTarget
                ? `+${selectedDayCalories - dailyTarget} over`
                : `${selectedDayRemaining} left`}
            </span>
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
