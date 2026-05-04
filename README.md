# ng-track-event-directive

A lightweight Angular directive for declarative analytics event tracking with `click`, `hover`, and `view` triggers. Bring your own adapter (Mixpanel, Segment, GA4, etc.).

## Documentation Website (Source Of Truth)

This repository includes a docs + demo website in `projects/demo-app` (published via GitHub Pages).

It is intended to be the canonical onboarding experience for:

- Installation and compatibility
- Adapter setup
- Trigger conventions
- API reference
- Realtime verification workflow

`npmjs.com` package docs are rendered from `projects/tracking/README.md`, so keep that file aligned with this README and the docs site.

### Versioning and migration notes

- Release history: `CHANGELOG.md`
- Package listing: https://www.npmjs.com/package/ng-track-event-directive
- For breaking changes, include migration steps in both this README and `projects/tracking/README.md`.

## Installation

```bash
npm install ng-track-event-directive
```

**Peer dependencies:** `@angular/core` and `@angular/common` v21.2+

---

## Quick Start

### 1. Provide a tracking adapter

Register a `TrackingAdapter` at the application (or component) level. The adapter is the bridge between the directive and your analytics SDK.

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
  track(eventName: string, data?: unknown): void {
    mixpanel.track(eventName, data as Record<string, unknown>);
  },
};

export const appConfig: ApplicationConfig = {
  providers: [provideTrackingAdapter(mixpanelAdapter)],
};
```

### 2. Import the directive

`TrackEventDirective` is a standalone directive — import it directly in your component.

```ts
import { TrackEventDirective } from 'ng-track-event-directive';

@Component({
  imports: [TrackEventDirective],
  template: `...`,
})
export class MyComponent {}
```

### 3. Add tracking to your template

Use the `trackConfig` helper to build a `TrackConfig` and bind it to the `trackEvent` directive.

```html
<button [trackEvent]="trackConfig('button:clicked', { label: 'Sign Up' })">Sign Up</button>
```

---

## Real-Time Mixpanel Example (End-to-End)

Use this when you want to verify events in Mixpanel immediately.

### 1. Install Mixpanel SDK

```bash
npm install mixpanel-browser
```

### 2. Create a production-safe adapter

```ts
// src/app/tracking.adapter.ts
import mixpanel from 'mixpanel-browser';
import { TrackingAdapter } from 'ng-track-event-directive';

export function createMixpanelAdapter(projectToken: string): TrackingAdapter {
  mixpanel.init(projectToken, {
    track_pageview: true,
    persistence: 'localStorage',
  });

  return {
    track(eventName: string, data?: unknown): void {
      mixpanel.track(eventName, (data ?? {}) as Record<string, unknown>);
    },
  };
}
```

### 3. Register the adapter in app config

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideTrackingAdapter } from 'ng-track-event-directive';
import { createMixpanelAdapter } from './tracking.adapter';

export const appConfig: ApplicationConfig = {
  providers: [provideTrackingAdapter(createMixpanelAdapter('YOUR_MIXPANEL_PROJECT_TOKEN'))],
};
```

### 4. Add trackable elements

```ts
// app.component.ts
import { Component } from '@angular/core';
import { TrackEventDirective, trackConfig } from 'ng-track-event-directive';

@Component({
  selector: 'app-root',
  imports: [TrackEventDirective],
  template: `
    <button [trackEvent]="trackConfig('signup-cta:clicked', { location: 'hero' })">
      Start Free Trial
    </button>

    <section [trackEvent]="trackConfig('pricing-section:viewed', { planCount: 3 })">
      Pricing
    </section>
  `,
})
export class AppComponent {
  protected readonly trackConfig = trackConfig;
}
```

### 5. Verify in Mixpanel Live View

1. Start your app (`npm start`) and open it in the browser.
2. In Mixpanel, open **Events > Live View**.
3. Click the button and scroll the section into view.
4. Confirm you receive:
   - `signup-cta:clicked`
   - `pricing-section:viewed`

