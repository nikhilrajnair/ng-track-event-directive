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
  onceOrOptions?: boolean | TrackOptions,
): TrackConfig<E, D>;
```

```ts
trackConfig('hero:viewed');
trackConfig('add-to-cart:clicked', { productId: 42 });
trackConfig('promo:viewed', { campaign: 'summer' }, false);
trackConfig('dialog:opened', undefined, { trigger: 'dialog-opened', once: true });
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
  trigger?: TrackTrigger;
  once?: boolean;
}
```

- `event` is the analytics event name. Its suffix selects the trigger when `trigger` is omitted.
- `data` is passed unchanged to the adapter.
- `trigger` selects a standard or custom DOM event, or the special `view` trigger.
- `once` overrides the trigger's default one-time behavior.

## `TrackOptions`

```ts
interface TrackOptions {
  trigger?: TrackTrigger;
  once?: boolean;
}
```

Pass this object as the third `trackConfig` argument. Passing a boolean remains supported for
backward compatibility and sets `once` directly.

## `TrackTrigger`

```ts
type TrackTrigger = 'click' | 'view' | 'hover' | 'unknown' | (string & {});
```

The named values provide autocomplete for built-in behavior. Other strings are treated as DOM
event names.

## `TrackingAdapter`

The contract implemented by analytics adapters.

```ts
interface TrackingAdapter {
  track(eventName: string, data?: unknown): void;
}
```

See [Adapter Setup](/guide/adapter-setup) for provider examples.
