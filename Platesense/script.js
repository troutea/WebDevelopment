let calories = [];


const calorieInput = document.getElementById("calorieInput");

const addButton = document.getElementById("addButton");

const removeButton = document.getElementById("removeButton");

const resetButton = document.getElementById("resetButton");

const totalCalories = document.getElementById("totalCalories");

const calorieList = document.getElementById("calorieList");


function updateDisplay() {

    // Calculate total calories
    const total = calories.reduce((sum, calorie) => {

        return sum + calorie;

    }, 0);


    // Update total on screen
    totalCalories.textContent = total;


    // Clear current list
    calorieList.innerHTML = "";


    // Show empty message
    if (calories.length === 0) {

        calorieList.innerHTML = `
            <li class="empty-message">
                No calories added yet.
            </li>
        `;

        return;
    }


    // Display calorie entries
    calories.forEach((calorie, index) => {

        const listItem = document.createElement("li");

        listItem.textContent =
            `Entry ${index + 1}: ${calorie} calories`;

        calorieList.appendChild(listItem);

    });

}


function addCalories() {

    const calorieValue = Number(calorieInput.value);


    // Validate input
    if (!calorieValue || calorieValue <= 0) {

        alert("Please enter a valid number of calories.");

        return;
    }


    // Add calories to array
    calories.push(calorieValue);


    // Clear input
    calorieInput.value = "";


    // Update screen
    updateDisplay();

}


function removeLastEntry() {

    if (calories.length === 0) {

        alert("There are no calorie entries to remove.");

        return;
    }


    calories.pop();

    updateDisplay();

}


function resetCalories() {

    const confirmReset = confirm(
        "Are you sure you want to reset today's calories?"
    );


    if (confirmReset) {

        calories = [];

        updateDisplay();

    }

}


// Event listeners

addButton.addEventListener("click", addCalories);


removeButton.addEventListener(
    "click",
    removeLastEntry
);


resetButton.addEventListener(
    "click",
    resetCalories
);


// Allow Enter key

calorieInput.addEventListener(
    "keypress",
    function (event) {

        if (event.key === "Enter") {

            addCalories();

        }

    }
);