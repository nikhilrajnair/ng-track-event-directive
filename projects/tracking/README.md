# ng-track-event-directive

Declarative Angular analytics tracking with a standalone directive and typed helpers.

Track events directly in templates using consistent suffix conventions:

- `:clicked` -> click
- `:hovered` -> mouseenter
- `:viewed` -> viewport visibility (IntersectionObserver)

---

## Install

```bash
npm install ng-track-event-directive
```

**Peer dependencies:** `@angular/core` and `@angular/common` v21.2+

---

## Why this library

- Keeps event wiring close to UI markup.
- Provides consistent trigger behavior from event names.
- Works with any analytics backend through a small adapter interface.
- Safely no-ops when no adapter is provided.

---

## Quick Start

### 1. Provide a tracking adapter

```ts
import { ApplicationConfig } from '@angular/core';
import { provideTrackingAdapter, TrackingAdapter } from 'ng-track-event-directive';

const adapter: TrackingAdapter = {
  track(eventName: string, data?: unknown): void {
    console.log('track', eventName, data);
  },
};

export const appConfig: ApplicationConfig = {
  providers: [provideTrackingAdapter(adapter)],
};
```

### 2. Import directive in standalone component

```ts
import { Component } from '@angular/core';
import { TrackEventDirective, trackConfig } from 'ng-track-event-directive';

@Component({
  selector: 'app-demo',
  imports: [TrackEventDirective],
  template: `
    <button [trackEvent]="trackConfig('signup:clicked', { source: 'hero' })">Sign Up</button>
  `,
})
export class DemoComponent {
  protected readonly trackConfig = trackConfig;
}
```

---

## Trigger Mapping

| Event name suffix | Trigger                       | Default `once` |
| ----------------- | ----------------------------- | -------------- |
| `:clicked`        | `click`                       | `false`        |
| `:hovered`        | `hover`                       | `false`        |
| `:viewed`         | `view` (IntersectionObserver) | `true`         |

Use `once` in `TrackConfig` to override defaults.

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

## Realtime Mixpanel Example

```ts
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
```

Verify events in browser console first, then in Mixpanel **Events > Live View**.

---

## Integration Examples and Prerequisites

This directive is provider-agnostic and works with any analytics SDK through `TrackingAdapter`.

### Prerequisites

- Angular v21.2+
- `ng-track-event-directive` installed
- Provider SDK installed in your app

Mixpanel SDK install:

```bash
npm install mixpanel-browser
```

### Provider example status

- Mixpanel: available in this README.
- Segment: coming soon.
- GA4: coming soon.
- Custom backend: available via `provideTrackingAdapter()`.

---

## Versioning and Migration

- This package uses semantic versioning.
- Check `CHANGELOG.md` in the repository for release notes.
- For major upgrades, follow migration notes in the repository root README and package README.

---

## Development

```bash
npm install
npm run build
npm run test
npm run pack:lib
npm run publish:lib
```

---

## Notes

- `:viewed` requires `IntersectionObserver` support.
- If an adapter is not registered, calls are intentionally ignored.
- The GitHub Pages docs/demo in this repository is the canonical onboarding reference.
