//select the dom elements

const generateBtn = document.getElementById("generate-btn ");
const paletteContainer = document.getElementById(".palette-container");


//add event listener

generateBtn.addEventListener("click", generatePalette)

function generatePalette() {

    //create an array of five random colors

    const colors = []

    for(let i = 0; i < 5 ; i++) {
        colors.push(generateRandomColor())

    }
    updatePaletteDisplay(colors);
}

function generateRandomColor() {

    const letters = "0123456789ABCDEF";
    let color = "#";

    for ( i =0 ; i < 6; i++) {
       color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


function updatePaletteDisplay(colors) {
    const colorBoxes = document.querySelector(".color-box")
   

    //update all the colors using an arrow function
    colorBoxes.forEach((box,index) => {
        const color = colors[index];

       // search inside the element stored in box and returns
       //  the first descendant element that has the class color. 
       // That element is stored in the constant colorDiv.
        const colorDiv = box.querySelector(".color");
        const hexValue = box.querySelector(".hex-value");
    })
}
//genearate a new palette on refresh
generatePalette();