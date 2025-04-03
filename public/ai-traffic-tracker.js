/**
 * Enhanced AI Traffic Analytics Tracker
 * 
 * This script detects when visitors come from AI platforms and records the visit.
 * It includes enhanced detection for AI crawlers with improved accuracy.
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

  // Improved function to detect AI sources with better accuracy
  function detectAISource() {
    const referrer = document.referrer;
    let source = 'unknown';
    let type = 'referral';
    
    // AI assistant platforms (direct visit referrers)
    if (referrer.match(/chat\.openai\.com|chatgpt\.com/i)) {
      source = 'chatgpt';
      type = 'referral';
    } else if (referrer.match(/perplexity\.ai/i)) {
      source = 'perplexity';
      type = 'referral';
    } else if (referrer.match(/claude\.ai|anthropic\.com\/claude/i)) {
      source = 'claude';
      type = 'referral';
    } else if (referrer.match(/copilot\.microsoft\.com|bing\.com\/chat|copilot\.bing\.com/i)) {
      source = 'copilot';
      type = 'referral';
    } else if (referrer.match(/bard\.google\.com|gemini\.google\.com|ai\.google/i)) {
      source = 'gemini';
      type = 'referral';
    } 
    // Google AI-specific features (more accurate detection)
    else if (referrer.match(/google\.com/) && (
      referrer.match(/\?udm=ai/) || 
      referrer.match(/&udm=ai/) || 
      referrer.match(/google\.com\/search.*ai_overview/) ||
      referrer.match(/google\.com\/search.*ai_answers/) ||
      referrer.match(/\?ai=true/) ||
      referrer.match(/&ai=true/)
    )) {
      source = 'google-ai';
      type = 'referral';
    }
    // AI crawler detection via user agent patterns
    else if (detectAICrawlerFromUserAgent()) {
      const crawlerInfo = detectAICrawlerFromUserAgent();
      source = crawlerInfo.source;
      type = 'crawler';
    }
    // No referrer but has browsing context
    else if (!referrer && window.parent !== window) {
      source = 'embedded-ai';
      type = 'referral';
    }
    // No referrer with direct navigation - potential unattributed AI
    else if (!referrer) {
      source = 'direct';
      type = 'direct';
    }
    // Standard referral traffic (not AI-related)
    else {
      source = 'standard-referral';
      type = 'standard';
    }
    
    return { source, type };
  }

  // Helper function to identify AI crawlers from User-Agent string
  function detectAICrawlerFromUserAgent() {
    const ua = navigator.userAgent.toLowerCase();
    
    if (ua.includes('googlebot')) {
      return { source: 'google-crawler', type: 'crawler' };
    } else if (ua.includes('chatgpt-user')) {
      return { source: 'chatgpt-crawler', type: 'crawler' };
    } else if (ua.includes('anthropic') || ua.includes('claude-crawler')) {
      return { source: 'claude-crawler', type: 'crawler' };
    } else if (ua.includes('perplexitybot') || ua.includes('perplexity-bot')) {
      return { source: 'perplexity-crawler', type: 'crawler' };
    } else if (ua.includes('bingbot') && ua.includes('chat')) {
      return { source: 'copilot-crawler', type: 'crawler' };
    } else if (ua.includes('gptbot')) {
      return { source: 'gptbot', type: 'crawler' };
    }
    
    return null;
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
      timestamp: new Date().toISOString(),
      // Additional information for debugging
      referrerOrigin: document.referrer ? new URL(document.referrer).origin : null,
      referrerParams: document.referrer ? new URL(document.referrer).search : null
    };
  }
  
  // Send tracking data to server
  function sendTrackingData() {
    const data = collectTrackingData();
    
    // Don't track non-AI traffic if it's clearly standard referral
    if (data.type === 'standard' && !data.referrer.match(/ai|chat|gpt|claude|gemini|copilot|perplexity/i)) {
      // Optional - enable this line if you want to exclude all standard traffic
      // return;
    }
    
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