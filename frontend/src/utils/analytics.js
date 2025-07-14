// Simple analytics utility for tracking user interactions
class Analytics {
  static track(event, data = {}) {
    // In development, just log to console
    if (import.meta.env.DEV) {
      console.log('📊 Analytics:', event, data);
    }
    
    // Store in localStorage for simple tracking
    try {
      const analyticsKey = 'codejudge_analytics';
      const existingData = JSON.parse(localStorage.getItem(analyticsKey) || '[]');
      
      const eventData = {
        event,
        data,
        timestamp: new Date().toISOString(),
        sessionId: this.getSessionId()
      };
      
      existingData.push(eventData);
      
      // Keep only last 100 events to avoid localStorage bloat
      if (existingData.length > 100) {
        existingData.splice(0, existingData.length - 100);
      }
      
      localStorage.setItem(analyticsKey, JSON.stringify(existingData));
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }
  
  static getSessionId() {
    let sessionId = sessionStorage.getItem('codejudge_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('codejudge_session_id', sessionId);
    }
    return sessionId;
  }
  
  static getAnalytics() {
    try {
      return JSON.parse(localStorage.getItem('codejudge_analytics') || '[]');
    } catch {
      return [];
    }
  }
  
  static clearAnalytics() {
    localStorage.removeItem('codejudge_analytics');
  }
}

export default Analytics;
