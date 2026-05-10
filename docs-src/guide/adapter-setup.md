# Adapter Setup

The directive is provider-agnostic. You supply a `TrackingAdapter` implementation and it forwards all events to your analytics SDK.

## Adapter contract

```ts
interface TrackingAdapter {
  track(eventName: string, data?: unknown): void;
}
```

## Provide globally

```ts
import { provideTrackingAdapter } from 'ng-track-event-directive';

export const appConfig = {
  providers: [provideTrackingAdapter(myAdapter)]
};
```

## Behavior when missing

If no adapter is provided, tracking calls are ignored safely. This allows incremental rollout in large applications.
