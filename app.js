// Selectors and Variables  
const colorDivs = document.querySelectorAll('.color');
const currentHexes = document.querySelectorAll('.color h2');
const sliders = document.querySelectorAll('input[type="range"]');
const copyContainer = document.querySelector('.copy-container');
const adjustBtns = document.querySelectorAll('.adjust');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const lockBtns = document.querySelectorAll('.lock');
const generateBtn = document.querySelector('.generate');
let initialColors;

// Event Listeners
generateBtn.addEventListener('click', randomColors);

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
});

adjustBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        openAdjustmentPanel(index);
    });
});

closeAdjustments.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        closeAdjustmentPanel(index);
    });
});

lockBtns.forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
        lockLayer(e, index);
    });
});

// Functions
function randomColors() {
    initialColors = [];

    colorDivs.forEach(div => {
        const hextText = div.children[0];
        const randomColor = chroma.random();

        // add randomColor to an array
        if (div.classList.contains('locked')) {
            initialColors.push(hextText.innerText);
            return;
        } else {
            initialColors.push(randomColor.hex());
        }

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

    // check contrast of icons
    adjustBtns.forEach((btn, index) => {
        checkTextContrast(initialColors[index], btn);
        checkTextContrast(initialColors[index], lockBtns[index]);
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

function hslControls(e) {
    const index =
        e.target.getAttribute('data-hue') ||
        e.target.getAttribute('data-sat') ||
        e.target.getAttribute('data-bright');

    // select current sliders
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

function openAdjustmentPanel(index) {
    const currentSlider = colorDivs[index].querySelector('.sliders');
    currentSlider.classList.add('active');
}

function closeAdjustmentPanel(index) {
    const currentSlider = colorDivs[index].querySelector('.sliders');
    currentSlider.classList.remove('active');
}

function lockLayer(e, index) {
    const lockSVG = e.target.children[0];
    const activeDiv = colorDivs[index];
    activeDiv.classList.toggle('locked');

    if (lockSVG.classList.contains('fa-lock-open')) {
        e.target.innerHTML = `<i class="fas fa-lock"></i>`;
    } else {
        e.target.innerHTML = `<i class="fas fa-lock-open"></i>`;
    }
}

// ============= LIBRARY and LOCAL STORAGE STUFF ============= //

// Selectors and Variables
const saveContainer = document.querySelector('.save-container'); // palette-save popup container
const closeSaveBtn = saveContainer.querySelector('.close-save');
const saveInput = saveContainer.querySelector('.save-name');
const submitSave = saveContainer.querySelector('.submit-save');
const libraryContainer = document.querySelector('.library-container');
const libraryCloseBtn = document.querySelector('.close-library');
const libraryBtn = document.querySelector('.library'); // library btn in the panel section
const saveBtn = document.querySelector('.save'); // save btn in the panel section
let savedPalettes = [];

// Event Listeners
saveBtn.addEventListener('click', () => {
    openClose(saveContainer, 'open')
});

closeSaveBtn.addEventListener('click', () => {
    openClose(saveContainer, 'close')
});

submitSave.addEventListener('click', savePalette);

libraryBtn.addEventListener('click', () => {
    openClose(libraryContainer, 'open')
});

libraryCloseBtn.addEventListener('click', () => {
    openClose(libraryContainer, 'close');
});


// Functions
function openClose(container, action) {
    const popup = container.children[0];

    if (action === 'open') {
        container.classList.add('active');
        popup.classList.add('active');
    }

    if (action === 'close') {
        container.classList.remove('active');
        popup.classList.remove('active');
    }
}

function savePalette(e) {
    openClose(saveContainer, 'close');

    // palette details
    const name = saveInput.value;

    const colors = [];
    currentHexes.forEach(hex => {
        colors.push(hex.innerText);
    });

    let paletteNumber;
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    if (paletteObjects) {
        paletteNumber = paletteObjects.length;
    } else {
        paletteNumber = savedPalettes.length;
    }

    // generating object
    const paletteObj = {
        name,
        colors,
        number: paletteNumber
    }
    savedPalettes.push(paletteObj);

    // saving to local storage
    savetoLocal(paletteObj);
    saveInput.value = '';

    // generate library UI
    libraryUI(paletteObj);
}

function savetoLocal(paletteObj) {
    let localPalettes;
    if (localStorage.getItem('palettes') === null) {
        localPalettes = [];
    } else {
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    }

    localPalettes.push(paletteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalettes));
}

function libraryUI(paletteObj) {
    const palette = document.createElement('div');
    palette.classList.add('custom-palette');
    const title = document.createElement('h4');
    title.innerText = paletteObj.name;
    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    paletteObj.colors.forEach(color => {
        console.log(color);
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = color;
        preview.appendChild(smallDiv);
    });
    const paletteBtn = document.createElement('button');
    paletteBtn.classList.add('palette-btn');
    paletteBtn.classList.add(paletteObj.number);
    paletteBtn.innerText = 'Select';


    // // add event to paletteBtn
    // paletteBtn.addEventListener('click', e => {

    // });

    // append to library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);
}

randomColors();