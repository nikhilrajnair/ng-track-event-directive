# Getting Started

Add declarative analytics tracking to a standalone Angular component in three steps.

## 1. Install

```bash
npm install ng-track-event-directive
```

The package requires `@angular/core` and `@angular/common` v22.

## 2. Register an adapter

Create an adapter that sends events to your analytics provider, then register it at application startup.

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideTrackingAdapter, type TrackingAdapter } from 'ng-track-event-directive';

const trackingAdapter: TrackingAdapter = {
  track(eventName, data) {
    console.log('[analytics]', eventName, data);
  },
};

export const appConfig: ApplicationConfig = {
  providers: [provideTrackingAdapter(trackingAdapter)],
};
```

The console adapter is enough to verify the setup. Replace it with your provider adapter when you are ready.

## 3. Use the directive

Import `TrackEventDirective` into the component and expose `trackConfig` to its template.

```ts
// app.ts
import { Component } from '@angular/core';
import { TrackEventDirective, trackConfig } from 'ng-track-event-directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TrackEventDirective],
  template: `
    <button [trackEvent]="trackConfig('signup:clicked', { source: 'hero' })">Sign up</button>
  `,
})
export class App {
  protected readonly trackConfig = trackConfig;
}
```

Clicking the button calls `trackingAdapter.track('signup:clicked', { source: 'hero' })`.

## Next steps

- Connect an analytics provider in [Adapter Setup](/guide/adapter-setup).
- Learn the suffix and `once` rules in [Events and Triggers](/guide/events-and-triggers).
- Browse every public export in the [API Reference](/api/).
- Try the package interactively in the [Demo](/demo).
