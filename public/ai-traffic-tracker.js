/**
 * AI Traffic Analytics Tracker
 * 
 * This script detects when visitors come from AI platforms and records the visit.
 * It should be included in the <head> of your HTML documents.
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
    const aiReferrers = [
      'chat.openai.com',       // ChatGPT
      'perplexity.ai',         // Perplexity
      'bing.com/chat',         // Microsoft Copilot
      'bard.google.com',       // Google Bard
      'claude.ai',             // Anthropic Claude
      'gemini.google.com'      // Google Gemini
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
    const isAIReferrer = aiReferrers.some(domain => referrerHost.includes(domain));
    
    // Also check for specific UTM parameters that might indicate AI source
    const utmSource = getUrlParameter('utm_source');
    const isAIUtm = utmSource && (
      utmSource.includes('chatgpt') || 
      utmSource.includes('perplexity') || 
      utmSource.includes('copilot') || 
      utmSource.includes('claude') ||
      utmSource.includes('bard') ||
      utmSource.includes('gemini')
    );
  
    // Determine the AI source
    let aiSource = '';
    if (isAIReferrer) {
      if (referrerHost.includes('chat.openai.com')) aiSource = 'chatgpt';
      else if (referrerHost.includes('perplexity.ai')) aiSource = 'perplexity';
      else if (referrerHost.includes('bing.com/chat')) aiSource = 'copilot';
      else if (referrerHost.includes('claude.ai')) aiSource = 'claude';
      else if (referrerHost.includes('bard.google.com')) aiSource = 'bard';
      else if (referrerHost.includes('gemini.google.com')) aiSource = 'gemini';
      else aiSource = 'unknown-ai';
    } else if (isAIUtm) {
      aiSource = utmSource;
    }
  
    // If this visit is from an AI platform, send the data
    if (aiSource) {
      const pagePath = window.location.pathname;
      const userAgent = navigator.userAgent;
      
      fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteId,
          source: aiSource,
          pagePath,
          referrer: document.referrer,
          userAgent
        }),
        // Send as keepalive to ensure the request completes even if page navigates away
        keepalive: true
      }).catch(error => {
        console.error('AI Traffic Analytics: Error sending tracking data', error);
      });
    }
  })();