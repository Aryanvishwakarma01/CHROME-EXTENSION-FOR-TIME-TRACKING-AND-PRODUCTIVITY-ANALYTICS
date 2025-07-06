# CHROME-EXTENSION-FOR-TIME-TRACKING-AND-PRODUCTIVITY-ANALYTICS

*COMPANY*: CODTECH IT SOLUTIONS
*NAME*: ARYAN VISHWAKARMA
*INTERN ID*: CT04DF1289
*DOMAIN*: FULL STACK WEB DEVELOPMENT
*DURATION*: 4 WEEKS
*MENTOR*: NEELA SANTOSH
## Chrome extension that tracks time spent on websites and provides comprehensive productivity analytics. Here's what the extension includes:

Key Features:

Real-time Time Tracking: Automatically monitors active tab usage
Smart Activity Detection: Only tracks when user is actively engaged
Website Categorization: Classifies sites as productive, unproductive, or neutral
Daily Overview: Quick popup with today's productivity metrics
Detailed Dashboard: Comprehensive analytics with charts and breakdowns
Weekly Reports: Track productivity trends over 7 days
Export Functionality: Download weekly reports as CSV files

Extension Components:

manifest.json - Extension configuration and permissions
background.js - Service worker handling time tracking and data storage
popup.html - Quick view popup interface with today's stats
dashboard.html - Full analytics dashboard with charts and reports
content.js - Content script for activity detection
README.md - Complete installation and usage instructions

How It Works:

Tracks time spent on each website domain
Categorizes websites automatically (GitHub = productive, Facebook = unproductive)
Only counts active time (stops when user is inactive for 30+ seconds)
Stores all data locally in Chrome storage
Provides productivity score based on productive vs unproductive time

##OUTPUT 

