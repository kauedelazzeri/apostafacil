import posthog from 'posthog-js';

let isInitialized = false;

// Initialize PostHog
export const initPostHog = () => {
  if (typeof window !== 'undefined' && !isInitialized) {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    
    if (!apiKey || !host) {
      console.error('PostHog API key or host is not defined in environment variables');
      return;
    }

    try {
      posthog.init(apiKey, {
        api_host: host,
        person_profiles: 'identified_only',
        session_recording: {
          recordCrossOriginIframes: false,
          maskAllInputs: false,
          maskInputOptions: {
            password: true
          }
        },
        autocapture: {
          url_allowlist: [window.location.origin]
        },
        capture_pageview: true,
        capture_pageleave: true,
        disable_session_recording: false,
        loaded: (ph) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('PostHog loaded successfully');
            ph.debug(false); // Disable debug to reduce noise
          }
        },
        opt_out_capturing_by_default: false,
        persistence: 'localStorage+cookie'
      });
      
      isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize PostHog:', error);
    }
  }
};

// Export posthog instance for direct use
export const track = (eventName: string, eventProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && isInitialized) {
    try {
      // Add project identifier to all events
      const propertiesWithProject = {
        ...eventProperties,
        project: 'aposta'
      };
      posthog.capture(eventName, propertiesWithProject);
    } catch (error) {
      console.error('Failed to track event:', eventName, error);
    }
  }
};

// Export other commonly used posthog functions
export const identify = (userId: string, userProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && isInitialized) {
    try {
      posthog.identify(userId, {
        ...userProperties,
        project: 'aposta'
      });
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }
};

export const setUserId = (userId: string) => {
  if (typeof window !== 'undefined' && isInitialized) {
    try {
      posthog.identify(userId, { project: 'aposta' });
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }
};

export const reset = () => {
  if (typeof window !== 'undefined' && isInitialized) {
    try {
      posthog.reset();
    } catch (error) {
      console.error('Failed to reset PostHog:', error);
    }
  }
}; 