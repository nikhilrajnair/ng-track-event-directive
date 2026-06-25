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

## Explicit DOM triggers

Use an explicit `trigger` when the analytics event name should not determine the browser event.
The trigger can be any standard or custom DOM event name.

```ts
trackConfig('search:focused', { source: 'header' }, { trigger: 'focus' });
trackConfig('form:submitted', undefined, { trigger: 'submit' });
trackConfig('dialog:opened', undefined, { trigger: 'dialog-opened', once: true });
```

```html
<button [trackEvent]="trackConfig('dialog:opened', undefined, { trigger: 'dialog-opened' })">
  Open dialog
</button>
```

An explicit trigger takes precedence over a recognised suffix. For example,
`trackConfig('save:clicked', undefined, { trigger: 'focus' })` tracks focus rather than click.

The directive sends only the configured `data`. It does not automatically forward the native DOM
event or `CustomEvent.detail` to the tracking adapter.

Custom Angular component outputs are not DOM events and cannot be subscribed to dynamically by
this directive. Track those from the component output handler, or have the component dispatch a
DOM `CustomEvent` from its host element.

## View events

`:viewed` uses `IntersectionObserver` and fires when at least 10% of the element intersects the viewport. If `IntersectionObserver` is unavailable, no view event is sent.

## Unknown suffixes

An event without `:clicked`, `:hovered`, or `:viewed` and without an explicit `trigger` resolves to
the `unknown` trigger. The directive does not attach a listener, so the event is not sent.
