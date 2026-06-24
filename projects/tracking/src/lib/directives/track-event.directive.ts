import {
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  Renderer2,
  signal,
} from '@angular/core';
import { parseTriggerFromEvent } from '../helpers/track.helper';
import { injectTrackingAdapter } from '../providers/tracking-adapter';
import type { TrackConfig } from '../types/track.types';

@Directive({
  selector: '[trackEvent]',
})
export class TrackEventDirective {
  private readonly trackingAdapter = injectTrackingAdapter();
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly renderer = inject(Renderer2);

  readonly trackEvent = input.required<TrackConfig>();

  private readonly trigger = computed(
    () => this.trackEvent().trigger ?? parseTriggerFromEvent(this.trackEvent().event),
  );
  private readonly once = computed(() => this.trackEvent().once ?? this.trigger() === 'view');

  // Keying by analytics event and trigger lets either change fire without an explicit reset.
  private readonly firedEventKey = signal<string | null>(null);

  constructor() {
    effect((onCleanup) => {
      // Capture the configuration used to create this observer or DOM listener.
      const currentEvent = this.trackEvent().event;
      const currentTrigger = this.trigger();

      if (!currentTrigger || currentTrigger === 'unknown') {
        if (typeof ngDevMode !== 'undefined' && ngDevMode) {
          console.warn(
            `[ng-track-event] Event "${currentEvent}" has no trigger. Add a trigger or use a recognised suffix (:clicked, :hovered, :viewed).`,
          );
        }
        return;
      }

      if (currentTrigger === 'view') {
        this.observeView(onCleanup);
        return;
      }

      const domEventName = currentTrigger === 'hover' ? 'mouseenter' : currentTrigger;
      let removeListener: (() => void) | null = null;

      this.zone.runOutsideAngular(() => {
        removeListener = this.renderer.listen(this.el.nativeElement, domEventName, () => {
          this.zone.run(() => this.sendOnce());
        });
      });

      onCleanup(() => {
        removeListener?.();
        removeListener = null;
      });
    });
  }

  private sendOnce(): void {
    const eventKey = this.eventKey();

    if (this.once() && this.firedEventKey() === eventKey) {
      return;
    }

    // Mark as fired only after the adapter call succeeds.
    this.send();

    if (this.once()) {
      this.firedEventKey.set(eventKey);
    }
  }

  private observeView(onCleanup: (cleanupFn: () => void) => void): void {
    if (typeof IntersectionObserver === 'undefined') {
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

            if (this.once() && this.firedEventKey() === this.eventKey()) {
              continue;
            }

            this.zone.run(() => this.sendOnce());

            if (this.once()) {
              observer?.disconnect();
              observer = null;
            }
          }
        },
        { threshold: 0.1 },
      );

      observer.observe(this.el.nativeElement);
    });

    onCleanup(() => {
      observer?.disconnect();
      observer = null;
    });
  }

  private eventKey(): string {
    return `${this.trackEvent().event}\u0000${this.trigger()}`;
  }

  private send(): void {
    const { event, data } = this.trackEvent();

    if (!event) {
      return;
    }

    this.trackingAdapter?.track(event, data);
  }
}
