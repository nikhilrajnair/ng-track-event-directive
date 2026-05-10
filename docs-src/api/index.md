# API Reference

## Exports

- `TrackEventDirective`
- `trackConfig`
- `provideTrackingAdapter`
- `TRACKING_ADAPTER`
- `parseTriggerFromEvent`
- `TrackConfig`
- `TrackTrigger`
- `TrackingAdapter`

## `TrackConfig`

```ts
interface TrackConfig<E extends string = string, D = unknown> {
  event: E;
  data?: D;
  once?: boolean;
}
```

## `trackConfig`

```ts
trackConfig('hero:viewed');
trackConfig('add-to-cart:clicked', { productId: 42 });
trackConfig('promo:viewed', { campaign: 'summer' }, false);
```

## `TrackingAdapter`

```ts
interface TrackingAdapter {
  track(eventName: string, data?: unknown): void;
}
```
