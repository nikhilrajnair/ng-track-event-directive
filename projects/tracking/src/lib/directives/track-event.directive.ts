import {
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  signal,
} from '@angular/core';
import { parseTriggerFromEvent } from '../helpers/track.helper';
import { injectTrackingAdapter } from '../providers/tracking-adapter';
import type { TrackConfig } from '../types/track.types';

@Directive({
  selector: '[trackEvent]',
  host: {
    '(click)': 'onClick()',
    '(mouseenter)': 'onMouseEnter()',
  },
})
export class TrackEventDirective {
  private readonly trackingAdapter = injectTrackingAdapter();
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  readonly trackEvent = input.required<TrackConfig>();

  private readonly trigger = computed(() => parseTriggerFromEvent(this.trackEvent().event));
  private readonly once = computed(() => this.trackEvent().once ?? this.trigger() === 'view');

  // Keying by event name lets a changed event fire without an explicit reset.
  private readonly firedEventKey = signal<string | null>(null);

  constructor() {
    effect((onCleanup) => {
      // Capture the event name at effect-run time so the observer callback always uses
      // the config that was active when this observer was created.
      const currentEvent = this.trackEvent().event;

      if (this.trigger() !== 'view' || typeof IntersectionObserver === 'undefined') {
        return;
      }

      let observer: IntersectionObserver | null = null;

      this.zone.runOutsideAngular(() => {
        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) {
                continue;
              }

              if (this.once() && this.firedEventKey() === currentEvent) {
                continue;
              }

              // Re-enter NgZone so adapter calls and signal writes trigger change detection.
              this.zone.run(() => this.send());

              if (this.once()) {
                this.firedEventKey.set(currentEvent);
                observer?.disconnect();
                observer = null;
              }
            }
          },
          { threshold: 0.1 },
        );

        observer.observe(this.el.nativeElement);
      });

      // Disconnect when the input changes or the directive is destroyed.
      onCleanup(() => {
        observer?.disconnect();
        observer = null;
      });
    });
  }

  protected onClick(): void {
    if (this.trigger() === 'click') {
      this.sendOnce();
    }
  }

  protected onMouseEnter(): void {
    if (this.trigger() === 'hover') {
      this.sendOnce();
    }
  }

  private sendOnce(): void {
    const { event } = this.trackEvent();

    if (this.once() && this.firedEventKey() === event) {
      return;
    }

    // Mark as fired only after the adapter call succeeds.
    this.send();

    if (this.once()) {
      this.firedEventKey.set(event);
    }
  }

  private send(): void {
    const { event, data } = this.trackEvent();

    if (typeof ngDevMode !== 'undefined' && ngDevMode && this.trigger() === 'unknown') {
      console.warn(
        `[ng-track-event] Event "${event}" has no recognised trigger suffix (:clicked, :hovered, :viewed).`,
      );
    }

    if (!event) {
      return;
    }

    this.trackingAdapter?.track(event, data);
  }
}