If events do not appear, check your project token and ensure browser network requests to `api-js.mixpanel.com` are not blocked.

---

## Integration Examples and Prerequisites

This library is intentionally provider-agnostic. Implement `TrackingAdapter` once and route to your analytics SDK.

### Prerequisites

- Angular v21.2+
- `ng-track-event-directive` installed
- Provider SDK installed in your app (example: Mixpanel)

```bash
npm install mixpanel-browser
```

### Available examples

- Mixpanel: fully documented in this README.
- Segment: example adapter coming soon.
- GA4: example adapter coming soon.
- Custom backend: supported via `provideTrackingAdapter()`.

---

## Event Triggers

The trigger is inferred automatically from the **suffix** of the event name:

| Event name suffix | Trigger                       | Default `once` |
| ----------------- | ----------------------------- | -------------- |
| `:clicked`        | `click`                       | `false`        |
| `:hovered`        | `hover`                       | `false`        |
| `:viewed`         | `view` (IntersectionObserver) | `true`         |

```html
<!-- Fires on every click -->
<button [trackEvent]="trackConfig('add-to-cart:clicked', { productId: 42 })">Add to Cart</button>

<!-- Fires once when the element first enters the viewport -->
<section [trackEvent]="trackConfig('hero-banner:viewed')">Hero Banner</section>

<!-- Fires on every mouse-enter -->
<div [trackEvent]="trackConfig('tooltip:hovered', { tooltip: 'help' })">Hover me</div>
```

---

## `TrackConfig`

```ts
interface TrackConfig<E extends string = string, D = unknown> {
  event: E; // Required. Event name — suffix determines the trigger.
  data?: D; // Optional. Arbitrary payload forwarded to the adapter.
  once?: boolean; // Optional. Override the default fire-once behaviour.
}
```

### `trackConfig` helper

A typed factory function that returns a `TrackConfig` object:

```ts
import { trackConfig } from 'ng-track-event-directive';

trackConfig('hero-banner:viewed');
trackConfig('add-to-cart:clicked', { productId: 42 });
trackConfig('promo:viewed', { campaign: 'summer' }, false); // override once → false
```

---

## `TrackingAdapter` interface

Implement this interface to connect the directive to any analytics SDK:

```ts
interface TrackingAdapter {
  track(eventName: string, data?: unknown): void;
}
```

The adapter is optional at runtime — if none is provided, the directive silently does nothing.

---

## API Reference

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

## Development

```bash
npm install       # Install dependencies
npm run build     # Build the library
npm run test      # Run unit tests
npm run pack:lib  # Pack for local inspection
```

## Demo App (Realtime Mixpanel + Console)

This repository includes a runnable docs + demo app at `projects/demo-app`.

### Run locally

```bash
npm run demo:start
```

Then open `http://localhost:4200`:

1. Visit sections for onboarding, API reference, and live demo.
2. Trigger `:clicked`, `:hovered`, and `:viewed` demo events.
3. Verify in browser console (logs prefixed with `[ng-track-event demo]`).
4. To send events to Mixpanel, set `DEMO_MIXPANEL_TOKEN` in `projects/demo-app/src/app/mixpanel-live-adapter.ts`.
5. Verify in Mixpanel **Events > Live View**.

Without a token, the demo still works and logs every event to the console only.

### Host on GitHub Pages

Build static output for GitHub Pages:

```bash
npm run demo:build:pages
```

This emits the app into `docs/` with base href set to `/ng-track-event/`.

If your repository name is different, update the script in `package.json`:

```json
"demo:build:pages": "ng build demo-app --configuration production --output-path docs --base-href /<your-repo-name>/"
```

After pushing to GitHub:

1. Open repository **Settings > Pages**.
2. Set source to **Deploy from a branch**.
3. Select branch `main` and folder `/docs`.
4. Save and wait for deployment.

An automatic deployment workflow is included at `.github/workflows/pages.yml`.

### Publish

```bash
npm run publish:lib
```

Published from `dist/tracking` using metadata from `projects/tracking/package.json`.
