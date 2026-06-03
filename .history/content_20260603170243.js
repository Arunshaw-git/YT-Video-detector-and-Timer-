console.log("content.js loaded");
let notified = false;
let lastVideoId = null;

function getVideoTitle() {
  const selectors = [
    "#title h1 yt-formatted-string",
    "h1.style-scope.ytd-video-primary-info-renderer",
    "#title h1",
    "ytd-video-primary-info-renderer h1",
    "#container h1",
    "h1.ytd-video-primary-info-renderer",
    ".ytd-video-primary-info-renderer h1"
  ];
  
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText) {
      return el.innerText.toLowerCase().trim();
    }
  }
  return "";
}

function getChannelName() {
  const selectors = [
    "#channel-name a",
    "#owner #channel-name a",
    "ytd-video-owner-renderer a",
    "#text",
    ".ytd-channel-name a",
    "#owner-name a"
  ];
  
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText) {
      return el.innerText.toLowerCase().trim();
    }
  }
  return "";
}

function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

function isEducationalVideo() {
  const title = getVideoTitle();
  const channel = getChannelName();
  const url = window.location.href.toLowerCase();
  
  const educationalKeywords = [
    "course", "study", "tutorial", "lesson", "how to", "guide",
    "learn", "education", "educational", "lecture", "class",
    "training", "workshop", "seminar", "explain", "explained",
    "introduction", "intro", "basics", "fundamentals", "beginner",
    "python", "javascript", "programming", "coding", "development",
    "math", "mathematics", "physics", "chemistry", "biology",
    "history", "science", "engineering", "computer science",
    "algorithm", "data structure", "machine learning", "ai",
    "web development", "app development", "software engineering",
    "calculus", "algebra", "statistics", "probability",
    "grammar", "writing", "english", "language", "vocabulary",
    "exam", "test", "preparation", "gre", "sat", "ielts",
    "certification", "certified", "bootcamp", "masterclass"
  ];
  
  const educationalChannels = [
    "khan academy", "crash course", "ted-ed", "coursera",
    "edx", "mit opencourseware", "stanford online", "harvard online",
    "freecodecamp", "codecademy", "pluralsight", "udemy",
    "skillshare", "linkedin learning", "brilliant", "3blue1brown",
    "kurzgesagt", "veritasium", "minutephysics", "smarter every day",
    "computerphile", "numberphile", "scishow", "asapscience"
  ];
  
  const educationalUrlPatterns = [
    "youtube.com/playlist?list=PL",
    "youtube.com/learning",
    "youtube.com/results?search_query=learn",
    "youtube.com/results?search_query=tutorial",
    "youtube.com/results?search_query=course",
    "youtube.com/results?search_query=how to"
  ];
  
  console.log("Video title:", title);
  console.log("Channel name:", channel);
  
  const titleMatch = educationalKeywords.some(keyword => title.includes(keyword));
  const channelMatch = educationalChannels.some(edChannel => channel.includes(edChannel));
  const urlMatch = educationalUrlPatterns.some(pattern => url.includes(pattern));
  
  return titleMatch || channelMatch || urlMatch;
}

function isVideoPlaying() {
  const video = document.querySelector("video");
  return video && !video.paused && video.currentTime > 0;
}

function checkVideoStatus() {
  const currentVideoId = getVideoId();
  
  if (currentVideoId !== lastVideoId) {
    notified = false;
    lastVideoId = currentVideoId;
    console.log("New video detected:", currentVideoId);
  }
  
  const isPlaying = isVideoPlaying();
  const isEducational = isEducationalVideo();
  
  console.log("Is video playing:", isPlaying);
  console.log("Is educational video:", isEducational);
  console.log("Notified:", notified);
  
  if (isPlaying && isEducational && !notified) {
    chrome.runtime.sendMessage({ action: "showNotification" });
    notified = true;
  }
  
  if (!isEducational) {
    notified = false;
  }
}

function observePageChanges() {
  const observer = new MutationObserver(() => {
    checkVideoStatus();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
  
  console.log("MutationObserver started");
}

checkVideoStatus();
observePageChanges();

setInterval(checkVideoStatus, 5000);
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