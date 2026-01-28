import React from "react"

function ReadTemp() {
  // Logic for the alert
  const handlePress = () => {
    alert("The current temperature is 22°C!");
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h2>Click the button to read the temperature</h2>
      
      {/* The button that triggers the alert */}
      <button onClick={handlePress}>
        Read Temp
      </button>
    </div>
  );
}

export default ReadTemp;