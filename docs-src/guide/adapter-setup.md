# Adapter Setup

`TrackingAdapter` is the bridge between the directive and your analytics provider:

```ts
interface TrackingAdapter {
  track(eventName: string, data?: unknown): void;
}
```

Register one adapter at application startup:

```ts
import { provideTrackingAdapter } from 'ng-track-event-directive';
import { trackingAdapter } from './tracking-adapter';

export const appConfig = {
  providers: [provideTrackingAdapter(trackingAdapter)],
};
```

## Console

Start with a console adapter to verify event names and payloads locally.

```ts
import type { TrackingAdapter } from 'ng-track-event-directive';

export const trackingAdapter: TrackingAdapter = {
  track(eventName, data) {
    console.log('[analytics]', eventName, data);
  },
};
```

## Mixpanel

Install the browser SDK:

```bash
npm install mixpanel-browser
```

```ts
import mixpanel from 'mixpanel-browser';
import type { TrackingAdapter } from 'ng-track-event-directive';

mixpanel.init('YOUR_PROJECT_TOKEN');

export const trackingAdapter: TrackingAdapter = {
  track: (eventName, data) => mixpanel.track(eventName, (data ?? {}) as Record<string, unknown>),
};
```

## Google Analytics 4

This adapter assumes the Google tag is already loaded by your application.

```ts
import type { TrackingAdapter } from 'ng-track-event-directive';

declare function gtag(...args: unknown[]): void;

export const trackingAdapter: TrackingAdapter = {
  track: (eventName, data) => gtag('event', eventName, (data ?? {}) as Record<string, unknown>),
};
```

## Segment

This adapter assumes Analytics.js is already loaded by your application.

```ts
import type { TrackingAdapter } from 'ng-track-event-directive';

declare const analytics: {
  track(eventName: string, properties?: Record<string, unknown>): void;
};

export const trackingAdapter: TrackingAdapter = {
  track: (eventName, data) => analytics.track(eventName, (data ?? {}) as Record<string, unknown>),
};
```

## When no adapter is registered

The adapter is optional. If none is registered, valid tracking events are safely ignored. This is useful for incremental rollout or environments where analytics is disabled.
