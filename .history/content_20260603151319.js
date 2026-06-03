console.log("content.js loaded");
let notified = false;

function getVideoTitle() {
 const el =
    document.querySelector("#title h1 yt-formatted-string") ||
    document.querySelector('h1.style-scope.ytd-video-primary-info-renderer');
  return el ? el.innerText.toLowerCase().trim() : "";
}

function isEducationalVideo() {

  const title = getVideoTitle();
  const keywords = ["course", "study", "tutorial", "lesson", "how to", "guide"];

  console.log("Video title:", title);

  return keywords.some((keyword) => title.includes(keyword.toLowerCase()));
}

function checkVideoStatus() {
  const video = document.querySelector("video");
  const isEducational = isEducationalVideo();
  console.log("Is educational video:", isEducational);

  console.log("notified:", notified);
  if (video && isEducational && !notified) {
    chrome.runtime.sendMessage({ action: "showNotification" });
    notified = true;
  }
  if(!isEducational){
    notified = false;
  }

}

setInterval(checkVideoStatus, 3000);  