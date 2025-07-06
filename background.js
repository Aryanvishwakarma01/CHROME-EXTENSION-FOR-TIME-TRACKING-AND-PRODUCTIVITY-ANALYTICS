// Background service worker for tracking time
class ProductivityTracker {
  constructor() {
    this.currentTab = null;
    this.startTime = null;
    this.isTracking = false;
    this.init();
  }

  init() {
    // Listen for tab changes
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.handleTabChange(activeInfo.tabId);
    });

    // Listen for tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.active) {
        this.handleTabChange(tabId);
      }
    });

    // Listen for window focus changes
    chrome.windows.onFocusChanged.addListener((windowId) => {
      if (windowId === chrome.windows.WINDOW_ID_NONE) {
        this.stopTracking();
      } else {
        chrome.tabs.query({active: true, windowId: windowId}, (tabs) => {
          if (tabs[0]) {
            this.handleTabChange(tabs[0].id);
          }
        });
      }
    });
  }

  async handleTabChange(tabId) {
    // Stop tracking current tab
    if (this.isTracking) {
      await this.stopTracking();
    }

    // Start tracking new tab
    chrome.tabs.get(tabId, (tab) => {
      if (tab && tab.url && !tab.url.startsWith('chrome://')) {
        this.startTracking(tab.url);
      }
    });
  }

  startTracking(url) {
    this.currentTab = this.getDomain(url);
    this.startTime = Date.now();
    this.isTracking = true;
  }

  async stopTracking() {
    if (!this.isTracking || !this.currentTab || !this.startTime) return;

    const timeSpent = Date.now() - this.startTime;
    await this.saveTimeData(this.currentTab, timeSpent);
    
    this.isTracking = false;
    this.currentTab = null;
    this.startTime = null;
  }

  getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  async saveTimeData(domain, timeSpent) {
    const today = new Date().toISOString().split('T')[0];
    const result = await chrome.storage.local.get(['timeData']);
    const timeData = result.timeData || {};
    
    if (!timeData[today]) {
      timeData[today] = {};
    }
    
    if (!timeData[today][domain]) {
      timeData[today][domain] = 0;
    }
    
    timeData[today][domain] += timeSpent;
    
    await chrome.storage.local.set({timeData});
  }
}

// Website categorization
const PRODUCTIVE_SITES = [
  'github.com', 'stackoverflow.com', 'developer.mozilla.org', 'codepen.io',
  'replit.com', 'codesandbox.io', 'notion.so', 'docs.google.com',
  'medium.com', 'dev.to', 'leetcode.com', 'hackerrank.com'
];

const UNPRODUCTIVE_SITES = [
  'facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com',
  'youtube.com', 'netflix.com', 'reddit.com', 'twitch.tv',
  'snapchat.com', 'pinterest.com'
];

// Initialize tracker
const tracker = new ProductivityTracker();

// Message handler for popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProductivityData') {
    getProductivityData().then(sendResponse);
    return true;
  }
});

async function getProductivityData() {
  const result = await chrome.storage.local.get(['timeData']);
  const timeData = result.timeData || {};
  
  const today = new Date().toISOString().split('T')[0];
  const todayData = timeData[today] || {};
  
  let productive = 0;
  let unproductive = 0;
  let neutral = 0;
  
  for (const [domain, time] of Object.entries(todayData)) {
    if (PRODUCTIVE_SITES.some(site => domain.includes(site))) {
      productive += time;
    } else if (UNPRODUCTIVE_SITES.some(site => domain.includes(site))) {
      unproductive += time;
    } else {
      neutral += time;
    }
  }
  
  return {
    productive,
    unproductive,
    neutral,
    total: productive + unproductive + neutral,
    sites: todayData
  };
}