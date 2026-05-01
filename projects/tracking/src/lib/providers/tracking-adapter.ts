import { inject, InjectionToken, Provider } from '@angular/core';

export interface TrackingAdapter {
  track(eventName: string, data?: unknown): void;
}

export const TRACKING_ADAPTER = new InjectionToken<TrackingAdapter>('TRACKING_ADAPTER');

export function provideTrackingAdapter(adapter: TrackingAdapter): Provider {
  return { provide: TRACKING_ADAPTER, useValue: adapter };
}

export function injectTrackingAdapter(): TrackingAdapter | null {
  return inject(TRACKING_ADAPTER, { optional: true });
}
