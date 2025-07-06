// Content script for time tracking
// This script runs on every webpage to track active time

let isActive = true;
let lastActivityTime = Date.now();
let activityTimer;

// Track user activity
function trackActivity() {
  lastActivityTime = Date.now();
  if (!isActive) {
    isActive = true;
    // Send message to background script that user is active
    chrome.runtime.sendMessage({
      action: 'userActive',
      url: window.location.href
    });
  }
}

// Check for inactivity
function checkInactivity() {
  const currentTime = Date.now();
  const timeSinceLastActivity = currentTime - lastActivityTime;
  
  // If inactive for more than 30 seconds, consider user away
  if (timeSinceLastActivity > 30000 && isActive) {
    isActive = false;
    chrome.runtime.sendMessage({
      action: 'userInactive',
      url: window.location.href
    });
  }
}

// Activity event listeners
const activityEvents = [
  'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
];

activityEvents.forEach(event => {
  document.addEventListener(event, trackActivity, { passive: true });
});

// Check for inactivity every 10 seconds
setInterval(checkInactivity, 10000);

// Listen for visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    isActive = false;
    chrome.runtime.sendMessage({
      action: 'userInactive',
      url: window.location.href
    });
  } else {
    trackActivity();
  }
});

// Initial activity tracking
trackActivity();