import React from "react";
import ReactDOM from "react-dom";

const name = "Anthony";
const currentDate = new Date();
const year = currentDate.getFullYear();

ReactDOM.render(
  <div>
    <h1>Temperature Sensor with MQTT</h1>
        <h2>Reading the temperature from a remote location</h2>

        <p>The Webpage is designed to read the temperature from a remote BMP280 Temperature Sensor
            using MQTT protocol
        </p>
    <p>Created by {name}</p>
    <p>Copyright {year}</p>
  </div>,
  document.getElementById("root")
);

// If you're running this locally in VS Code use the commands:
// npm install
// to install the node modules and
// npm run dev
// to launch your react project in your browser
