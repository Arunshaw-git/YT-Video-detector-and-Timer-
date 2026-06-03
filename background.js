console.log("background.js loaded");

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   console.log(`Tab updated: ${tabId}`, changeInfo, tab);

//   if (changeInfo.status === 'complete' && tab.url.includes('youtube.com/watch')) {
//     console.log('YouTube video detected, injecting content script...');

//   }
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showNotification") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Educational Video Detected",
      message: "An educational video is playing. Start your stopwatch!",
    });
  
  }

  // Return true to indicate that the response will be sent asynchronously
  return true;
});

// Open the extension popup when the user clicks the notification
chrome.notifications.onClicked.addListener(() => {
  chrome.windows.getCurrent({ populate: true }, (window) => {
    chrome.windows.update(window.id, { focused: true }, () => {
      if (chrome.action && typeof chrome.action.openPopup === 'function') {
        chrome.action.openPopup().catch((err) => {
          console.error("Error opening popup:", err);
        });
      } else {
        console.log("chrome.action.openPopup is not supported in this Chrome version.");
      }
    });
  });
});

