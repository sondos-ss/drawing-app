const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// Set canvas size to fill parent
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Current settings
let currentTool = "brush";
let currentColor = "#000000";
let brushSize = 5;
let fillColor = false;

// For undo/redo
let history = [];
let historyStep = -1;

// Drawing state
let isDrawing = false;
let startX, startY;

function saveState() {
    history = history.slice(0, historyStep + 1); // remove redo history
    history.push(canvas.toDataURL());
    historyStep++;
}

// Load canvas from image
function loadState(index) {
    const img = new Image();
    img.src = history[index];
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}


// Tools
const tools = document.querySelectorAll(".tool");
tools.forEach(tool => {
    tool.addEventListener("click", () => {
        tools.forEach(t => t.classList.remove("active"));
        tool.classList.add("active");
        currentTool = tool.id;
    });
});

// Brush size slider
const sizeSlider = document.getElementById("size-slider");
sizeSlider.addEventListener("input", e => brushSize = e.target.value);

// Fill color toggle
const fillCheckbox = document.getElementById("fill-color");
fillCheckbox.addEventListener("change", e => fillColor = e.target.checked);

const colorWheel = document.getElementById("color-wheel");
const selectedColor = document.getElementById("selected-color");

// Use native color input as wheel
const colorInput = document.createElement("input");
colorInput.type = "color";
colorInput.value = "#000000";
colorInput.style.display = "none"; // hidden
colorWheel.appendChild(colorInput);

colorWheel.addEventListener("click", () => colorInput.click());
colorInput.addEventListener("input", e => {
    currentColor = e.target.value;
    selectedColor.style.background = currentColor;
});

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    startX = e.offsetX;
    startY = e.offsetY;

    if (currentTool === "brush" || currentTool === "pencil" || currentTool === "eraser") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.strokeStyle = currentTool === "eraser" ? "#ffffff" : currentColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        saveState();
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    const x = e.offsetX;
    const y = e.offsetY;

    if (currentTool === "brush" || currentTool === "pencil" || currentTool === "eraser") {
        ctx.lineTo(x, y);
        ctx.stroke();
    }
});

canvas.addEventListener("mouseup", (e) => {
    if (!isDrawing) return;
    isDrawing = false;

    const x = e.offsetX;
    const y = e.offsetY;

    if (["rectangle","circle","triangle","square","line"].includes(currentTool)) {
        ctx.beginPath();
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor;
        ctx.lineWidth = brushSize;

        const w = x - startX;
        const h = y - startY;

        switch(currentTool){
            case "rectangle":
                fillColor ? ctx.fillRect(startX, startY, w, h) : ctx.strokeRect(startX, startY, w, h);
                break;
            case "square":
                const size = Math.max(Math.abs(w), Math.abs(h));
                fillColor ? ctx.fillRect(startX, startY, size, size) : ctx.strokeRect(startX, startY, size, size);
                break;
            case "circle":
                const radius = Math.sqrt(w*w + h*h);
                ctx.beginPath();
                ctx.arc(startX, startY, radius, 0, Math.PI*2);
                fillColor ? ctx.fill() : ctx.stroke();
                break;
            case "line":
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(x, y);
                ctx.stroke();
                break;
            case "triangle":
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(x, y);
                ctx.lineTo(startX*2 - x, y);
                ctx.closePath();
                fillColor ? ctx.fill() : ctx.stroke();
                break;
        }
        saveState();
    }
});

// Undo
document.querySelector(".undo-btn").addEventListener("click", () => {
    if(historyStep > 0){
        historyStep--;
        loadState(historyStep);
    }
});

// Redo
document.querySelector(".redo-btn").addEventListener("click", () => {
    if(historyStep < history.length-1){
        historyStep++;
        loadState(historyStep);
    }
});

// Clear
document.querySelector(".clear-canvas").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
});

// Save
document.querySelector(".save-img").addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL();
    link.click();
});
