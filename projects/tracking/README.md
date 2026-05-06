# ng-track-event-directive

Declarative Angular directive for analytics event tracking — track click, hover, and viewport-view events from HTML templates with zero boilerplate. Works with any analytics backend: Mixpanel, Segment, GA4, or your own custom backend.

---

## Install

```bash
npm install ng-track-event-directive
```

**Peer dependencies:** `@angular/core` and `@angular/common` v21.2+

> Supports Angular 21.2+. Compatible with standalone components and NgModule apps.

---

## Why ng-track-event-directive?

- **Track click events in Angular** — attach a `[trackEvent]` binding to any element; no `HostListener` or manual wiring needed.
- **Track viewport views in Angular** — use the `:viewed` suffix and an `IntersectionObserver` fires automatically when the element enters the viewport.
- **Track hover events in Angular** — use the `:hovered` suffix to fire on `mouseenter`.
- **Angular Mixpanel directive** — drop in the Mixpanel adapter and all events flow to your Mixpanel project.
- **Angular GA4 / Segment integration** — implement one `TrackingAdapter` method and any backend works.
- Trigger inference from event name suffixes keeps templates readable and consistent.
- Safely no-ops when no adapter is provided — safe to add before your analytics SDK is wired up.

---

## Quick Start

### 1. Implement a `TrackingAdapter`

`TrackingAdapter` is a one-method interface that bridges the directive to your analytics SDK:

```ts
interface TrackingAdapter {
  track(eventName: string, data?: unknown): void;
}
```

Create your adapter and register it in `app.config.ts`:

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideTrackingAdapter, TrackingAdapter } from 'ng-track-event-directive';

const myAdapter: TrackingAdapter = {
  track(eventName, data) {
    console.log('[analytics]', eventName, data);
    // swap for: mixpanel.track(eventName, data), analytics.track(eventName, data), etc.
  },
};

export const appConfig: ApplicationConfig = {
  providers: [provideTrackingAdapter(myAdapter)],
};
```

> For NgModule apps, add `provideTrackingAdapter(myAdapter)` to the `providers` array in your root `AppModule`.

### 2. Add the directive to your component

```ts
import { Component } from '@angular/core';
import { TrackEventDirective, trackConfig } from 'ng-track-event-directive';

@Component({
  selector: 'app-root',
  imports: [TrackEventDirective],
  template: `
    <button [trackEvent]="trackConfig('signup:clicked', { source: 'hero' })">Sign Up</button>
    <section [trackEvent]="trackConfig('pricing:viewed')">Pricing</section>
    <div [trackEvent]="trackConfig('tooltip:hovered', { id: 'help' })">Hover me</div>
  `,
})
export class AppComponent {
  protected readonly trackConfig = trackConfig;
}
```

---

## Trigger Mapping

The trigger is inferred from the **suffix** of the event name:

| Event name suffix | Trigger                       | Default `once` |
| ----------------- | ----------------------------- | -------------- |
| `:clicked`        | `click`                       | `false`        |
| `:hovered`        | `hover` (`mouseenter`)        | `false`        |
| `:viewed`         | `view` (IntersectionObserver) | `true`         |

Override the default with `once` in `TrackConfig`:

```ts
trackConfig('promo-banner:viewed', { campaign: 'summer' }, false); // fire every time
```

---

## `TrackConfig`

```ts
interface TrackConfig<E extends string = string, D = unknown> {
  event: E; // Required. Suffix determines the trigger.
  data?: D; // Optional. Payload forwarded to the adapter.
  once?: boolean; // Optional. Override the default fire-once behaviour.
}
```

Use the `trackConfig` helper for a typed, concise factory:

```ts
import { trackConfig } from 'ng-track-event-directive';

trackConfig('hero:viewed');
trackConfig('add-to-cart:clicked', { productId: 42 });
trackConfig('promo:viewed', { campaign: 'summer' }, false);
```

---

## API

| Symbol                   | Kind           | Description                                      |
| ------------------------ | -------------- | ------------------------------------------------ |
| `TrackEventDirective`    | Directive      | Core directive. Selector: `[trackEvent]`.        |
| `trackConfig`            | Function       | Type-safe `TrackConfig` factory.                 |
| `provideTrackingAdapter` | Function       | Registers an adapter via DI.                     |
| `TRACKING_ADAPTER`       | InjectionToken | Token used to inject a custom adapter.           |
| `parseTriggerFromEvent`  | Function       | Parses a `TrackTrigger` from an event string.    |
| `TrackConfig`            | Type           | Configuration interface for the directive input. |
| `TrackTrigger`           | Type           | `'click' \| 'view' \| 'hover' \| 'unknown'`      |
| `TrackingAdapter`        | Type           | Interface for custom adapter implementations.    |

---

## Mixpanel Example

Angular Mixpanel directive — connect the directive to Mixpanel in minutes:

```bash
npm install mixpanel-browser
```

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import mixpanel from 'mixpanel-browser';
import { provideTrackingAdapter, TrackingAdapter } from 'ng-track-event-directive';

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

Verify events in your browser console first, then in Mixpanel **Events > Live View**.

---

## GA4 Example (Angular Google Analytics event tracking)

Track events to Google Analytics 4 using `gtag`:

```ts
// ga4-adapter.ts
import { TrackingAdapter } from 'ng-track-event-directive';

declare function gtag(...args: unknown[]): void;

export const ga4Adapter: TrackingAdapter = {
  track(eventName: string, data?: unknown): void {
    gtag('event', eventName, (data ?? {}) as Record<string, unknown>);
  },
};
```

```ts
// app.config.ts
import { provideTrackingAdapter } from 'ng-track-event-directive';
import { ga4Adapter } from './ga4-adapter';

export const appConfig = {
  providers: [provideTrackingAdapter(ga4Adapter)],
};
```

---

## Segment Example (Angular Segment event tracking)

Track events via the Segment Analytics.js browser SDK:

```ts
// segment-adapter.ts
import { TrackingAdapter } from 'ng-track-event-directive';

declare const analytics: { track(event: string, properties?: object): void };

export const segmentAdapter: TrackingAdapter = {
  track(eventName: string, data?: unknown): void {
    analytics.track(eventName, (data ?? {}) as object);
  },
};
```

```ts
// app.config.ts
import { provideTrackingAdapter } from 'ng-track-event-directive';
import { segmentAdapter } from './segment-adapter';

export const appConfig = {
  providers: [provideTrackingAdapter(segmentAdapter)],
};
```

---

## Notes

- `:viewed` requires `IntersectionObserver` support (all modern browsers).
- If no adapter is registered, all tracking calls are silently ignored.
- This package follows semantic versioning. See the [GitHub repository](https://github.com/nikhilrajnair/ng-track-event-directive) for the full changelog and migration notes.
