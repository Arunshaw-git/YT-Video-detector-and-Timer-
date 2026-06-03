// YT Study Timer - Extension Logic

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const resetButton = document.getElementById("reset");
const display = document.getElementById("stopwatch");

let time = 0;
let intervalId = null;
let running = false;

let currentVideoUrl = "";
let currentVideoTitle = "";

// Initialize popup state
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get({ sessions: [], stopwatchState: null }, (result) => {
        renderSessions(result.sessions);

        const state = result.stopwatchState;
        if (state) {
            currentVideoUrl = state.videoUrl || "";
            currentVideoTitle = state.videoTitle || "";

            if (state.running && state.startTime) {
                running = true;
                const sysStartTime = state.startTime;
                // Calculate elapsed seconds from conceptual start time
                time = Math.max(0, Math.floor((Date.now() - sysStartTime) / 1000));
                updateDisplay();
                runTimerInterval(sysStartTime);
            } else {
                running = false;
                time = state.pausedTime || 0;
                updateDisplay();
            }
        } else {
            running = false;
            time = 0;
            updateDisplay();
        }
        updateUIState();
    });
});

startButton.addEventListener('click', startStopwatch);
stopButton.addEventListener('click', stopStopwatch);
resetButton.addEventListener('click', resetStopwatch);

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}h:${mins.toString().padStart(2, '0')}m:${secs.toString().padStart(2, '0')}s`;
}

function formatFriendlyDuration(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0) parts.push(`${mins}m`);
    if (secs > 0 && hrs === 0) parts.push(`${secs}s`);
    return parts.join(" ");
}

function formatFriendlyDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const timeStr = date.toLocaleTimeString([], timeOptions);

    if (isToday) {
        return `Today, ${timeStr}`;
    }

    const dateOptions = { month: 'short', day: 'numeric' };
    const dateStr = date.toLocaleDateString([], dateOptions);
    return `${dateStr}, ${timeStr}`;
}

function getCleanTitle(title) {
    if (!title) return "Study Session";
    if (title.endsWith(" - YouTube")) {
        return title.slice(0, -10);
    }
    return title;
}

function getActiveTab(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
            callback(tabs[0]);
        } else {
            callback(null);
        }
    });
}

function runTimerInterval(sysStartTime) {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
        time = Math.max(0, Math.floor((Date.now() - sysStartTime) / 1000));
        updateDisplay();
    }, 1000);
}

function updateDisplay() {
    display.textContent = formatTime(time);
}

function startStopwatch() {
    if (!running) {
        running = true;
        // Conceptual start time in system milliseconds
        const sysStartTime = Date.now() - (time * 1000);

        getActiveTab((tab) => {
            let videoUrl = "";
            let videoTitle = "Study Session";
            if (tab) {
                videoUrl = tab.url || "";
                videoTitle = getCleanTitle(tab.title);
            }

            // Only set if not already set during a paused session
            if (!currentVideoUrl) {
                currentVideoUrl = videoUrl;
                currentVideoTitle = videoTitle;
            }

            chrome.storage.local.set({
                stopwatchState: {
                    running: true,
                    startTime: sysStartTime,
                    pausedTime: 0,
                    videoUrl: currentVideoUrl,
                    videoTitle: currentVideoTitle
                }
            });

            runTimerInterval(sysStartTime);
            updateUIState();
        });
    }
}

function stopStopwatch() {
    if (running) {
        clearInterval(intervalId);
        running = false;

        chrome.storage.local.set({
            stopwatchState: {
                running: false,
                startTime: 0,
                pausedTime: time,
                videoUrl: currentVideoUrl,
                videoTitle: currentVideoTitle
            }
        });
        updateUIState();
    }
}

function resetStopwatch() {
    if (intervalId) clearInterval(intervalId);

    const savedTime = time;
    const savedUrl = currentVideoUrl;
    const savedTitle = currentVideoTitle;

    running = false;
    time = 0;
    currentVideoUrl = "";
    currentVideoTitle = "";
    updateDisplay();

    chrome.storage.local.set({
        stopwatchState: {
            running: false,
            startTime: 0,
            pausedTime: 0,
            videoUrl: "",
            videoTitle: ""
        }
    });

    if (savedTime > 0) {
        saveSession(savedTime, savedUrl, savedTitle);
    }
    updateUIState();
}

function saveSession(duration, url, title) {
    chrome.storage.local.get({ sessions: [] }, (result) => {
        const sessions = result.sessions;
        const newSession = {
            id: Date.now(),
            duration: duration,
            url: url,
            title: title || "Study Session",
            timestamp: Date.now()
        };
        sessions.unshift(newSession); // Add to the top of the list

        chrome.storage.local.set({ sessions: sessions }, () => {
            renderSessions(sessions);
        });
    });
}

function deleteSession(id) {
    chrome.storage.local.get({ sessions: [] }, (result) => {
        const sessions = result.sessions.filter(s => s.id !== id);
        chrome.storage.local.set({ sessions: sessions }, () => {
            renderSessions(sessions);
        });
    });
}

function updateUIState() {
    const badge = document.getElementById("status-badge");
    const card = document.querySelector(".timer-card");

    if (badge) {
        if (running) {
            badge.textContent = "Running";
            badge.className = "status-badge running";
            if (card) card.classList.add("running");
        } else if (time > 0) {
            badge.textContent = "Paused";
            badge.className = "status-badge paused";
            if (card) card.classList.remove("running");
        } else {
            badge.textContent = "Idle";
            badge.className = "status-badge idle";
            if (card) card.classList.remove("running");
        }
    }

    // Update Start Button text (START vs RESUME)
    if (startButton) {
        if (time > 0 && !running) {
            startButton.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                RESUME
            `;
        } else {
            startButton.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                START
            `;
        }
    }
}

function renderSessions(sessions) {
    const list = document.getElementById('myList');
    const emptyState = document.getElementById('empty-state');
    const countBadge = document.getElementById('session-count');

    list.innerHTML = "";

    if (countBadge) {
        countBadge.textContent = sessions.length;
    }

    if (sessions.length === 0) {
        if (emptyState) emptyState.style.display = 'flex';
        list.style.display = 'none';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    list.style.display = 'flex';

    sessions.forEach((session) => {
        const item = document.createElement('li');
        item.className = 'session-item';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'session-content';

        const titleH3 = document.createElement('h3');
        titleH3.className = 'session-title';
        titleH3.textContent = session.title || 'Study Session';
        titleH3.title = session.title || 'Study Session';

        const metaDiv = document.createElement('div');
        metaDiv.className = 'session-meta';

        const durationSpan = document.createElement('span');
        durationSpan.className = 'session-duration';
        durationSpan.textContent = `⏱️ ${formatFriendlyDuration(session.duration)}`;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'session-date';
        dateSpan.textContent = `📅 ${formatFriendlyDate(session.timestamp)}`;

        metaDiv.appendChild(durationSpan);
        metaDiv.appendChild(dateSpan);
        contentDiv.appendChild(titleH3);
        contentDiv.appendChild(metaDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'session-actions';

        // Show redirect link button if URL is valid
        if (session.url && (session.url.startsWith('http://') || session.url.startsWith('https://'))) {
            const redirectBtn = document.createElement('button');
            redirectBtn.className = 'action-btn btn-redirect';
            redirectBtn.title = 'Open video in new tab';
            redirectBtn.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
            `;
            redirectBtn.addEventListener('click', () => {
                chrome.tabs.create({ url: session.url });
            });
            actionsDiv.appendChild(redirectBtn);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn btn-delete';
        deleteBtn.title = 'Delete session record';
        deleteBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
        `;
        deleteBtn.addEventListener('click', () => {
            deleteSession(session.id);
        });
        actionsDiv.appendChild(deleteBtn);

        item.appendChild(contentDiv);
        item.appendChild(actionsDiv);
        list.appendChild(item);
    });
}
