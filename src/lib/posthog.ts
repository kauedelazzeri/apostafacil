import { PostHog } from 'posthog-js';

let posthog: PostHog | null = null;

// Initialize PostHog
export const initPostHog = () => {
  if (typeof window !== 'undefined' && !posthog) {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    
    if (!apiKey || !host) {
      console.error('PostHog API key or host is not defined in environment variables');
      return;
    }

    // Import PostHog dynamically to avoid SSR issues
    import('posthog-js').then((posthogModule) => {
      posthog = posthogModule.default;
      posthog!.init(apiKey, {
        api_host: host,
        session_recording: {
          recordCrossOriginIframes: false
        },
        autocapture: {
          url_allowlist: [window.location.origin]
        },
        capture_pageview: true,
        capture_pageleave: true,
        loaded: (ph) => {
          if (process.env.NODE_ENV === 'development') {
            ph.debug();
          }
        }
      });
    });
  }
};

// Export posthog instance for direct use
export const track = (eventName: string, eventProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    // Add project identifier to all events
    const propertiesWithProject = {
      ...eventProperties,
      project: 'aposta'
    };
    posthog.capture(eventName, propertiesWithProject);
  }
};

// Export other commonly used posthog functions
export const identify = (userId: string, userProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.identify(userId, {
      ...userProperties,
      project: 'aposta'
    });
  }
};

export const setUserId = (userId: string) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.identify(userId, { project: 'aposta' });
  }
};

export const reset = () => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.reset();
  }
}; 