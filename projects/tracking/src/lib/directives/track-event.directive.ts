import { AfterViewInit, Directive, ElementRef, inject, input, NgZone, OnDestroy } from '@angular/core';
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
export class TrackEventDirective implements AfterViewInit, OnDestroy {
  private readonly trackingAdapter = injectTrackingAdapter();
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  readonly trackEvent = input.required<TrackConfig>();

  private observer: IntersectionObserver | null = null;
  private viewHasFired = false;
  private hasFired = false;

  protected onClick(): void {
    if (this.trigger === 'click') {
      this.sendOnce();
    }
  }

  protected onMouseEnter(): void {
    if (this.trigger === 'hover') {
      this.sendOnce();
    }
  }

  ngAfterViewInit(): void {
    if (this.trigger !== 'view') {
      return;
    }

    // Gracefully no-op when IntersectionObserver is not available (e.g. some SSR/test runtimes).
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) {
              continue;
            }

            if (this.viewHasFired && this.once) {
              continue;
            }

            this.send();
            this.viewHasFired = true;

            if (this.once) {
              this.observer?.disconnect();
            }
          }
        },
        { threshold: 0.1 }
      );

      this.observer.observe(this.el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private get trigger() {
    return parseTriggerFromEvent(this.trackEvent().event);
  }

  private get once(): boolean {
    return this.trackEvent().once ?? this.trigger === 'view';
  }

  private sendOnce(): void {
    if (this.once && this.hasFired) {
      return;
    }

    this.hasFired = true;
    this.send();
  }

  private send(): void {
    const { event, data } = this.trackEvent();
    if (!event) {
      return;
    }

    this.trackingAdapter?.track(event, data);
  }
}
