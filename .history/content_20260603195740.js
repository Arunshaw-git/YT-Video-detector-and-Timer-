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