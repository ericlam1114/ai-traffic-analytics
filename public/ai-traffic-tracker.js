/**
 * Enhanced AI Traffic Analytics Tracker
 * 
 * This script detects when visitors come from AI platforms and records the visit.
 * It includes enhanced detection for AI crawlers and more detailed analytics.
 * 
 * Usage:
 * <script src="https://parsleyanalytics.com/ai-traffic-tracker.js" 
 *         data-website-id="your-website-id"></script>
 */

// ai-traffic-tracker.js
(function() {
  // Configuration
  const TRACKING_ENDPOINT = 'https://www.parsleyanalytics.com/api/track';
  
  // Get the website ID from the script tag
  const scriptTag = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();
  
  const websiteId = scriptTag.getAttribute('data-website-id');
  
  if (!websiteId) {
    console.error('AI Traffic Analytics: No website ID provided');
    return;
  }
  
  // Function to detect AI sources
  // Function to detect AI sources
function detectAISource() {
  const referrer = document.referrer;
  let source = 'unknown';
  let type = 'direct';
  
  // Check referrer for known AI platforms
  if (referrer.includes('chat.openai.com') || referrer.includes('chatgpt')) {
    source = 'chatgpt';
    type = 'referral';
  } else if (referrer.includes('perplexity.ai')) {
    source = 'perplexity';
    type = 'referral';
  } else if (referrer.includes('claude.ai')) {
    source = 'claude';
    type = 'referral';
  } else if (referrer.includes('copilot') || referrer.includes('bing.com/chat')) {
    source = 'copilot';
    type = 'referral';
  } else if (referrer.includes('bard.google.com') || referrer.includes('gemini')) {
    source = 'gemini';
    type = 'referral';
  } else if (referrer.includes('google.com') && (referrer.includes('AI+Mode') || referrer.includes('udm=') || referrer.includes('ai'))) {
    source = 'google-ai-mode';
    type = 'referral';
  } else if (referrer && referrer !== '') {
    // Check for potential AI user agents or other indicators
    source = 'unknown-ai';
    type = 'referral';
  }
  
  return { source, type };
}
  
  // Gather tracking data
  function collectTrackingData() {
    const { source, type } = detectAISource();
    
    return {
      websiteId: websiteId,
      source: source,
      type: type,
      pagePath: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timestamp: new Date().toISOString()
    };
  }
  
  // Send tracking data to server
  function sendTrackingData() {
    const data = collectTrackingData();
    
    fetch(TRACKING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      mode: 'cors' // Enable CORS for cross-domain requests
    })
    .catch(error => {
      console.error('Error sending tracking data:', error);
    });
  }
  
  // Initialize tracking
  function init() {
    // Send initial page view
    sendTrackingData();
    
    // Track navigation events for SPAs
    if (typeof history.pushState === 'function') {
      const originalPushState = history.pushState;
      history.pushState = function() {
        originalPushState.apply(this, arguments);
        sendTrackingData();
      };
      
      window.addEventListener('popstate', sendTrackingData);
    }
  }
  
  // Start tracking when the page is fully loaded
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();