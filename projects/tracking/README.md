# ng-track-event-directive

A reusable Angular library that provides a declarative tracking directive and helper utilities.

## Install

```bash
npm install ng-track-event-directive
```

## What it provides

- `TrackEventDirective` for template-based tracking.
- `trackConfig()` helper to build stable track config objects.
- `parseTriggerFromEvent()` for trigger inference from event suffixes.
- `provideTrackingAdapter()` and `TRACKING_ADAPTER` token to connect any analytics backend.

## Trigger suffix conventions

- `:clicked` maps to click events.
- `:hovered` maps to mouseenter events.
- `:viewed` maps to IntersectionObserver viewport events.

## Setup in consumer app

Provide an adapter in bootstrap providers:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideTrackingAdapter } from 'ng-track-event-directive';

bootstrapApplication(AppComponent, {
  providers: [
    provideTrackingAdapter({
      track(eventName: string, data?: unknown) {
        // Forward to Mixpanel, Segment, Amplitude, etc.
        console.log('track', eventName, data);
      },
    }),
  ],
});
```

Use in a standalone component:

```ts
import { Component } from '@angular/core';
import { TrackEventDirective, trackConfig } from 'ng-track-event-directive';

@Component({
  selector: 'app-demo',
  imports: [TrackEventDirective],
  template: `
    <button [trackEvent]="saveTrack">Save</button>
    <div [trackEvent]="tableViewedTrack">Table</div>
  `,
})
export class DemoComponent {
  saveTrack = trackConfig('price-book:clicked', { source: 'toolbar' });
  tableViewedTrack = trackConfig('users-table:viewed');
}
```

## Build and publish

```bash
npm run build
npm run test
npm run pack:lib
npm run publish:lib
```

## Notes

- This package is intentionally generic and does not include app-specific event contracts.
- If no adapter is provided, tracking calls are safely ignored.
- `:viewed` tracking requires `IntersectionObserver`; when unavailable, the directive safely no-ops.
