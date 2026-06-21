import mixpanel from 'mixpanel-browser';
import { signal } from '@angular/core';
import { TrackingAdapter } from 'ng-track-event-directive';

export interface DevLogEntry {
  name: string;
  data: string;
}

export const devLog = signal<DevLogEntry[]>([]);

// Replace with your project token to send demo events to Mixpanel.
const DEMO_MIXPANEL_TOKEN = '';

const mixpanelConnected = DEMO_MIXPANEL_TOKEN.trim().length > 0;

if (mixpanelConnected) {
  mixpanel.init(DEMO_MIXPANEL_TOKEN, {
    track_pageview: true,
    persistence: 'localStorage',
    debug: true,
  });
}

export const demoTrackingAdapter: TrackingAdapter = {
  track(eventName: string, data?: unknown): void {
    const payload = (data ?? {}) as Record<string, unknown>;

    console.info('[ng-track-event demo]', { eventName, payload, mixpanelConnected });
    devLog.update((log) =>
      [
        { name: eventName, data: Object.keys(payload).length ? JSON.stringify(payload) : '' },
        ...log,
      ].slice(0, 20),
    );

    if (!mixpanelConnected) {
      return;
    }

    mixpanel.track(eventName, payload);
  },
};
