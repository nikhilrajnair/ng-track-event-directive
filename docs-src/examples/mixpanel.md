# Mixpanel Example

Install Mixpanel:

```bash
npm install mixpanel-browser
```

Configure the adapter:

```ts
import { ApplicationConfig } from '@angular/core';
import mixpanel from 'mixpanel-browser';
import { provideTrackingAdapter, type TrackingAdapter } from 'ng-track-event-directive';

mixpanel.init('YOUR_MIXPANEL_PROJECT_TOKEN', {
  track_pageview: true,
  persistence: 'localStorage',
});

const mixpanelAdapter: TrackingAdapter = {
  track(eventName, data) {
    mixpanel.track(eventName, (data ?? {}) as Record<string, unknown>);
  },
};

export const appConfig: ApplicationConfig = {
  providers: [provideTrackingAdapter(mixpanelAdapter)],
};
```

Verify in Mixpanel Live View after triggering events in your app.
