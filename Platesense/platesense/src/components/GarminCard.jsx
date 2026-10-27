import { useState, useEffect } from "react";

const DEFAULT_API_KEY =
  "GCDC_7977af72-2eee-4f6d-8505-e026cc61d251.5844272b-6159-4d1c-bee4-a5468b7f1771.0mCoCM5oLTfoIU17d3jDAaMrdRzWr7zVUBMpadBSopg.2151993359";

export default function GarminCard({ apiRequest, totalCaloriesEaten = 0 }) {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("platesenseGarminApiKey") || DEFAULT_API_KEY
  );

  const [inputKey, setInputKey] = useState(apiKey);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const [garminData, setGarminData] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [garminError, setGarminError] = useState("");
  const [lastSynced, setLastSynced] = useState(null);

  // Auto-sync on initial load if key is present
  useEffect(() => {
    if (apiKey) {
      syncGarmin(apiKey);
    }
  }, []);

  async function syncGarmin(keyToUse = apiKey) {
    if (!keyToUse.trim()) {
      setGarminError("Please enter a Garmin API key.");
      return;
    }

    try {
      setSyncing(true);
      setGarminError("");

      const data = await apiRequest("/garmin/summary", {
        method: "POST",
        body: JSON.stringify({
          apiKey: keyToUse.trim(),
        }),
      });

      setGarminData(data);
      setLastSynced(new Date());
    } catch (err) {
      console.error("Garmin sync error:", err);
      setGarminError(err.message || "Failed to sync with Garmin.");
    } finally {
      setSyncing(false);
    }
  }

  function handleSaveKey(e) {
    e.preventDefault();
    if (!inputKey.trim()) {
      setGarminError("API key cannot be empty.");
      return;
    }
    const cleanKey = inputKey.trim();
    localStorage.setItem("platesenseGarminApiKey", cleanKey);
    setApiKey(cleanKey);
    setShowKeyInput(false);
    setGarminError("");
    syncGarmin(cleanKey);
  }

  // Net calories calculation
  const totalBurned = garminData ? garminData.totalKilocalories : 0;
  const activeBurned = garminData ? garminData.activeKilocalories : 0;
  const netCalories = totalCaloriesEaten - totalBurned;

  return (
    <div
      className="target-card"
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "22px" }}>⌚</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>
              Garmin Watch Sync
            </h3>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
              {lastSynced
                ? `Last synced: ${lastSynced.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Not synced yet"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setShowKeyInput((prev) => !prev)}
            style={{
              padding: "6px 12px",
              fontSize: "13px",
              backgroundColor: "#f1f5f9",
              color: "#334155",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ⚙️ {showKeyInput ? "Close Key" : "API Key"}
          </button>

          <button
            type="button"
            onClick={() => syncGarmin(apiKey)}
            disabled={syncing}
            style={{
              padding: "6px 14px",
              fontSize: "13px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              borderRadius: "6px",
              cursor: syncing ? "not-allowed" : "pointer",
              opacity: syncing ? 0.7 : 1,
            }}
          >
            {syncing ? "Syncing..." : "🔄 Sync"}
          </button>
        </div>
      </div>

      {/* Separate Entry for Garmin API Key */}
      {showKeyInput && (
        <form
          onSubmit={handleSaveKey}
          style={{
            marginTop: "12px",
            padding: "14px",
            backgroundColor: "#f8fafc",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                color: "#334155",
              }}
            >
              Garmin Personal Access API Key
            </label>
            <button
              type="button"
              onClick={() => setShowSecret((prev) => !prev)}
              style={{
                background: "none",
                border: "none",
                color: "#2563eb",
                fontSize: "12px",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {showSecret ? "Hide" : "Show"}
            </button>
          </div>

          <input
            type={showSecret ? "text" : "password"}
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="Paste your GCDC_... key here"
            style={{
              padding: "10px 12px",
              fontSize: "13px",
              fontFamily: "monospace",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              backgroundColor: "#ffffff",
            }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <button
              type="button"
              onClick={() => {
                setInputKey(apiKey);
                setShowKeyInput(false);
              }}
              style={{
                padding: "8px 14px",
                fontSize: "13px",
                backgroundColor: "transparent",
                color: "#64748b",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                backgroundColor: "#16a34a",
                color: "#ffffff",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Save Key
            </button>
          </div>
        </form>
      )}

      {/* Error Message */}
      {garminError && (
        <div
          style={{
            marginTop: "10px",
            padding: "8px 12px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            color: "#dc2626",
            fontSize: "13px",
          }}
        >
          {garminError}
        </div>
      )}

      {/* Stats Display */}
      {garminData && (
        <div style={{ marginTop: "14px" }}>
          {/* Main 3 Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
              gap: "10px",
              textAlign: "center",
            }}
          >
            {/* Total Burned */}
            <div
              style={{
                padding: "10px",
                backgroundColor: "#eff6ff",
                borderRadius: "10px",
                border: "1px solid #bfdbfe",
              }}
            >
              <p style={{ margin: 0, fontSize: "12px", color: "#1e40af" }}>
                Total Burned
              </p>
              <h3 style={{ margin: "4px 0 0", fontSize: "20px", color: "#1d4ed8" }}>
                {garminData.totalKilocalories}
              </h3>
              <span style={{ fontSize: "11px", color: "#64748b" }}>kcal</span>
            </div>

            {/* Active Burned */}
            <div
              style={{
                padding: "10px",
                backgroundColor: "#fff7ed",
                borderRadius: "10px",
                border: "1px solid #fed7aa",
              }}
            >
              <p style={{ margin: 0, fontSize: "12px", color: "#9a3412" }}>
                Active (Exercise)
              </p>
              <h3 style={{ margin: "4px 0 0", fontSize: "20px", color: "#ea580c" }}>
                {garminData.activeKilocalories}
              </h3>
              <span style={{ fontSize: "11px", color: "#64748b" }}>kcal</span>
            </div>

            {/* Resting / BMR */}
            <div
              style={{
                padding: "10px",
                backgroundColor: "#f8fafc",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
              }}
            >
              <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>
                Resting (BMR)
              </p>
              <h3 style={{ margin: "4px 0 0", fontSize: "20px", color: "#334155" }}>
                {garminData.bmrKilocalories}
              </h3>
              <span style={{ fontSize: "11px", color: "#64748b" }}>kcal</span>
            </div>

            {/* Steps */}
            <div
              style={{
                padding: "10px",
                backgroundColor: "#f0fdf4",
                borderRadius: "10px",
                border: "1px solid #bbf7d0",
              }}
            >
              <p style={{ margin: 0, fontSize: "12px", color: "#166534" }}>
                Steps Today
              </p>
              <h3 style={{ margin: "4px 0 0", fontSize: "20px", color: "#15803d" }}>
                {garminData.totalSteps.toLocaleString()}
              </h3>
              <span style={{ fontSize: "11px", color: "#64748b" }}>steps</span>
            </div>
          </div>

          {/* Calorie Balance Summary */}
          <div
            style={{
              marginTop: "12px",
              padding: "10px 14px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "13px",
            }}
          >
            <span style={{ color: "#475569" }}>
              Food Eaten ({totalCaloriesEaten}) vs. Total Burned ({totalBurned}):
            </span>
            <span
              style={{
                fontWeight: "bold",
                color: netCalories > 0 ? "#dc2626" : "#16a34a",
              }}
            >
              {netCalories > 0
                ? `+${netCalories} kcal (Surplus)`
                : `${netCalories} kcal (Deficit)`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
