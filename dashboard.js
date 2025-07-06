// Dashboard JavaScript for ProductivityTracker Extension

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

function formatTime(ms) {
  const minutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}

function categorizeWebsite(domain) {
  if (PRODUCTIVE_SITES.some(site => domain.includes(site))) {
    return 'productive';
  } else if (UNPRODUCTIVE_SITES.some(site => domain.includes(site))) {
    return 'unproductive';
  }
  return 'neutral';
}

function calculateProductivityScore(productive, unproductive, neutral) {
  const total = productive + unproductive + neutral;
  if (total === 0) return 0;
  return Math.round((productive / total) * 100);
}

function drawPieChart(canvas, data) {
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 100;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const total = data.productive + data.unproductive + data.neutral;
  if (total === 0) {
    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#666';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No data available', centerX, centerY);
    return;
  }
  
  let currentAngle = -Math.PI / 2;
  const colors = ['#4CAF50', '#F44336', '#FF9800'];
  const values = [data.productive, data.unproductive, data.neutral];
  const labels = ['Productive', 'Unproductive', 'Other'];
  
  values.forEach((value, index) => {
    if (value > 0) {
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      ctx.fillStyle = colors[index];
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fill();
      
      currentAngle += sliceAngle;
    }
  });
  
  // Add legend
  let legendY = 20;
  values.forEach((value, index) => {
    if (value > 0) {
      ctx.fillStyle = colors[index];
      ctx.fillRect(20, legendY, 15, 15);
      
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${labels[index]}: ${formatTime(value)}`, 45, legendY + 12);
      
      legendY += 25;
    }
  });
}

async function loadDashboardData() {
  try {
    const result = await chrome.storage.local.get(['timeData']);
    const timeData = result.timeData || {};
    
    const today = new Date().toISOString().split('T')[0];
    const todayData = timeData[today] || {};
    
    let productive = 0;
    let unproductive = 0;
    let neutral = 0;
    
    // Calculate totals
    for (const [domain, time] of Object.entries(todayData)) {
      const category = categorizeWebsite(domain);
      if (category === 'productive') {
        productive += time;
      } else if (category === 'unproductive') {
        unproductive += time;
      } else {
        neutral += time;
      }
    }
    
    // Update today's overview
    document.getElementById('today-productive').textContent = formatTime(productive);
    document.getElementById('today-unproductive').textContent = formatTime(unproductive);
    document.getElementById('today-neutral').textContent = formatTime(neutral);
    
    const score = calculateProductivityScore(productive, unproductive, neutral);
    document.getElementById('today-score').textContent = `${score}%`;
    document.getElementById('productivity-progress').style.width = `${score}%`;
    
    // Draw pie chart
    const canvas = document.getElementById('productivityChart');
    drawPieChart(canvas, { productive, unproductive, neutral });
    
    // Populate site list
    const siteList = document.getElementById('site-list');
    siteList.innerHTML = '';
    
    const sortedSites = Object.entries(todayData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    sortedSites.forEach(([domain, time]) => {
      const category = categorizeWebsite(domain);
      const siteItem = document.createElement('div');
      siteItem.className = 'site-item';
      siteItem.innerHTML = `
        <div>
          <span class="site-name">${domain}</span>
          <span class="site-category category-${category}">${category}</span>
        </div>
        <span class="site-time">${formatTime(time)}</span>
      `;
      siteList.appendChild(siteItem);
    });
    
    // Load weekly data
    loadWeeklyData(timeData);
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

function loadWeeklyData(timeData) {
  const weekGrid = document.getElementById('week-grid');
  weekGrid.innerHTML = '';
  
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayData = timeData[dateStr] || {};
    
    let productive = 0;
    let unproductive = 0;
    let neutral = 0;
    
    for (const [domain, time] of Object.entries(dayData)) {
      const category = categorizeWebsite(domain);
      if (category === 'productive') {
        productive += time;
      } else if (category === 'unproductive') {
        unproductive += time;
      } else {
        neutral += time;
      }
    }
    
    const total = productive + unproductive + neutral;
    const score = calculateProductivityScore(productive, unproductive, neutral);
    
    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';
    dayCard.innerHTML = `
      <div class="day-name">${dayNames[date.getDay()]}</div>
      <div class="day-score" style="color: ${score >= 70 ? '#4CAF50' : score >= 40 ? '#FF9800' : '#F44336'}">${score}%</div>
      <div class="day-time">${formatTime(total)}</div>
    `;
    weekGrid.appendChild(dayCard);
  }
}

function exportWeeklyReport() {
  chrome.storage.local.get(['timeData'], (result) => {
    const timeData = result.timeData || {};
    const today = new Date();
    let reportData = 'Date,Productive Time,Unproductive Time,Other Time,Productivity Score\n';
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = timeData[dateStr] || {};
      
      let productive = 0;
      let unproductive = 0;
      let neutral = 0;
      
      for (const [domain, time] of Object.entries(dayData)) {
        const category = categorizeWebsite(domain);
        if (category === 'productive') {
          productive += time;
        } else if (category === 'unproductive') {
          unproductive += time;
        } else {
          neutral += time;
        }
      }
      
      const score = calculateProductivityScore(productive, unproductive, neutral);
      reportData += `${dateStr},${Math.round(productive/60000)},${Math.round(unproductive/60000)},${Math.round(neutral/60000)},${score}%\n`;
    }
    
    const blob = new Blob([reportData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productivity-report-${today.toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Load dashboard data
  loadDashboardData();
  
  // Set up event listeners
  document.getElementById('export-btn').addEventListener('click', exportWeeklyReport);
});