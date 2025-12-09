let start = document.getElementById("start")
let stop = document.getElementById("stop")
let display= document.getElementById("stopwatch")
let time = 0
let intervalId;
let running = false;

let startTime = 0;
let finishTime = 0;

start.addEventListener('click', startStopwatch);  
stop.addEventListener('click', stopStopwatch);
reset.addEventListener("click", resetStopwatch);

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}h:${mins.toString().padStart(2, '0')}m:${secs.toString().padStart(2, '0')}s`;
}

function startStopwatch() {
    if (!running) {
        running = true;
        startTime = Date.now(); // Record the start time
        intervalId = setInterval(() => {
            time++;
            updateDisplay();
        }, 1000);
    }
}
function updateDisplay() {
    display.textContent = formatTime(time);
}

function stopStopwatch() {
    if (running) {
        clearInterval(intervalId);
        running = false;

    }
}

function resetStopwatch(){ 
    if (intervalId) clearInterval(intervalId);
    running = false;
    time= 0;
    updateDisplay()

    finishTime = Date.now;
    let list = document.getElementById('myList');
    const newItem = documentElment("li");
    newItem.textContent = "llolo";
    console.log(newItem);
    list.appendChild(newItem);
}

