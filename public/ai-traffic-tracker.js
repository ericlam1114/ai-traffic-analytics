/**
 * Enhanced AI Traffic Analytics Tracker
 * 
 * This script detects when visitors come from AI platforms and records the visit.
 * It includes enhanced detection for AI crawlers and more detailed analytics.
 * 
 * Usage:
 * <script src="https://your-app-domain.com/ai-traffic-tracker.js" 
 *         data-website-id="your-website-id"></script>
 */

(function() {
  // Function to get URL parameter
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  // Get website ID from script tag
  const scriptTags = document.getElementsByTagName('script');
  const currentScript = scriptTags[scriptTags.length - 1];
  const websiteId = currentScript.getAttribute('data-website-id');

  if (!websiteId) {
    console.error('AI Traffic Analytics: No website ID provided');
    return;
  }

  // List of known AI referrers to check
  const aiReferrers = {
    'chat.openai.com': 'chatgpt',
    'perplexity.ai': 'perplexity',
    'bing.com/chat': 'copilot',
    'bing.com/search': 'copilot',
    'bard.google.com': 'bard',
    'claude.ai': 'claude',
    'gemini.google.com': 'gemini',
    'poe.com': 'poe',
    'anthropic.com': 'claude',
    'kagi.com': 'kagi',
    'phind.com': 'phind',
    'cohere.com': 'cohere',
    'huggingface.co': 'huggingface'
  };

  // AI bot user agent patterns - for detecting when LLMs crawl your site
  const aiBotPatterns = [
    { pattern: /GPTBot/, name: 'gptbot' },
    { pattern: /CCBot/, name: 'ccbot' },
    { pattern: /anthropic-ai/, name: 'claude-crawler' },
    { pattern: /GoogleOther/, name: 'google-ai' },
    { pattern: /Bytespider/, name: 'bytedance' },
    { pattern: /FacebookBot/, name: 'meta-ai' },
    { pattern: /cohere-ai/, name: 'cohere-crawler' }
  ];

  // Parse the referrer URL
  let referrerHost = '';
  try {
    if (document.referrer) {
      const referrerUrl = new URL(document.referrer);
      referrerHost = referrerUrl.hostname;
    }
  } catch (e) {
    console.error('AI Traffic Analytics: Error parsing referrer', e);
  }

  // Check if referrer is an AI platform
  let aiSource = '';
  
  // Check referrer against our list
  for (const [domain, source] of Object.entries(aiReferrers)) {
    if (referrerHost.includes(domain)) {
      aiSource = source;
      break;
    }
  }
  
  // Also check for specific UTM parameters that might indicate AI source
  if (!aiSource) {
    const utmSource = getUrlParameter('utm_source');
    if (utmSource) {
      for (const [_, source] of Object.entries(aiReferrers)) {
        if (utmSource.toLowerCase().includes(source)) {
          aiSource = source;
          break;
        }
      }
    }
  }
  
  // Check if this might be an AI crawler
  let isCrawler = false;
  let crawlerName = '';
  if (!aiSource && navigator.userAgent) {
    for (const bot of aiBotPatterns) {
      if (bot.pattern.test(navigator.userAgent)) {
        isCrawler = true;
        crawlerName = bot.name;
        break;
      }
    }
  }

  // For each visit, collect some analytics
  const visit = {
    websiteId,
    source: aiSource || (isCrawler ? crawlerName : ''),
    type: isCrawler ? 'crawler' : 'referral',
    pagePath: window.location.pathname,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    // Collect additional metrics
    language: navigator.language,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    timestamp: new Date().toISOString()
  };

  // If this visit is from an AI platform or crawler, send the data
  if (aiSource || isCrawler) {
    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visit),
      keepalive: true
    }).catch(error => {
      console.error('AI Traffic Analytics: Error sending tracking data', error);
    });
  }
  
  // Optional: Track exit links to measure engagement
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.href && link.hostname !== window.location.hostname) {
      if (aiSource || isCrawler) {
        fetch('/api/track-exit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            websiteId,
            source: aiSource || crawlerName,
            exitLink: link.href,
            pagePath: window.location.pathname
          }),
          keepalive: true
        }).catch(() => {});
      }
    }
  });
})();