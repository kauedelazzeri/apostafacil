import * as amplitude from '@amplitude/analytics-browser';
import * as SessionReplay from '@amplitude/plugin-session-replay-browser';

// Initialize Amplitude
export const initAmplitude = () => {
  if (typeof window !== 'undefined') {
    const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    
    if (!apiKey) {
      console.error('Amplitude API key is not defined in environment variables');
      return;
    }

    // Initialize Amplitude first
    amplitude.init(apiKey, undefined, {
      defaultTracking: {
        sessions: true,
        pageViews: true,
        formInteractions: true,
        fileDownloads: true,
      },
      logLevel: amplitude.Types.LogLevel.Debug,
    });

    // Add session replay plugin
    amplitude.add(SessionReplay.plugin({ sampleRate: 1 }));
  }
};

// Export amplitude instance for direct use
export const track = (eventName: string, eventProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    amplitude.track(eventName, eventProperties);
  }
};

// Export other commonly used amplitude functions
export const identify = (userId: string, userProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    const identifyObj = new amplitude.Identify();
    if (userProperties) {
      Object.entries(userProperties).forEach(([key, value]) => {
        identifyObj.set(key, value);
      });
    }
    amplitude.identify(identifyObj);
  }
};

export const setUserId = (userId: string) => {
  if (typeof window !== 'undefined') {
    amplitude.setUserId(userId);
  }
};

export const reset = () => {
  if (typeof window !== 'undefined') {
    amplitude.reset();
  }
}; 