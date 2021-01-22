// Selectors and Variables  
const colorDivs = document.querySelectorAll('.color');
const currentHexes = document.querySelectorAll('.color h2');
const sliders = document.querySelectorAll('input[type="range"]');
let initialColors = [];

// Event Listeners

// Functions
function randomColors() {
    colorDivs.forEach(div => {
        const hextText = div.children[0];
        const randomColor = chroma.random();

        // add randomColor to background
        hextText.innerText = randomColor.hex();
        div.style.backgroundColor = randomColor;

        // check contrast of hexTexts
        checkTextContrast(randomColor, hextText);

        // initial colorize sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];
        colorizeSliders(color, hue, brightness, saturation);
    });
}

function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    if (luminance > 0.5) {
        text.style.color = '#000';
    } else {
        text.style.color = '#fff';
    }
}

function colorizeSliders(color, hue, saturation, brightness) {
    // scale saturation
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);

    // scale brightness 
    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(['#000', midBright, '#fff']);

    // update input colors
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75), rgb(75,204,75), rgb(75,204,204), rgb(75,75,204), rgb(204,75,204), rgb(204,75,75))`;
}

randomColors();