# Events and Triggers

The directive infers its browser trigger from the suffix after the final `:` in the event name.

| Suffix     | Trigger                           | Default `once` |
| ---------- | --------------------------------- | -------------- |
| `:clicked` | click                             | `false`        |
| `:hovered` | mouse enter                       | `false`        |
| `:viewed`  | viewport (`IntersectionObserver`) | `true`         |

```html
<button [trackEvent]="trackConfig('checkout:clicked', { step: 1 })">Checkout</button>
<div [trackEvent]="trackConfig('help:hovered')">Hover for help</div>
<section [trackEvent]="trackConfig('hero:viewed')">Hero</section>
```

## One-time events

By default, click and hover events fire every time, while view events fire only on their first intersection. Pass a third argument to `trackConfig` to override that default.

```ts
trackConfig('save:clicked', undefined, true); // first click only
trackConfig('promo:viewed', { campaign: 'summer' }, false); // every intersection
```

`once` applies to the current event name. A new event name can fire independently.

## View events

`:viewed` uses `IntersectionObserver` and fires when at least 10% of the element intersects the viewport. If `IntersectionObserver` is unavailable, no view event is sent.

## Unknown suffixes

An event without `:clicked`, `:hovered`, or `:viewed` resolves to the `unknown` trigger. The directive does not attach a matching trigger, so the event is not sent.
