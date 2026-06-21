# ng-track-event-directive

A lightweight Angular directive that replaces repetitive event listeners with declarative analytics tracking in templates.

## Install

```bash
npm install ng-track-event-directive
```

Peer dependencies:

- `@angular/core` v22
- `@angular/common` v22

## Compatibility

| Package version | Angular support | Node support                        |
| --------------- | --------------- | ----------------------------------- |
| 1.x             | Angular 22      | ^22.22.3 \|\| ^24.15.0 \|\| ^26.0.0 |

## Quick Start

### Register a `TrackingAdapter`

An adapter forwards events from the directive to your analytics provider.

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

### Use `[trackEvent]`

Import the standalone directive and expose `trackConfig` to the template:

```ts
import { Component } from '@angular/core';
import { TrackEventDirective, trackConfig } from 'ng-track-event-directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TrackEventDirective],
  template: `
    <button [trackEvent]="trackConfig('signup:clicked', { source: 'hero' })">Sign up</button>

    <section [trackEvent]="trackConfig('pricing:viewed')">Pricing</section>
  `,
})
export class AppComponent {
  protected readonly trackConfig = trackConfig;
}
```

## Triggers and `once`

The event-name suffix selects the trigger and its default `once` behavior.

| Suffix     | Trigger                           | Default `once` |
| ---------- | --------------------------------- | -------------- |
| `:clicked` | click                             | `false`        |
| `:hovered` | mouse enter                       | `false`        |
| `:viewed`  | viewport (`IntersectionObserver`) | `true`         |

Set the third `trackConfig` argument to override the default:

```ts
trackConfig('save:clicked', undefined, true); // first click only
trackConfig('promo:viewed', { campaign: 'summer' }, false); // every view
```

## `TrackConfig`

```ts
interface TrackConfig<E extends string = string, D = unknown> {
  event: E;
  data?: D;
  once?: boolean;
}
```

The `trackConfig(event, data?, once?)` helper creates this object while preserving event and payload types.

## Provider Examples

Register any of these adapters with `provideTrackingAdapter(...)` as shown above.

### Mixpanel

```bash
npm install mixpanel-browser
```

```ts
import mixpanel from 'mixpanel-browser';
import type { TrackingAdapter } from 'ng-track-event-directive';

mixpanel.init('YOUR_PROJECT_TOKEN');

export const mixpanelAdapter: TrackingAdapter = {
  track: (eventName, data) => mixpanel.track(eventName, (data ?? {}) as Record<string, unknown>),
};
```

### Google Analytics 4

```ts
import type { TrackingAdapter } from 'ng-track-event-directive';

declare function gtag(...args: unknown[]): void;

export const ga4Adapter: TrackingAdapter = {
  track: (eventName, data) => gtag('event', eventName, (data ?? {}) as Record<string, unknown>),
};
```

### Segment

```ts
import type { TrackingAdapter } from 'ng-track-event-directive';

declare const analytics: {
  track(eventName: string, properties?: Record<string, unknown>): void;
};

export const segmentAdapter: TrackingAdapter = {
  track: (eventName, data) => analytics.track(eventName, (data ?? {}) as Record<string, unknown>),
};
```

## API

| Export                   | Purpose                                      |
| ------------------------ | -------------------------------------------- |
| `TrackEventDirective`    | Adds `[trackEvent]` behavior to an element   |
| `trackConfig`            | Creates a typed event configuration          |
| `provideTrackingAdapter` | Registers an adapter                         |
| `TRACKING_ADAPTER`       | Adapter injection token                      |
| `parseTriggerFromEvent`  | Resolves a trigger from an event-name suffix |
| `TrackConfig`            | Directive input type                         |
| `TrackTrigger`           | Trigger type                                 |
| `TrackingAdapter`        | Analytics adapter contract                   |

If no adapter is provided, tracking calls are safely ignored.

See the [documentation](https://nikhilrajnair.github.io/ng-track-event-directive/), [API reference](https://nikhilrajnair.github.io/ng-track-event-directive/api/), and [changelog](https://github.com/nikhilrajnair/ng-track-event-directive/blob/main/CHANGELOG.md) for more.
