// Selectors and Variables  
const colorDivs = document.querySelectorAll('.color');
const currentHexes = document.querySelectorAll('.color h2');
const sliders = document.querySelectorAll('input[type="range"]');
const copyContainer = document.querySelector('.copy-container');
let initialColors = [];

// Event Listeners
sliders.forEach(slider => {
    slider.addEventListener('input', hslControls);
});

colorDivs.forEach((div, index) => {
    div.addEventListener('change', () => {
        updateTextUI(index);
    });
});

currentHexes.forEach(hex => {
    hex.addEventListener('click', () => {
        copytoClipboard(hex);
    });
});

copyContainer.addEventListener('transitionend', () => {
    const copyPopup = copyContainer.children[0];
    copyPopup.classList.remove('active');
    copyContainer.classList.remove('active');
})

// Functions
function randomColors() {
    initialColors = [];
    colorDivs.forEach(div => {
        const hextText = div.children[0];
        const randomColor = chroma.random();

        // add random color to an array
        initialColors.push(randomColor.hex());

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

    // reset input values
    resetInputs();
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

function hslControls(e) {
    const index =
        e.target.getAttribute('data-hue') ||
        e.target.getAttribute('data-sat') ||
        e.target.getAttribute('data-bright');

    // select current slider
    const currentSlider = e.target.parentElement.querySelectorAll('.sliders input');
    const hue = currentSlider[0];
    const brightness = currentSlider[1];
    const saturation = currentSlider[2];

    // updating background color
    const bgColor = initialColors[index];
    let color = chroma(bgColor)
        .set('hsl.h', hue.value)
        .set('hsl.s', saturation.value)
        .set('hsl.l', brightness.value);

    colorDivs[index].style.backgroundColor = color;

    // colorize inputs/sliders
    colorizeSliders(color, hue, saturation, brightness);
}

function updateTextUI(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const text = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');

    // check contrast of the text and icons
    checkTextContrast(color, text);
    for (icon of icons) {
        checkTextContrast(color, icon);
    }
}

function resetInputs() {
    const sliders = document.querySelectorAll('.sliders input');
    sliders.forEach(slider => {
        if (slider.name === 'hue') {
            const hueColor = initialColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }

        if (slider.name === 'saturation') {
            const satColor = initialColors[slider.getAttribute('data-sat')];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue * 100) / 100;
        }

        if (slider.name === 'brightness') {
            const brightColor = initialColors[slider.getAttribute('data-bright')];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue * 100) / 100;
        }
    });
}

function copytoClipboard(hex) {
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    // popup animation
    const copyPopup = copyContainer.children[0];
    copyContainer.classList.add('active');
    copyPopup.classList.add('active');
}

randomColors();