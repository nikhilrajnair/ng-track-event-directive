# ng-track-event-directive

A lightweight Angular directive for declarative click, hover, and viewport event tracking with any analytics provider.

## Install

```bash
npm install ng-track-event-directive
```

## Compatibility

| Package version | Angular support          | Status   |
| --------------- | ------------------------ | -------- |
| 1.4.x           | Angular 22.x             | Current  |
| 1.0.0–1.3.3     | Angular >=21.2.0 <22.0.0 | Previous |

Angular 20 and earlier are not currently supported.

Install the version that matches your Angular application:

```bash
# Angular 22
npm install ng-track-event-directive@^1.4.0

# Angular 21.2
npm install ng-track-event-directive@1.3.3
```

For Angular 21.2, pin `1.3.3` exactly. A caret range such as `^1.3.3` can select
the Angular-22-only `1.4.0` release.

## Quick Start

### Register an adapter

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

### Import and use the directive

```ts
// app.component.ts
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
export class AppComponent {
  protected readonly trackConfig = trackConfig;
}
```

## Event Triggers

The event-name suffix selects the trigger automatically.

| Suffix     | Trigger                           | Default `once` |
| ---------- | --------------------------------- | -------------- |
| `:clicked` | click                             | `false`        |
| `:hovered` | mouse enter                       | `false`        |
| `:viewed`  | viewport (`IntersectionObserver`) | `true`         |

Override the default when needed:

```ts
trackConfig('promo:viewed', { campaign: 'summer' }, false);
```

Use an explicit trigger when the analytics event name and DOM event should be independent:

```ts
trackConfig('search:focused', { source: 'header' }, { trigger: 'focus' });
trackConfig('dialog:opened', undefined, { trigger: 'dialog-opened', once: true });
```

Explicit triggers support standard and custom DOM events. Event payloads are never forwarded
automatically; only the configured `data` is sent to the tracking adapter.

## Adapter Concept

The package is analytics-provider agnostic. Connect your provider through one small interface:

```ts
interface TrackingAdapter {
  track(eventName: string, data?: unknown): void;
}
```

If no adapter is registered, tracking calls are safely ignored.

## Demo and Documentation

- [Documentation](https://nikhilrajnair.github.io/ng-track-event-directive/)
- [Getting started](https://nikhilrajnair.github.io/ng-track-event-directive/getting-started)
- [Demo](https://nikhilrajnair.github.io/ng-track-event-directive/demo)
- [Open in StackBlitz](https://stackblitz.com/edit/stackblitz-starters-hsdpibzj?file=package.json)

If the production demo build crashes locally on macOS ARM64 or Node 24 because of Angular local cache or LMDB native cache issues, use `npm run demo:build:safe`. It uses `CI=1` for the demo build and does not indicate a directive runtime issue.

## API Overview

- `TrackEventDirective` — attaches tracking behavior to an element
- `trackConfig` — creates a typed event configuration
- `provideTrackingAdapter` — registers an analytics adapter
- `TRACKING_ADAPTER` — adapter injection token
- `parseTriggerFromEvent` — resolves a trigger from an event suffix
- `TrackConfig`, `TrackOptions`, `TrackTrigger`, `TrackingAdapter` — public types

See the [full API reference](https://nikhilrajnair.github.io/ng-track-event-directive/api/).

## Notes

- Install the package version matching your Angular version in the compatibility table above.
- `:viewed` requires `IntersectionObserver` support.
- See the [changelog](./CHANGELOG.md) for releases and migrations.
