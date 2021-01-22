// Selectors and Variables  
const colorDivs = document.querySelectorAll('.color');
const currentHexes = document.querySelectorAll('.color h2');
const sliders = document.querySelectorAll('input[type="range"]');
let initialColors = [];

// Event Listeners

// Functions
function randomColors(){
    colorDivs.forEach(div =>{
        const hextText = div.children[0];
        const randomColor = chroma.random();

        // add randomColor to background
        hextText.innerText = randomColor.hex();
        div.style.backgroundColor = randomColor;

        // check contrast of hexTexts
        checkTextContrast(randomColor, hextText);
    });
}

function checkTextContrast(color, text){
    const luminance = chroma(color).luminance();
    if(luminance > 0.5){
        text.style.color = '#000';
    }else{
        text.style.color = '#fff';
    }
}

randomColors();