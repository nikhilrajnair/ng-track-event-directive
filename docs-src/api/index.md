# API Reference

The package exposes the following public API.

## `TrackEventDirective`

A standalone directive with selector `[trackEvent]`. Its required input accepts a `TrackConfig` object.

```html
<button [trackEvent]="trackConfig('save:clicked', { id: 42 })">Save</button>
```

## `trackConfig`

Creates a typed `TrackConfig` object.

```ts
function trackConfig<E extends string, D = unknown>(
  event: E,
  data?: D,
  once?: boolean,
): TrackConfig<E, D>;
```

```ts
trackConfig('hero:viewed');
trackConfig('add-to-cart:clicked', { productId: 42 });
trackConfig('promo:viewed', { campaign: 'summer' }, false);
```

## `provideTrackingAdapter`

Registers a `TrackingAdapter` with Angular dependency injection.

```ts
function provideTrackingAdapter(adapter: TrackingAdapter): Provider;
```

## `TRACKING_ADAPTER`

The `InjectionToken<TrackingAdapter>` used by `provideTrackingAdapter`. Most applications should use the provider function instead of registering the token directly.

## `parseTriggerFromEvent`

Returns the trigger inferred from the suffix after the final `:`.

```ts
function parseTriggerFromEvent(event: string): TrackTrigger;

parseTriggerFromEvent('save:clicked'); // 'click'
parseTriggerFromEvent('dialog:opened'); // 'unknown'
```

## `TrackConfig`

```ts
interface TrackConfig<E extends string = string, D = unknown> {
  event: E;
  data?: D;
  once?: boolean;
}
```

- `event` is the analytics event name. Its suffix selects the trigger.
- `data` is passed unchanged to the adapter.
- `once` overrides the trigger's default one-time behavior.

## `TrackTrigger`

```ts
type TrackTrigger = 'click' | 'view' | 'hover' | 'unknown';
```

## `TrackingAdapter`

The contract implemented by analytics adapters.

```ts
interface TrackingAdapter {
  track(eventName: string, data?: unknown): void;
}
```

See [Adapter Setup](/guide/adapter-setup) for provider examples.
