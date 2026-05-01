# ng-track-event-directive

A lightweight Angular directive for declarative analytics event tracking with `click`, `hover`, and `view` triggers. Bring your own adapter (Mixpanel, Segment, GA4, etc.).

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
import { provideTrackingAdapter, TrackingAdapter } from 'ng-track-event-directive';

const mixpanelAdapter: TrackingAdapter = {
  track(eventName: string, data?: unknown): void {
    mixpanel.track(eventName, data as Record<string, unknown>);
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideTrackingAdapter(mixpanelAdapter),
  ],
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
<button [trackEvent]="trackConfig('button:clicked', { label: 'Sign Up' })">
  Sign Up
</button>
```

---

## Event Triggers

The trigger is inferred automatically from the **suffix** of the event name:

| Event name suffix | Trigger | Default `once` |
|---|---|---|
| `:clicked` | `click` | `false` |
| `:hovered` | `hover` | `false` |
| `:viewed` | `view` (IntersectionObserver) | `true` |

```html
<!-- Fires on every click -->
<button [trackEvent]="trackConfig('add-to-cart:clicked', { productId: 42 })">
  Add to Cart
</button>

<!-- Fires once when the element first enters the viewport -->
<section [trackEvent]="trackConfig('hero-banner:viewed')">
  Hero Banner
</section>

<!-- Fires on every mouse-enter -->
<div [trackEvent]="trackConfig('tooltip:hovered', { tooltip: 'help' })">
  Hover me
</div>
```

---

## `TrackConfig`

```ts
interface TrackConfig<E extends string = string, D = unknown> {
  event: E;   // Required. Event name — suffix determines the trigger.
  data?: D;   // Optional. Arbitrary payload forwarded to the adapter.
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

| Symbol | Kind | Description |
|---|---|---|
| `TrackEventDirective` | Directive | Core directive. Selector: `[trackEvent]`. |
| `trackConfig` | Function | Type-safe `TrackConfig` factory. |
| `provideTrackingAdapter` | Function | Registers an adapter via DI. |
| `TRACKING_ADAPTER` | InjectionToken | Token used to inject a custom adapter. |
| `parseTriggerFromEvent` | Function | Parses a `TrackTrigger` from an event string. |
| `TrackConfig` | Type | Configuration interface for the directive input. |
| `TrackTrigger` | Type | `'click' \| 'view' \| 'hover' \| 'unknown'` |
| `TrackingAdapter` | Type | Interface for custom adapter implementations. |

---

## Development

```bash
npm install       # Install dependencies
npm run build     # Build the library
npm run test      # Run unit tests
npm run pack:lib  # Pack for local inspection
```

### Publish

```bash
npm run publish:lib
```

Published from `dist/tracking` using metadata from `projects/tracking/package.json`.
