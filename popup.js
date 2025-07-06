// Popup JavaScript for ProductivityTracker Extension

// Format time from milliseconds to readable format
function formatTime(ms) {
  const minutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}

// Calculate productivity score
function calculateProductivityScore(productive, unproductive, neutral) {
  const total = productive + unproductive + neutral;
  if (total === 0) return 0;
  return Math.round((productive / total) * 100);
}

// Load and display productivity data
async function loadProductivityData() {
  try {
    const response = await chrome.runtime.sendMessage({action: 'getProductivityData'});
    
    document.getElementById('productive-time').textContent = formatTime(response.productive);
    document.getElementById('unproductive-time').textContent = formatTime(response.unproductive);
    document.getElementById('neutral-time').textContent = formatTime(response.neutral);
    
    const score = calculateProductivityScore(response.productive, response.unproductive, response.neutral);
    document.getElementById('productivity-score').textContent = `${score}%`;
    
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
  } catch (error) {
    console.error('Error loading productivity data:', error);
    document.getElementById('loading').textContent = 'Error loading data';
  }
}

// Open dashboard
function openDashboard() {
  chrome.tabs.create({url: chrome.runtime.getURL('dashboard.html')});
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Load productivity data
  loadProductivityData();
  
  // Set up event listeners
  document.getElementById('dashboard-btn').addEventListener('click', openDashboard);
});